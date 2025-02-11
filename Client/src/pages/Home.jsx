import { useOutletContext, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaPlus, FaMinus, FaUndo } from "react-icons/fa";

const Home = () => {
  const [courses, setCourses] = useState([]);
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

  const themeClasses = {
    card: isDarkMode ? 'bg-[#202124] text-white border-white' : 'bg-white text-[#202124] border-[#202124]',
    text: isDarkMode ? 'text-white' : 'text-[#202124]',
    scheduleText: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    button: isDarkMode
      ? 'bg-[#202124] text-white border-white hover:bg-white hover:text-[#202124]'
      : 'bg-white text-[#202124] border-[#202124] hover:bg-[#202124] hover:text-white',
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/courses');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    }
    fetchCourses();
  }, []);
  
  const lastLearning = {
    courseName: "Computer Science",
    sectionName: "What is Internet?",
    stepTitle: "Step 1",
  };

  return (
    <>
      <div className="min-h-screen py-10" style={{ zoom: `${zoomLevel}%` }}>
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

          <h1 className={`text-3xl poppins-bold text-center mb-10 ${themeClasses.text}`}>Last Learning</h1>
          {/* Last Learning */}
          <div className={`${themeClasses.card} border-1 p-6 rounded-lg mb-10`}>
            <h2 className={`text-xl text-center poppins-semibold mb-4 ${themeClasses.text}`}>Continue from where you left off</h2>
            <div className={`flex flex-col border p-4 rounded-lg ${themeClasses.text}`}>
              <p className="text-lg underline text-center mx-10 poppins-medium mb-4">{lastLearning.courseName}</p>
              <p className="text-center mx-10 poppins-regular mb-4">{lastLearning.sectionName}</p>
              <p className="text-center mx-10 poppins-regular mb-4">{lastLearning.stepTitle}</p>
              <Link to={`/subcourse/${lastLearning.courseName.toLowerCase()}`} className={`border-2 px-5 rounded-lg poppins-medium cursor-pointer mx-auto transition ${themeClasses.button}`}>
                Resume
              </Link>
            </div>
          </div>

          <h1 className={`text-3xl poppins-bold text-center mb-10 ${themeClasses.text}`}>Available Courses</h1>
          {/* Available Courses */}
          <div className={`${themeClasses.card} border-1 p-6 rounded-lg mb-10`}>
            <h2 className={`text-xl text-center poppins-semibold mb-4 ${themeClasses.text}`}>Start Learning</h2>
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

          

          {/* Quiz */}
          <h1 className={`text-3xl poppins-bold text-center mb-10 ${themeClasses.text}`}>Quiz</h1>
          <div className={`${themeClasses.card} border-1 p-6 rounded-lg mb-10`}>
            <h2 className={`text-xl text-center poppins-semibold mb-4 ${themeClasses.text}`}>Test Your Skills</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className={`flex flex-col border p-4 rounded-lg ${themeClasses.text}`}>
                <p className="text-center mx-10 poppins-medium mb-4">Mathematics</p>
                <button className={`border-2 px-5 rounded-lg poppins-medium cursor-pointer mx-auto transition ${themeClasses.button}`}>
                  Start Quiz
                </button>
              </div>
              <div className={`flex flex-col border p-4 rounded-lg ${themeClasses.text}`}>
                <p className="text-center mx-10 poppins-medium mb-4">English</p>
                <button className={`border-2 px-5 rounded-lg poppins-medium cursor-pointer mx-auto transition ${themeClasses.button}`}>
                  Start Quiz
                </button>
              </div>
              <div className={`flex flex-col border p-4 rounded-lg ${themeClasses.text}`}>
                <p className="text-center mx-10 poppins-medium mb-4">Tamil</p>
                <button className={`border-2 px-5 rounded-lg poppins-medium cursor-pointer mx-auto transition ${themeClasses.button}`}>
                  Start Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home
