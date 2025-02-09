import { useOutletContext } from "react-router-dom";

const Home = () => {
  const { isDarkMode } = useOutletContext();

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
      <div className="min-h-screen py-10">
        <div className="container mx-auto px-4">
          <h1 className={`text-3xl poppins-bold text-center mb-10 ${themeClasses.text}`}>Quick Access Tools</h1>

          {/* Quick Access Tools */}
          <div className={`${themeClasses.card} border-1 p-6 rounded-lg mb-10`}>
            <h2 className={`text-xl text-center poppins-semibold mb-4 ${themeClasses.text}`}>Continue Learning</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className={`flex flex-col border p-4 rounded-lg ${themeClasses.text}`}>
                <p className="text-center mx-10 poppins-medium mb-4">Mathematics</p>
                <p className="text-center mx-10 poppins-regular mb-4">Topic: Algebra Basics</p>
                <button className={`border-2 px-5 rounded-lg poppins-medium cursor-pointer mx-auto transition ${themeClasses.button}`}>
                  Resume
                </button>
              </div>
            </div>
          </div>

          <h1 className={`text-3xl poppins-bold text-center mb-10 ${themeClasses.text}`}>Available Courses</h1>

          {/* Learning Progress */}
          <div className={`${themeClasses.card} border-1 p-6 rounded-lg mb-8`}>
            <h2 className={`text-xl text-center poppins-semibold mb-4 ${themeClasses.text}`}>Start Learning</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className={`flex flex-col border p-4 rounded-lg ${themeClasses.text}`}>
                <p className="text-center mx-10 poppins-medium mb-4">Mathematics</p>
                <button className={`border-2 px-5 rounded-lg poppins-medium cursor-pointer mx-auto transition ${themeClasses.button}`}>
                  Start Learning
                </button>
              </div>
              <div className={`flex flex-col border p-4 rounded-lg ${themeClasses.text}`}>
                <p className="text-center mx-10 poppins-medium mb-4">English</p>
                <button className={`border-2 px-5 rounded-lg poppins-medium cursor-pointer mx-auto transition ${themeClasses.button}`}>
                  Start Learning
                </button>
              </div>
              <div className={`flex flex-col border p-4 rounded-lg ${themeClasses.text}`}>
                <p className="text-center mx-10 poppins-medium mb-4">Tamil</p>
                <button className={`border-2 px-5 rounded-lg poppins-medium cursor-pointer mx-auto transition ${themeClasses.button}`}>
                  Start Learning
                </button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['📊 Progress Report', '📅 Schedule Session', '📝 Take Notes', '🎯 Set Goals'].map((text, index) => (
              <button key={index} className={`p-4 border-2 rounded-lg text-center transition ${themeClasses.button}`}>
                {text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Home
