import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { HiVolumeUp } from "react-icons/hi";
import { IoPlay } from "react-icons/io5";
import { IoMdPause } from "react-icons/io";
import { FaPlus, FaMinus, FaUndo, FaStop } from "react-icons/fa";
import VoiceCommandWidget from "../components/VoiceCommandWidget";
import VoiceRecognitionService from "../services/VoiceRecognitionService";
import TextToSpeechService from "../services/TextToSpeechService";
import generateCourseContentCommands from "../utils/courseContentCommands";

const CourseContent = () => {
    const { courseId, headingId } = useParams();
    const navigate = useNavigate();
    const [section, setSection] = useState(null);
    const { isDarkMode } = useOutletContext();
    const [selectedOption, setSelectedOption] = useState("text");
    const [highlightedSentenceIndex, setHighlightedSentenceIndex] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(100);
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

    const pauseSpeech = async () => {
        if (TextToSpeechService.isSpeakingNow()) {
            TextToSpeechService.pause();
            return true;
        }
        return false;
    };

    const resumeSpeech = async () => {
        if (TextToSpeechService.isPausedNow()) {
            TextToSpeechService.resume();
            return true;
        }
        return false;
    };

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

    const increaseZoom = () => {
        setZoomLevel(prev => Math.min(prev + 10, 150));
    };

    const decreaseZoom = () => {
        setZoomLevel(prev => Math.max(prev - 10, 80));
    };

    const resetZoom = () => {
        setZoomLevel(100);
    };

    const themeClasses = {
        button: isDarkMode
            ? 'bg-[#202124] text-white border-white hover:bg-white hover:text-[#202124]'
            : 'bg-white text-[#202124] border-[#202124] hover:bg-[#202124] hover:text-white',
    };

    const renderVideoContent = (vcontent) => {
        if (vcontent.includes("youtube.com") || vcontent.includes("youtu.be")) {
            const videoId = vcontent.split("v=")[1] || vcontent.split("/").pop();
            const embedUrl = `https://www.youtube.com/embed/${videoId}`;
            return (
                <div className="mx-auto flex justify-center mt-10 rounded-lg overflow-hidden shadow-lg">
                    <iframe width="800" height="450" src={embedUrl} frameBorder="0" allowFullScreen className="rounded-lg"></iframe>
                </div>
            );
        } else {
            return <video controls src={vcontent} className="mx-auto rounded-lg"></video>;
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
            {!isAudioInitialized && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded z-50">
                    <p className="font-bold">Voice commands require user interaction</p>
                    <p className="text-sm">Click anywhere on the page or this message to enable voice features</p>
                </div>
            )}
            <section className="py-10" style={{ zoom: `${zoomLevel}%` }}>
                <div className="container mx-auto px-4">
                    <div className="flex justify-end mb-4">
                        <button onClick={decreaseZoom} className="p-2 border rounded-lg mx-1">
                            <FaMinus />
                        </button>
                        <button onClick={resetZoom} className="p-2 border rounded-lg mx-1">
                            <FaUndo />
                        </button>
                        <button onClick={increaseZoom} className="p-2 border rounded-lg mx-1">
                            <FaPlus />
                        </button>
                    </div>
                    <h3 className="text-2xl text-center mx-10 poppins-medium mb-5">{section.heading}</h3>
                    <div className="flex justify-center mt-2">
                        <button
                            onClick={() => setSelectedOption('text')}
                            className={`px-4 py-2 poppins-semibold border-2 rounded-lg mx-1 transition ${selectedOption === 'text' ? 'bg-blue-700 text-white' : themeClasses.button}`}
                        >
                            Text
                        </button>
                        <button
                            onClick={() => setSelectedOption('video')}
                            className={`px-4 py-2 poppins-semibold border-2 rounded-lg mx-1 transition ${selectedOption === 'video' ? 'bg-blue-700 text-white' : themeClasses.button}`}
                        >
                            Video
                        </button>
                    </div>
                    <div className="mt-4">
                        {selectedOption === "text" ? (
                            <div>
                                <div className="flex justify-center">
                                    {!isSpeaking ? (
                                        <button
                                            onClick={() => speakText(section.tcontent)}
                                            className="bg-blue-700 text-white border-white hover:bg-blue-600 p-4 border-2 rounded-4xl mx-1 text-xl font-bold"
                                        >
                                            <HiVolumeUp />
                                        </button>
                                    ) : (
                                        showSpeechControls && (
                                            <>
                                                <button
                                                    onClick={isPaused ? resumeSpeech : pauseSpeech}
                                                    className="bg-blue-700 text-white border-white hover:bg-blue-600 p-4 border-2 rounded-4xl mx-1 text-xl font-bold"
                                                >
                                                    {isPaused ? <IoPlay /> : <IoMdPause />}
                                                </button>
                                                <button
                                                    onClick={restartSpeech}
                                                    className="bg-blue-700 text-white border-white hover:bg-blue-600 p-4 border-2 rounded-4xl mx-1 text-xl font-bold"
                                                >
                                                    <HiVolumeUp />
                                                </button>
                                                <button
                                                    ref={stopButtonRef}
                                                    onClick={stopSpeech}
                                                    className="bg-blue-700 text-white border-white hover:bg-blue-600 p-4 border-2 rounded-4xl mx-1 text-xl font-bold"
                                                >
                                                    <FaStop />
                                                </button>
                                            </>
                                        )
                                    )}
                                </div>
                                <div className="border p-5 rounded-lg mt-5">
                                    <ul className="list-disc pl-5">
                                        {section.tcontent.split(". ").map((sentence, index) => (
                                            <li key={index} className="poppins-medium p-3 text-lg">
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
                            renderVideoContent(section.vcontent)
                        )}
                    </div>
                </div>
            </section>
        </>
    )
}

export default CourseContent;
