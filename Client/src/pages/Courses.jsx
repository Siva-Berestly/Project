import { useOutletContext, Link } from "react-router-dom";
import { useState } from "react";
import { FaPlus, FaMinus, FaUndo } from "react-icons/fa";

const Courses = () => {
    const { isDarkMode } = useOutletContext();
    const [zoomLevel, setZoomLevel] = useState(100);

    const increaseZoom = () => {
        setZoomLevel(prev => Math.min(prev + 10, 150));
    };

    const decreaseZoom = () => {
        setZoomLevel(prev => Math.max(prev - 10, 80));
    };

    const resetZoom = () => {
        setZoomLevel(100);
    };

    const courses = [
        {
            name: "Computer Science",
            sections: [
                {
                    name: "What is Internet?",
                    steps: [
                        {
                            id: 1,
                            title: 'Step 1',
                            description: 'Introduction to Full Stack Development',
                            textContent: 'This is step 1 content',
                            videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
                            status: 'current',
                        }
                    ]
                }
            ]
        }
    ];

    const themeClasses = {
        card: isDarkMode ? 'bg-[#202124] text-white border-white' : 'bg-white text-[#202124] border-[#202124]',
        text: isDarkMode ? 'text-white' : 'text-[#202124]',
        scheduleText: isDarkMode ? 'text-gray-300' : 'text-gray-600',
        button: isDarkMode
            ? 'bg-[#202124] text-white border-white hover:bg-white hover:text-[#202124]'
            : 'bg-white text-[#202124] border-[#202124] hover:bg-[#202124] hover:text-white',
    };

    return (
        <>
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

                    <h1 className={`text-3xl poppins-bold text-center mb-10 ${themeClasses.text}`}>Courses</h1>
                    {/* Quick Access Tools */}
                    <div className={`${themeClasses.card} border-1 p-6 rounded-lg mb-10`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {courses.map((course, index) => (
                                <div key={index} className={`flex flex-col border p-4 rounded-lg ${themeClasses.text}`}>
                                    <p className="text-center mx-10 poppins-medium mb-4">{course.name}</p>
                                    <Link to={`/subcourse/${course.name.toLowerCase()}`} className={`border-2 px-5 rounded-lg poppins-medium cursor-pointer mx-auto transition ${themeClasses.button}`}>
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

export default Courses
