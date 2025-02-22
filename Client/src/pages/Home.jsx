import { useOutletContext, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { FaPlus, FaMinus, FaUndo } from "react-icons/fa";
import VoiceCommandWidget from "../components/VoiceCommandWidget";
import VoiceRecognitionService from "../services/VoiceRecognitionService";
import generateCourseCommands from "../utils/courseCommands";

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(100);
  const { isDarkMode } = useOutletContext();
  const navigate = useNavigate();
  const [commands, setCommands] = useState([]);

  const increaseZoom = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 10, 150));
  }, []);

  const decreaseZoom = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 10, 80));
  }, []);

  const resetZoom = useCallback(() => {
    setZoomLevel(100);
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/courses');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setCourses(data);
        // Generate course-specific commands
        const allCommands = generateCourseCommands(data, navigate, VoiceRecognitionService);
        setCommands(allCommands);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, [navigate]);

  useEffect(() => {
    const allCommands = [
      ...generateCourseCommands(courses, navigate, VoiceRecognitionService),
    ];
    setCommands(allCommands);
  }, [courses, navigate, increaseZoom, decreaseZoom, resetZoom]);

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
      <div className="min-h-screen py-10" style={{ zoom: `${zoomLevel}%` }}>
        <div className="container mx-auto px-4">
          <div className="flex justify-end mb-4">
            <button
              onClick={decreaseZoom}
              className="p-2 border rounded-lg mx-1"
              aria-label="Decrease Zoom"
            >
              <FaMinus />
            </button>
            <button
              onClick={resetZoom}
              className="p-2 border rounded-lg mx-1"
              aria-label="Reset Zoom"
            >
              <FaUndo />
            </button>
            <button
              onClick={increaseZoom}
              className="p-2 border rounded-lg mx-1"
              aria-label="Increase Zoom"
            >
              <FaPlus />
            </button>
          </div>
          <h1 className={`text-3xl poppins-bold text-center mb-10 ${themeClasses.text}`}>
            Available Courses
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course, index) => (
              <div key={index} className={`flex flex-col border p-4 rounded-lg ${themeClasses.text}`}>
                <p className="text-center mx-10 poppins-medium mb-4">{course.name}</p>
                <Link
                  to={`/subcourse/${course.name.toLowerCase()}`}
                  className={`p-2 px-5 rounded-4xl poppins-semibold cursor-pointer mx-auto ${themeClasses.static_button}`}
                >
                  Start Learning
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
