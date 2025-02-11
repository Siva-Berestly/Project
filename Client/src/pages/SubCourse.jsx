import { useOutletContext, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaPlus, FaMinus, FaUndo } from "react-icons/fa";

const SubCourse = () => {
    const { courseName } = useParams();
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

    const [course, setCourse] = useState(null);

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
        setOpenStep(openStep === stepId ? null : stepId);
    };

    const themeClasses = {
        card: isDarkMode ? 'bg-[#202124] text-white border-white' : 'bg-white text-[#202124] border-[#202124]',
        text: isDarkMode ? 'text-white' : 'text-[#202124]',
        scheduleText: isDarkMode ? 'text-gray-300' : 'text-gray-600',
        button: isDarkMode
            ? 'bg-[#202124] text-white border-white hover:bg-white hover:text-[#202124]'
            : 'bg-white text-[#202124] border-[#202124] hover:bg-[#202124] hover:text-white',
    };

    if (!course) {
        return <p className={`text-center ${themeClasses.text}`}>Course not found</p>;
    }

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

                    <h3 className="text-xl text-center mx-10 poppins-medium mb-5">{course.name}</h3>
                    <div className={`flex flex-col border p-4 rounded-lg ${themeClasses.text}`}>
                        <div className="mb-5">
                            {course.sections.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="mt-2">
                                    <p className="text-center poppins-medium">{section.name}</p>
                                    <div className="mt-3 mb-10">
                                        {section.steps.map((step, stepIndex) => (
                                            <div key={stepIndex} className="mt-3">
                                                <button
                                                    onClick={() => toggleStep(step.id)}
                                                    className={`w-full text-center px-4 py-2 border rounded-lg poppins-medium cursor-pointer transition ${themeClasses.button} ${openStep === step.id ? `${themeClasses.text}` : ''}`}
                                                >
                                                    {step.title}
                                                </button>
                                                {openStep === step.id && (
                                                    <div className="mt-2 px-4 py-2 border rounded-lg">
                                                        <p>{step.description}</p>
                                                        <div className="flex justify-center mt-2">
                                                            <div
                                                                onClick={() => setSelectedOption('text')}
                                                                className={`w-full flex justify-center text-gray-400 cursor-pointer ${selectedOption === 'text' ? 'text-slate-600 font-semibold' : ''}`}
                                                            >
                                                                <button>Text</button>
                                                            </div>
                                                            <div
                                                                onClick={() => setSelectedOption('video')}
                                                                className={`w-full flex justify-center text-gray-400 cursor-pointer ${selectedOption === 'video' ? 'text-slate-600 font-semibold' : ''}`}
                                                            >
                                                                <button>Video</button>
                                                            </div>
                                                        </div>
                                                        <div className="mt-4">
                                                            {selectedOption === "text" ? (
                                                                <p>{step.textContent}</p>
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

export default SubCourse
