import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { HiVolumeUp, HiPause, HiPlay, HiStop } from "react-icons/hi";
import { FaPlus, FaMinus, FaUndo } from "react-icons/fa";
import VoiceCommandWidget from "../components/VoiceCommandWidget";
import VoiceRecognitionService from "../services/VoiceRecognitionService";
import generateCourseContentCommands from "../utils/courseContentCommands";

const CourseContent = () => {
    const { courseId, headingId } = useParams();
    const navigate = useNavigate();
    const [section, setSection] = useState(null);
    const { isDarkMode } = useOutletContext();
    const [selectedOption, setSelectedOption] = useState("text");
    const [highlightedText, setHighlightedText] = useState("");
    const [highlightedSentenceIndex, setHighlightedSentenceIndex] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(100);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [showSpeechControls, setShowSpeechControls] = useState(false);
    const utteranceRef = useRef(null);
    const [commands, setCommands] = useState([]);

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
        if (section) {
            const { baseCommands } = generateCourseContentCommands(
                section,
                navigate,
                VoiceRecognitionService,
                speakText,
                pauseSpeech,
                resumeSpeech,
                restartSpeech
            );
            setCommands(baseCommands);
        }
    }, [section, navigate]);

    const speakText = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;
        const sentences = text.split(". ");
        let sentenceIndex = 0;
        let wordIndex = 0;

        utterance.onboundary = (event) => {
            if (event.name === "word") {
                const words = sentences[sentenceIndex].split(" ");
                setHighlightedText(words[wordIndex]);
                setHighlightedSentenceIndex(sentenceIndex);
                wordIndex++;
                if (wordIndex >= words.length) {
                    wordIndex = 0;
                    sentenceIndex++;
                }
            }
        };

        utterance.onend = () => {
            setHighlightedText("");
            setHighlightedSentenceIndex(0);
            setIsSpeaking(false);
            setIsPaused(false);
            setShowSpeechControls(false);
            const { baseCommands } = generateCourseContentCommands(
                section,
                navigate,
                VoiceRecognitionService,
                speakText,
                pauseSpeech,
                resumeSpeech,
                restartSpeech
            );
            setCommands(baseCommands);
        };

        speechSynthesis.speak(utterance);
        setIsSpeaking(true);
        setIsPaused(false);
        setShowSpeechControls(true);
        const { readingCommands } = generateCourseContentCommands(
            section,
            navigate,
            VoiceRecognitionService,
            speakText,
            pauseSpeech,
            resumeSpeech,
            restartSpeech
        );
        setCommands(readingCommands);
    };

    const pauseSpeech = () => {
        speechSynthesis.pause();
        setIsPaused(true);
    };

    const resumeSpeech = () => {
        speechSynthesis.resume();
        setIsPaused(false);
    };

    const stopSpeech = () => {
        speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
        setHighlightedText("");
        setHighlightedSentenceIndex(0);
        const { baseCommands } = generateCourseContentCommands(
            section,
            navigate,
            VoiceRecognitionService,
            speakText,
            pauseSpeech,
            resumeSpeech,
            restartSpeech
        );
        setCommands(baseCommands);
    };

    const restartSpeech = () => {
        if (utteranceRef.current) {
            speechSynthesis.cancel();
            speakText(utteranceRef.current.text);
        }
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
                <div className="mx-auto flex justify-center mt-10 w-auto">
                    <iframe width="560" height="315" src={embedUrl} frameBorder="0" allowFullScreen></iframe>
                </div>
            );
        } else {
            return <video controls src={vcontent} className="mx-auto"></video>;
        }
    };

    if (!section) {
        return <p className="text-center">Section not found</p>;
    }

    return (
        <>
            <VoiceCommandWidget commands={commands} />
            <section className="min-h-screen py-10" style={{ zoom: `${zoomLevel}%` }}>
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
                                                    {isPaused ? <HiPlay /> : <HiPause />}
                                                </button>
                                                <button
                                                    onClick={restartSpeech}
                                                    className="bg-blue-700 text-white border-white hover:bg-blue-600 p-4 border-2 rounded-4xl mx-1 text-xl font-bold"
                                                >
                                                    <HiVolumeUp />
                                                </button>
                                                <button
                                                    onClick={stopSpeech}
                                                    className="bg-blue-700 text-white border-white hover:bg-blue-600 p-4 border-2 rounded-4xl mx-1 text-xl font-bold"
                                                >
                                                    <HiStop />
                                                </button>
                                            </>
                                        )
                                    )}
                                </div>
                                <div className="border p-5 rounded-lg mt-5">
                                    <ul className="list-disc pl-5">
                                        {section.tcontent.split(". ").map((sentence, index) => (
                                            <li key={index} className="poppins-medium p-3 text-lg">
                                                {sentence.split(" ").map((word, wordIndex) => (
                                                    <span key={wordIndex} className={highlightedText === word && highlightedSentenceIndex === index ? 'bg-blue-500' : ''}>
                                                        {word}{" "}
                                                    </span>
                                                ))}
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
