import { useOutletContext, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaPlus, FaMinus, FaUndo } from "react-icons/fa";
import VoiceCommandWidget from "../components/VoiceCommandWidget";
import VoiceRecognitionService from "../services/VoiceRecognitionService";
import generateCourseCommands from "../utils/courseCommands";

const Courses = () => {
    const { isDarkMode } = useOutletContext();
    const navigate = useNavigate();
    const [zoomLevel, setZoomLevel] = useState(100);
    const [courses, setCourses] = useState([]);
    const [commands, setCommands] = useState([]);

    const increaseZoom = () => {
        setZoomLevel(prev => Math.min(prev + 10, 150));
    };

    const decreaseZoom = () => {
        setZoomLevel(prev => Math.max(prev - 10, 80));
    };

    const resetZoom = () => {
        setZoomLevel(100);
    };

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/newcourses');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setCourses(data);
                // Generate course-specific commands
                const allCommands = generateCourseCommands(data, navigate, VoiceRecognitionService);
                setCommands(allCommands.filter(cmd => cmd.displayName !== "go to courses"));
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };

        fetchCourses();
    }, [navigate]);

    const themeClasses = {
        card: isDarkMode ? 'bg-[#202124] text-white border-white' : 'bg-white text-[#202124] border-[#202124]',
        text: isDarkMode ? 'text-white' : 'text-[#202124]',
        scheduleText: isDarkMode ? 'text-gray-300' : 'text-gray-600',
        button: isDarkMode
            ? 'bg-[#202124] text-white border-white hover:bg-white hover:text-[#202124]'
            : 'bg-white text-[#202124] border-[#202124] hover:bg-[#202124] hover:text-white',
        static_button: isDarkMode
            ? 'bg-blue-700 border-white border-2 transition hover:bg-blue-600 text-white'
            : 'bg-blue-700 border-white border-2 transition hover:bg-blue-600 text-white',
        activeOptionButton: isDarkMode
            ? 'bg-blue-700 border-white border-2 transition hover:bg-blue-600 text-white'
            : 'bg-blue-700 border-white border-2 transition hover:bg-blue-600 text-white',
    };

    return (
        <>
            <VoiceCommandWidget commands={commands} />
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
                    <h1 className={`text-3xl poppins-bold text-center mb-10 ${themeClasses.text}`}>Courses</h1>
                    {/* Quick Access Tools */}
                    <div className={`${themeClasses.card} border-1 p-6 rounded-lg mb-10`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {courses.map((course, index) => (
                                <div key={index} className={`flex flex-col border p-4 rounded-lg ${themeClasses.text}`}>
                                    <p className="text-lg text-center mx-10 poppins-medium mb-4">{course.title}</p>
                                    <Link to={`/heading/${course.title.toLowerCase()}`} className={`p-2 px-5 rounded-4xl poppins-semibold cursor-pointer mx-auto ${themeClasses.static_button}`}>
                                        Start Learning
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Courses;
