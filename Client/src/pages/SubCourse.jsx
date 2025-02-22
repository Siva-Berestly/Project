import { useOutletContext, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { HiVolumeUp } from "react-icons/hi";
import VoiceCommandWidget from "../components/VoiceCommandWidget";
import VoiceRecognitionService from "../services/VoiceRecognitionService";
import generateSubCourseCommands from "../utils/subCourseCommands";

const SubCourse = () => {
    const { courseName } = useParams();
    const { isDarkMode } = useOutletContext();
    const navigate = useNavigate();
    const [highlightedText, setHighlightedText] = useState("");

    const [course, setCourse] = useState(null);
    const [commands, setCommands] = useState([]);
    const [lastOpenedStep, setLastOpenedStep] = useState(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/courses?name=${courseName}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setCourse(data[0]);
            } catch (error) {
                console.error('Error fetching course:', error);
            }
        };

        fetchCourse();
    }, [courseName]);

    const [selectedOption, setSelectedOption] = useState("text");
    const [openStep, setOpenStep] = useState(null);

    const toggleStep = (stepId) => {
        setLastOpenedStep(stepId);
        setOpenStep(openStep === stepId ? null : stepId);
    };

    const speakText = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        const words = text.split(" ");
        let wordIndex = 0;

        utterance.onboundary = (event) => {
            if (event.name === "word") {
                setHighlightedText(words[wordIndex]);
                wordIndex++;
            }
        };

        utterance.onend = () => setHighlightedText("");
        speechSynthesis.speak(utterance);
    };

    const readSteps = () => {
        const stepTitles = course.sections.flatMap(section => section.steps).map(step => step.title).join(", ");
        VoiceRecognitionService.speak(`The steps are: ${stepTitles}`);
    };

    const readStepText = (stepId) => {
        const targetId = stepId || (openStep !== null ? openStep : lastOpenedStep);
        console.log("readStepText called with targetId:", targetId);
        if (targetId !== null) {
            const step = course.sections
                .flatMap((section) => section.steps)
                .find((s) => String(s.id) === String(targetId));
            if (step) {
                console.log("Step found:", step);
                speakText(step.textContent);
            } else {
                console.log("Step not found for targetId:", targetId);
                VoiceRecognitionService.speak("Step not found.");
            }
        } else {
            console.log("No targetId provided or found.");
            VoiceRecognitionService.speak("Please open the step first.");
        }
    };

    useEffect(() => {
        if (course) {
            const allCommands = generateSubCourseCommands(
                course,
                navigate,
                VoiceRecognitionService,
                toggleStep,
                readStepText,
                readSteps
            );
            setCommands(allCommands);
        }
    }, [course, navigate]);

    const themeClasses = {
        card: isDarkMode ? 'bg-[#202124] text-white border-white' : 'bg-white text-[#202124] border-[#202124]',
        text: isDarkMode ? 'text-white' : 'text-[#202124]',
        scheduleText: isDarkMode ? 'text-gray-300' : 'text-gray-600',
        button: isDarkMode
            ? 'bg-[#202124] text-white border-white hover:bg-white hover:text-[#202124]'
            : 'bg-white text-[#202124] border-[#202124] hover:bg-[#202124] hover:text-white',
        accordionButton: isDarkMode
            ? 'bg-[#303134] text-white border-white hover:bg-[#404144] flex justify-between items-center'
            : 'bg-gray-100 text-[#202124] border-gray-300 hover:bg-gray-200 flex justify-between items-center',
        accordionContent: isDarkMode
            ? 'bg-[#303134] text-white border-white'
            : 'bg-gray-100 text-[#202124] border-gray-400',
        optionButton: 'px-4 py-2 border rounded-4xl mx-1 transition',
        activeOptionButton: isDarkMode
            ? 'bg-blue-700 border-white border-2 transition hover:bg-blue-600 text-white poppins-semibold mr-1'
            : 'bg-blue-700 border-white border-2 transition hover:bg-blue-600 text-white poppins-semibold mr-1',
        inactiveOptionButton: isDarkMode
            ? 'bg-[#303134] text-gray-400 poppins-semibold px-4 py-2 border rounded-4xl mx-1 transition'
            : 'bg-gray-100 text-gray-400 poppins-semibold px-4 py-2 border rounded-4xl mx-1 transition',
        ttsButton: isDarkMode
            ? 'bg-blue-700 text-white border-white hover:bg-blue-600 p-4 border rounded-4xl mx-1 text-xl font-bold'
            : 'bg-blue-700 text-white border-white hover:bg-blue-600 p-4 border rounded-4xl mx-1 text-xl font-bold',
    };

    if (!course) {
        return <p className={`text-center ${themeClasses.text}`}>Course not found</p>;
    }

    return (
        <>
            <VoiceCommandWidget commands={commands} />
            <section className="min-h-screen py-10">
                <div className="container mx-auto px-4">
                    <h3 className="text-2xl text-center mx-10 poppins-medium mb-5">{course.name}</h3>
                    <div className={`flex flex-col border p-4 rounded-lg ${themeClasses.text}`}>
                        <div className="mb-5">
                            {course.sections.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="mt-2">
                                    <p className="text-center poppins-medium text-lg">{section.name}</p>
                                    <div className="mt-3 mb-10">
                                        {section.steps.map((step, stepIndex) => (
                                            <div key={stepIndex} className="mt-3">
                                                <button
                                                    onClick={() => toggleStep(step.id)}
                                                    className={`w-full text-center px-4 py-2 border rounded-lg poppins-medium cursor-pointer transition ${themeClasses.accordionButton} ${openStep === step.id ? `${themeClasses.text}` : ''}`}
                                                >
                                                    {step.title}
                                                    <FaChevronDown className={`ml-2 transition-transform ${openStep === step.id ? 'rotate-180' : ''}`} />
                                                </button>
                                                {openStep === step.id && (
                                                    <div className={`mt-2 px-4 py-2 border rounded-lg transition ${themeClasses.accordionContent}`}>
                                                        <p className="poppins-medium p-2 text-center m-4">{step.description}</p>
                                                        <div className="flex justify-center mt-2">
                                                            <button
                                                                onClick={() => setSelectedOption('text')}
                                                                className={`${themeClasses.optionButton} ${selectedOption === 'text' ? themeClasses.activeOptionButton : themeClasses.inactiveOptionButton}`}
                                                            >
                                                                Text
                                                            </button>
                                                            <button
                                                                onClick={() => setSelectedOption('video')}
                                                                className={`${themeClasses.optionButton} ${selectedOption === 'video' ? themeClasses.activeOptionButton : themeClasses.inactiveOptionButton}`}
                                                            >
                                                                Video
                                                            </button>
                                                        </div>
                                                        <div className="mt-4">
                                                            {selectedOption === "text" ? (
                                                                <div>
                                                                    <div className="flex justify-center">
                                                                        <button
                                                                            onClick={() => speakText(step.textContent)}
                                                                            className={`${themeClasses.ttsButton}`}
                                                                        >
                                                                            <HiVolumeUp />
                                                                        </button>
                                                                    </div>
                                                                    <p className={`poppins-medium p-3`}>
                                                                        {step.textContent.split(" ").map((word, index) => (
                                                                            <span key={index} className={highlightedText === word ? 'bg-blue-500' : ''}>
                                                                                {word}{" "}
                                                                            </span>
                                                                        ))}
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <video controls src={step.videoUrl} className="mx-auto"></video>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default SubCourse;
