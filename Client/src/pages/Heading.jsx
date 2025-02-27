import { useOutletContext, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import VoiceCommandWidget from "../components/VoiceCommandWidget";
import VoiceRecognitionService from "../services/VoiceRecognitionService";
import generateHeadingCommands from "../utils/headingCommands";
import { FaPlus, FaMinus, FaUndo } from "react-icons/fa";

const Heading = () => {
    const { courseName } = useParams();
    const { isDarkMode } = useOutletContext();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [commands, setCommands] = useState([]);
    const [zoomLevel, setZoomLevel] = useState(100);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/newcourses`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                const foundCourse = data.find(course => course.title.toLowerCase() === courseName.toLowerCase());
                setCourse(foundCourse);
            } catch (error) {
                console.error('Error fetching course:', error);
            }
        };

        fetchCourse();
    }, [courseName]);

    useEffect(() => {
        if (course) {
            const allCommands = generateHeadingCommands(
                course,
                navigate,
                VoiceRecognitionService
            );
            setCommands(allCommands);
        }
    }, [course, navigate]);

    useEffect(() => {
        const homeCommand = {
            keyword: ["go to home", "go to home page", "go home"],
            action: () => {
                navigate(`/`);
                VoiceRecognitionService.speak("Navigating to home page");
            },
            displayName: "go to home",
        };
        setCommands((prevCommands) => [...prevCommands, homeCommand]);
    }, [navigate]);

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
        card: isDarkMode ? 'bg-[#202124] text-white border-white' : 'bg-white text-[#202124] border-[#202124]',
        text: isDarkMode ? 'text-white' : 'text-[#202124]',
        static_button: isDarkMode
            ? 'bg-blue-700 border-white border-2 transition hover:bg-blue-600 text-white'
            : 'bg-blue-700 border-white border-2 transition hover:bg-blue-600 text-white',
    };

    if (!course) {
        return <p className={`text-center ${themeClasses.text}`}>Course not found</p>;
    }

    return (
        <>
            <VoiceCommandWidget commands={commands.filter(cmd => !cmd.displayName.startsWith("go to"))} />
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
                    <h3 className="text-2xl text-center mx-10 poppins-medium mb-5">{course.title}</h3>
                    <div className={`flex flex-col p-4 rounded-lg ${themeClasses.text}`}>
                        <div className="mb-5">
                            {course.sections.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="flex justify-around items-center border rounded-xl mt-2 mb-5 p-5">
                                    <p className="text-center poppins-medium text-lg">
                                        {sectionIndex + 1}. {section.heading}
                                    </p>
                                    <button
                                        onClick={() => navigate(`/coursecontent/${course.id}/${section.hid}`)}
                                        className={`w-auto text-center px-4 py-2 border rounded-lg poppins-medium cursor-pointer transition ${themeClasses.static_button}`}
                                    >
                                        View Content
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Heading;
