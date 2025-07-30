import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { HiVolumeUp } from "react-icons/hi";
import { IoPlay } from "react-icons/io5";
import { IoMdPause } from "react-icons/io";
import { FaStop } from "react-icons/fa";
import VoiceCommandWidget from "../components/VoiceCommandWidget";
import VoiceRecognitionService from "../services/VoiceRecognitionService";
import TextToSpeechService from "../services/TextToSpeechService";
import generateCourseContentCommands from "../utils/courseContentCommands";

const CourseContent = () => {
    const { courseId, headingId } = useParams();
    const navigate = useNavigate();
    const [section, setSection] = useState(null);
    const { isDarkMode, textSize } = useOutletContext();
    const [selectedOption, setSelectedOption] = useState("text");
    const [highlightedSentenceIndex, setHighlightedSentenceIndex] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [showSpeechControls, setShowSpeechControls] = useState(false);
    const [commands, setCommands] = useState([]);
    const voiceRecognitionStateRef = useRef({ active: false });
    const currentCommandsRef = useRef([]);
    const stopButtonRef = useRef(null);
    const [isAudioInitialized, setIsAudioInitialized] = useState(false);
    const [currentWordIndex, setCurrentWordIndex] = useState(null);
    const splittedTextRef = useRef([]);

    useEffect(() => {
        const fetchSection = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/newcourses/${courseId}/sections/${headingId}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setSection(data);
            } catch (error) {
                console.error('Error fetching section:', error);
            }
        };

        fetchSection();
    }, [courseId, headingId]);

    useEffect(() => {
        if (section && section.tcontent) {
            // Capture each sentence with possible punctuation
            splittedTextRef.current = section.tcontent.match(/[^.!?]+[.!?]|[^.!?]+$/g) || [];
        }
    }, [section]);

    const initAudioOnUserInteraction = async () => {
        try {
            await TextToSpeechService.initAudio();
            await VoiceRecognitionService.initAudio();

            // Make services accessible globally
            window.TextToSpeechService = TextToSpeechService;
            window.VoiceRecognitionService = VoiceRecognitionService;

            setIsAudioInitialized(true);
            console.log("Audio initialized successfully");
        } catch (error) {
            console.error("Failed to initialize audio:", error);
        }
    };

    useEffect(() => {
        // Try to initialize audio automatically
        initAudioOnUserInteraction();

        // Add a document-wide click handler to initialize audio on user interaction
        const handleUserInteraction = () => {
            if (!isAudioInitialized) {
                initAudioOnUserInteraction();
            }
        };

        document.addEventListener('click', handleUserInteraction);
        document.addEventListener('keydown', handleUserInteraction);

        return () => {
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
        };
    }, [isAudioInitialized]);

    useEffect(() => {
        // Set up the text-to-speech callbacks
        TextToSpeechService.registerCallbacks({
            onStart: () => {
                // Only save voice recognition state if we're actually starting a new reading
                if (!isSpeaking) {
                    // Store voice recognition state before pausing
                    voiceRecognitionStateRef.current = {
                        active: VoiceRecognitionService.isListening,
                        isCommandsActive: VoiceRecognitionService.isCommandsActive()
                    };
                }

                // Don't stop voice recognition - we want commands to still work
                // Just update commands to reading-specific ones

                setIsSpeaking(true);
                setIsPaused(false);
                setShowSpeechControls(true);

                if (section) {
                    const { readingCommands } = generateCourseContentCommands(
                        section,
                        navigate,
                        VoiceRecognitionService,
                        speakText,
                        pauseSpeech,
                        resumeSpeech,
                        restartSpeech,
                        stopSpeech
                    );
                    setCommands(readingCommands);
                    currentCommandsRef.current = readingCommands;
                }
            },
            onEnd: () => {
                setHighlightedSentenceIndex(0);
                setIsSpeaking(false);
                setIsPaused(false);
                setShowSpeechControls(false);
                setCurrentWordIndex(null);

                if (section) {
                    const { baseCommands } = generateCourseContentCommands(
                        section,
                        navigate,
                        VoiceRecognitionService,
                        speakText,
                        pauseSpeech,
                        resumeSpeech,
                        restartSpeech,
                        stopSpeech
                    );
                    setCommands(baseCommands);
                    currentCommandsRef.current = baseCommands;
                }
            },
            onPause: () => {
                setIsPaused(true);
            },
            onResume: () => {
                setIsPaused(false);
            },
            onBoundary: (event) => {
                if (!event || event.name !== "word") return;

                setTimeout(() => {
                    try {
                        const sentences = splittedTextRef.current;
                        let totalChars = 0;
                        let currentSentenceIndex = null;
                        let currentWord = null;
                        let currentWordIndexInSentence = null;

                        for (let i = 0; i < sentences.length; i++) {
                            const words = sentences[i].split(" ");
                            const sentenceLength = sentences[i].length + 2;

                            if (totalChars + sentenceLength > event.charIndex) {
                                currentSentenceIndex = i;
                                let wordCharCount = 0;
                                for (let j = 0; j < words.length; j++) {
                                    const wordLength = words[j].length + 1;
                                    if (wordCharCount + totalChars + wordLength > event.charIndex) {
                                        currentWord = words[j];
                                        currentWordIndexInSentence = j;
                                        break;
                                    }
                                    wordCharCount += wordLength;
                                }
                                break;
                            }
                            totalChars += sentenceLength;
                        }

                        // Update state only if a word is found
                        if (currentWord !== null && currentSentenceIndex !== null) {
                            setHighlightedSentenceIndex(currentSentenceIndex);
                            setCurrentWordIndex(currentWordIndexInSentence);
                        }
                    } catch (err) {
                        console.error("Error highlighting text:", err);
                    }
                }, 0);
            }
        });

        // Add special handling for the "stop reading completely" command
        const handleStopCompletely = async (transcript) => {
            if (isSpeaking &&
                (transcript.includes("stop completely") ||
                    transcript.includes("stop reading") ||
                    transcript.includes("end reading") ||
                    transcript.includes("finish reading") ||
                    transcript.includes("terminate reading"))) {
                if (stopButtonRef.current) {
                    stopButtonRef.current.click(); // Simulate clicking the stop button
                }
            }
        };

        const originalOnResult = VoiceRecognitionService.callbacks.onResult;
        VoiceRecognitionService.subscribe({
            onResult: (transcript) => {
                if (originalOnResult) originalOnResult(transcript);
                handleStopCompletely(transcript);
            }
        });

        return () => {
            // Clean up
            TextToSpeechService.stop();
        };
    }, []);

    useEffect(() => {
        if (section) {
            const cmds = generateCourseContentCommands(
                section,
                navigate,
                VoiceRecognitionService,
                speakText,
                pauseSpeech,
                resumeSpeech,
                restartSpeech,
                stopSpeech
            );

            // Use the appropriate commands based on current state
            const newCommands = isSpeaking ? cmds.readingCommands : cmds.baseCommands;
            setCommands(newCommands);
            currentCommandsRef.current = newCommands;
        }
    }, [section, navigate, isSpeaking]);

    const speakText = (text) => {
        // If audio is not initialized, try to initialize it first
        if (!isAudioInitialized) {
            initAudioOnUserInteraction().then(() => {
                TextToSpeechService.speak(text);
            });
        } else {
            // Audio is ready, proceed with speaking
            TextToSpeechService.speak(text);
        }
    };

    const pauseSpeech = useCallback(async () => {
        if (TextToSpeechService.isSpeakingNow()) {
            TextToSpeechService.pause();
            return true;
        }
        return false;
    }, []);

    const resumeSpeech = useCallback(async () => {
        if (TextToSpeechService.isPausedNow()) {
            TextToSpeechService.resume();
            return true;
        }
        return false;
    }, []);

    const stopSpeech = async () => {
        if (TextToSpeechService.isSpeakingNow()) {
            TextToSpeechService.stop();
        }
        setHighlightedSentenceIndex(0); // Reset sentence index
        setIsSpeaking(false); // Ensure speaking state is reset
        setShowSpeechControls(false); // Hide speech controls
    };

    const restartSpeech = () => {
        TextToSpeechService.restart();
    };

    // Add keyboard controls for text-to-speech: spacebar, shift+spacebar, ctrl+spacebar, escape
    useEffect(() => {
        const handleKeyboardControls = (event) => {
            // Only handle when text is being read
            if (!isSpeaking) return;

            if (event.code === 'Space') {
                event.preventDefault();
                event.stopPropagation();

                if (event.shiftKey) {
                    // Shift + Spacebar: Restart from beginning
                    // Stop current reading first to avoid conflicts
                    TextToSpeechService.stop();
                    setIsSpeaking(false);
                    setIsPaused(false);

                    // Give feedback using a clean voice service call
                    setTimeout(() => {
                        const utterance = new SpeechSynthesisUtterance("Restarting from beginning");
                        utterance.rate = 0.8;
                        utterance.onend = () => {
                            // After feedback completes, restart the reading
                            setTimeout(() => {
                                restartSpeech();
                            }, 200);
                        };
                        speechSynthesis.speak(utterance);
                    }, 100);
                } else if (event.ctrlKey || event.metaKey) {
                    // Ctrl + Spacebar (or Cmd + Spacebar on Mac): Stop reading
                    stopSpeech();
                    setTimeout(() => {
                        VoiceRecognitionService.speak("Reading stopped");
                    }, 100);
                } else {
                    // Spacebar only: Pause/Resume
                    if (isPaused) {
                        // For resume, don't interfere with speechSynthesis state
                        // Just provide quick feedback and resume
                        console.log("Attempting to resume...");

                        // Use VoiceRecognitionService for feedback to avoid interfering with speechSynthesis
                        VoiceRecognitionService.speak("Resuming reading");

                        // Small delay then resume
                        setTimeout(() => {
                            if (TextToSpeechService.isPausedNow()) {
                                resumeSpeech();
                            } else {
                                console.log("Not in paused state, restarting instead");
                                restartSpeech();
                            }
                        }, 1000); // Wait for feedback to mostly complete
                    } else {
                        pauseSpeech();
                        setTimeout(() => {
                            VoiceRecognitionService.speak("Paused reading. Voice commands deactivated.");
                            // Deactivate voice recognition
                            if (VoiceRecognitionService.isListening) {
                                VoiceRecognitionService.stop();
                            }
                            // Clear current commands to hide widget
                            setCommands([]);
                        }, 100);
                    }
                }

                return false; // Prevent any further processing
            } else if (event.code === 'Escape') {
                // Escape key: Stop reading completely
                event.preventDefault();
                event.stopPropagation();
                stopSpeech();
                setTimeout(() => {
                    VoiceRecognitionService.speak("Reading stopped");
                }, 100);
                return false;
            }
        };

        // Add event listener to document for global capture, use capture phase
        document.addEventListener('keydown', handleKeyboardControls, true);

        // Cleanup function
        return () => {
            document.removeEventListener('keydown', handleKeyboardControls, true);
        };
    }, [isSpeaking, isPaused, resumeSpeech, pauseSpeech]); // Include functions in dependencies

    const themeClasses = {
        button: isDarkMode
            ? 'bg-[#202124] text-white border-white hover:bg-white hover:text-[#202124]'
            : 'bg-white text-[#202124] border-[#202124] hover:bg-[#202124] hover:text-white',
    };

    const renderVideoContent = (vcontent) => {
        // Check if video content exists and is not empty
        if (!vcontent || vcontent.trim() === '') {
            return (
                <div className="mx-auto flex justify-center mt-6 sm:mt-10 w-full max-w-4xl">
                    <div className="text-center p-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <p className={`text-lg poppins-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            No videos available
                        </p>
                    </div>
                </div>
            );
        }

        if (vcontent.includes("youtube.com") || vcontent.includes("youtu.be")) {
            const videoId = vcontent.split("v=")[1] || vcontent.split("/").pop();
            const embedUrl = `https://www.youtube.com/embed/${videoId}`;
            return (
                <div className="mx-auto flex justify-center mt-6 sm:mt-10 w-full max-w-4xl">
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
                        <iframe
                            className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                            src={embedUrl}
                            frameBorder="0"
                            allowFullScreen
                            title="Course Video"
                        />
                    </div>
                </div>
            );
        } else {
            return (
                <div className="mx-auto flex justify-center mt-6 sm:mt-10 w-full max-w-4xl">
                    <video
                        controls
                        src={vcontent}
                        className="w-full h-auto rounded-lg shadow-lg max-h-96 sm:max-h-[450px]"
                    />
                </div>
            );
        }
    };

    if (!section) {
        return (
            <div className="text-center p-10">
                <p className="mb-5">Section not found or loading...</p>
                <button
                    onClick={initAudioOnUserInteraction}
                    className="bg-blue-700 text-white px-4 py-2 rounded"
                >
                    Enable Voice Commands (Click here first)
                </button>
            </div>
        );
    }

    return (
        <>
            <VoiceCommandWidget commands={commands} />
            <section className="py-4 px-2 sm:py-6 sm:px-4 lg:py-10 lg:px-6 w-full max-w-full overflow-x-hidden">
                <div className="w-full max-w-7xl mx-auto">
                    <h1 className={`text-2xl sm:text-3xl lg:text-4xl poppins-bold text-center mb-8 sm:mb-10 ${themeClasses.text} ${textSize} break-words`}>
                        {section.heading}
                    </h1>
                    <div className="flex justify-center mt-2 gap-2 flex-wrap">
                        <button
                            onClick={() => setSelectedOption('text')}
                            className={`px-3 py-2 sm:px-4 sm:py-2 poppins-semibold border-2 rounded-lg transition text-sm sm:text-base ${selectedOption === 'text' ? 'bg-blue-700 text-white' : themeClasses.button}`}
                        >
                            Text
                        </button>
                        <button
                            onClick={() => setSelectedOption('video')}
                            className={`px-3 py-2 sm:px-4 sm:py-2 poppins-semibold border-2 rounded-lg transition text-sm sm:text-base ${selectedOption === 'video' ? 'bg-blue-700 text-white' : themeClasses.button}`}
                        >
                            Video
                        </button>
                    </div>
                    <div className="mt-4 w-full">
                        {selectedOption === "text" ? (
                            <div className="w-full">
                                <div className="flex justify-center mb-4">
                                    {!isSpeaking ? (
                                        <button
                                            onClick={() => speakText(section.tcontent)}
                                            className="bg-blue-700 text-white border-white hover:bg-blue-600 p-3 sm:p-4 border-2 rounded-4xl text-lg sm:text-xl font-bold"
                                        >
                                            <HiVolumeUp />
                                        </button>
                                    ) : (
                                        showSpeechControls && (
                                            <div className="flex gap-2 flex-wrap justify-center">
                                                <button
                                                    onClick={isPaused ? resumeSpeech : pauseSpeech}
                                                    className="bg-blue-700 text-white border-white hover:bg-blue-600 p-3 sm:p-4 border-2 rounded-4xl text-lg sm:text-xl font-bold"
                                                >
                                                    {isPaused ? <IoPlay /> : <IoMdPause />}
                                                </button>
                                                <button
                                                    onClick={restartSpeech}
                                                    className="bg-blue-700 text-white border-white hover:bg-blue-600 p-3 sm:p-4 border-2 rounded-4xl text-lg sm:text-xl font-bold"
                                                >
                                                    <HiVolumeUp />
                                                </button>
                                                <button
                                                    ref={stopButtonRef}
                                                    onClick={stopSpeech}
                                                    className="bg-blue-700 text-white border-white hover:bg-blue-600 p-3 sm:p-4 border-2 rounded-4xl text-lg sm:text-xl font-bold"
                                                >
                                                    <FaStop />
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>
                                <div className="border border-gray-300 dark:border-gray-600 p-3 sm:p-5 rounded-lg mt-5 w-full max-w-full overflow-x-hidden">
                                    <ul className="list-disc pl-3 sm:pl-5 space-y-2">
                                        {section.tcontent.split(". ").map((sentence, index) => (
                                            <li key={index} className={`poppins-medium p-2 sm:p-3 ${textSize} break-words leading-relaxed`}>
                                                {sentence.split(" ").map((word, wordIndex) => {
                                                    const isHighlighted =
                                                        highlightedSentenceIndex === index && wordIndex === currentWordIndex;
                                                    return (
                                                        <span
                                                            key={wordIndex}
                                                            className={isHighlighted ? 'bg-blue-400 text-white rounded px-1' : ''}
                                                        >
                                                            {word}{" "}
                                                        </span>
                                                    );
                                                })}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full max-w-full overflow-x-hidden">
                                {renderVideoContent(section.vcontent)}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    )
}

export default CourseContent;
