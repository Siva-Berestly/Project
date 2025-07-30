import { useOutletContext, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import VoiceCommandWidget from "../components/VoiceCommandWidget";
import VoiceRecognitionService from "../services/VoiceRecognitionService";
import generateCourseCommands from "../utils/courseCommands";

const Courses = () => {
    const { isDarkMode, textSize } = useOutletContext();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [commands, setCommands] = useState([]);

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
            <section className="py-6 sm:py-10 w-full overflow-x-hidden">
                <div className="w-full max-w-7xl mx-auto px-4">
                    <h1 className={`text-2xl sm:text-3xl lg:text-4xl poppins-bold text-center mb-8 sm:mb-10 ${themeClasses.text} ${textSize} break-words`}>
                        Courses
                    </h1>
                    {/* Course Grid */}
                    <div className={`${themeClasses.card} border-1 p-4 sm:p-6 rounded-lg mb-6 sm:mb-10 w-full max-w-full`}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {courses.map((course, index) => (
                                <div key={index} className={`flex flex-col border p-4 sm:p-6 rounded-lg ${themeClasses.text} w-full max-w-full`}>
                                    <p className={`text-center mx-2 sm:mx-4 lg:mx-10 poppins-medium mb-4 ${textSize} break-words leading-relaxed`}>
                                        {course.title}
                                    </p>
                                    <Link
                                        to={`/heading/${course.title.toLowerCase()}`}
                                        className={`p-2 px-3 sm:px-5 rounded-4xl poppins-semibold cursor-pointer mx-auto text-center text-sm sm:text-base ${themeClasses.static_button}`}
                                    >
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
