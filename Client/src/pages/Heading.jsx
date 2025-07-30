import { useOutletContext, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import VoiceCommandWidget from "../components/VoiceCommandWidget";
import VoiceRecognitionService from "../services/VoiceRecognitionService";
import generateHeadingCommands from "../utils/headingCommands";

const Heading = () => {
    const { courseName } = useParams();
    const { isDarkMode, textSize } = useOutletContext();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [commands, setCommands] = useState([]);

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
            <section className="py-6 sm:py-10 w-full overflow-x-hidden">
                <div className="w-full max-w-7xl mx-auto px-4">
                    <h1 className={`text-2xl sm:text-3xl lg:text-4xl poppins-bold text-center mb-8 sm:mb-10 ${themeClasses.text} ${textSize} break-words`}>
                        {course.title}
                    </h1>
                    <div className={`flex flex-col p-4 sm:p-6 rounded-lg ${themeClasses.text} w-full max-w-full`}>
                        <div className="mb-5">
                            {course.sections.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="flex flex-col sm:grid sm:grid-cols-3 border rounded-xl mt-2 mb-5 p-4 sm:p-5 gap-4 sm:gap-0 w-full max-w-full overflow-x-hidden">
                                    <div className="sm:col-span-2 flex items-center sm:ms-[20%] justify-center sm:justify-start">
                                        <p className={`poppins-medium text-center sm:text-left ${textSize} break-words leading-relaxed`}>
                                            {sectionIndex + 1}. {section.heading}
                                        </p>
                                    </div>
                                    <div className="sm:col-span-1 flex justify-center">
                                        <button
                                            onClick={() => navigate(`/coursecontent/${course.id}/${section.hid}`)}
                                            className={`w-full max-w-[150px] text-center px-3 py-2 sm:px-4 sm:py-2 border rounded-lg poppins-medium cursor-pointer transition text-sm sm:text-base ${themeClasses.static_button}`}
                                        >
                                            View Content
                                        </button>
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

export default Heading;
