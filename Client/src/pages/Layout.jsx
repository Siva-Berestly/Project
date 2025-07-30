import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import { FiSun, FiMoon } from "react-icons/fi";
import { useState, useEffect } from "react";
import { FaArrowUp, FaLock, FaPlus, FaMinus, FaUndo } from "react-icons/fa";
import VoiceCommandWidget from "../components/VoiceCommandWidget";
import VoiceRecognitionService from "../services/VoiceRecognitionService"; // Correct import

const Layout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('isDarkMode');
        return savedTheme ? JSON.parse(savedTheme) : true;
    });
    const [isVisible, setIsVisible] = useState(false);
    const [textSize, setTextSize] = useState(() => {
        const savedSize = localStorage.getItem('textSize');
        return savedSize || 'text-base'; // Default to base size
    });
    const navigate = useNavigate();
    const location = useLocation();

    // Check if current route is an admin route
    const isAdminRoute = location.pathname.startsWith('/admin');

    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        localStorage.setItem('isDarkMode', JSON.stringify(newTheme));
    };

    const increaseTextSize = () => {
        const sizes = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'];
        const currentIndex = sizes.indexOf(textSize);
        if (currentIndex < sizes.length - 1) {
            const newSize = sizes[currentIndex + 1];
            setTextSize(newSize);
            localStorage.setItem('textSize', newSize);
        }
    };

    const decreaseTextSize = () => {
        const sizes = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'];
        const currentIndex = sizes.indexOf(textSize);
        if (currentIndex > 0) {
            const newSize = sizes[currentIndex - 1];
            setTextSize(newSize);
            localStorage.setItem('textSize', newSize);
        }
    };

    const resetTextSize = () => {
        setTextSize('text-base');
        localStorage.setItem('textSize', 'text-base');
    };

    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const handleKeyDown = (event) => {
        const navLinks = document.querySelectorAll('nav ul li a');
        let currentIndex = Array.from(navLinks).findIndex(link => link === document.activeElement);

        if (event.key === 'ArrowRight') {
            currentIndex = (currentIndex + 1) % navLinks.length;
            navLinks[currentIndex].focus();
            navigate(navLinks[currentIndex].getAttribute('href'));
        } else if (event.key === 'ArrowLeft') {
            currentIndex = (currentIndex - 1 + navLinks.length) % navLinks.length;
            navLinks[currentIndex].focus();
            navigate(navLinks[currentIndex].getAttribute('href'));
        }
    };

    const commands = [
        {
            keyword: ["go to home", "return home"],
            action: () => navigate("/"),
            displayName: "go to home",
        },
        {
            keyword: ["go to courses", "open courses"],
            action: () => navigate("/courses"),
            displayName: "go to courses",
        },
        {
            keyword: ["go to help", "open help"],
            action: () => navigate("/help"),
            displayName: "go to help",
        },
        {
            keyword: ["help", "what are the commands", "list commands"],
            action: () => {
                VoiceRecognitionService.speak(
                    "Available navigation commands are: go to home, go to courses, go to help"
                );
            },
            displayName: "help",
        }
    ];

    useEffect(() => {
        window.addEventListener("scroll", toggleVisibility);

        // Only add keyboard navigation for non-admin routes
        if (!isAdminRoute) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener("scroll", toggleVisibility);
            if (!isAdminRoute) {
                window.removeEventListener('keydown', handleKeyDown);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdminRoute]);

    const themeClasses = {
        navbar: isDarkMode ? 'bg-[#202124] text-white' : 'bg-white text-[#202124]',
        mainContent: isDarkMode ? 'bg-[#202124] text-white' : 'bg-white text-[#202124]',
        dropdown: isDarkMode ? 'bg-[#202124] border-gray-600' : 'bg-white border-gray-300',
        dropdownHover: isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
    };

    return (
        <div className={`flex flex-col min-h-screen ${themeClasses.mainContent}`}>
            {/* Only show voice commands for non-admin routes */}
            {!isAdminRoute && <VoiceCommandWidget commands={commands} />}
            {/* Navbar */}
            <div className={`flex justify-between items-center p-4 px-5 border-b-1 relative ${themeClasses.navbar}`}>
                <div className="flex items-center justify-between gap-2 w-full lg:w-auto">
                    <h1 className="text-base sm:text-2xl poppins-medium">Logo</h1>
                    <div className="flex items-center gap-4 lg:hidden">
                        <button onClick={toggleTheme}>
                            {isDarkMode ? <FiSun size={24} /> : <FiMoon size={24} />}
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <div className={`lg:flex items-center justify-between flex-grow ${isMobileMenuOpen ? `absolute top-full left-0 right-0 ${themeClasses.navbar} border-b` : 'hidden'}`}>
                    <nav className="lg:ml-12">
                        <ul className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-8 poppins-regular p-4 lg:p-0">
                            <li>
                                <NavLink to="/"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) => isActive ? "poppins-bold underline" : "hover:underline"}
                                >Home</NavLink>
                            </li>
                            <li>
                                <NavLink to="/courses"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        isActive ? "poppins-bold underline" : "hover:underline"
                                    }>Courses</NavLink>
                            </li>
                            <li>
                                <NavLink to="/help"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        isActive ? "poppins-bold underline" : "hover:underline"
                                    }>Help</NavLink>
                            </li>
                            <li className="lg:hidden">
                                <div className="flex items-center gap-3 mt-4">
                                    <span className="text-sm font-medium">Text Size:</span>
                                    <button
                                        onClick={decreaseTextSize}
                                        className="p-2 rounded border border-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                        title="Decrease text size"
                                    >
                                        <FaMinus size={12} />
                                    </button>
                                    <span className="text-sm font-medium min-w-[3rem] text-center">
                                        {textSize.replace('text-', '').toUpperCase()}
                                    </span>
                                    <button
                                        onClick={increaseTextSize}
                                        className="p-2 rounded border border-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                        title="Increase text size"
                                    >
                                        <FaPlus size={12} />
                                    </button>
                                    <button
                                        onClick={resetTextSize}
                                        className="p-2 rounded border border-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                        title="Reset text size"
                                    >
                                        <FaUndo size={12} />
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </nav>

                    {/* Text Size Controls and Theme Toggle */}
                    <div className="flex items-center gap-6 p-4 lg:p-0">
                        {/* Text Size Controls for Accessibility */}
                        <div className="hidden lg:flex items-center gap-2">
                            <button
                                onClick={decreaseTextSize}
                                className="p-2 rounded border border-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                title="Decrease text size"
                                aria-label="Decrease text size"
                            >
                                <FaMinus size={14} />
                            </button>
                            <span className="text-sm font-medium min-w-[3rem] text-center">
                                {textSize.replace('text-', '').toUpperCase()}
                            </span>
                            <button
                                onClick={increaseTextSize}
                                className="p-2 rounded border border-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                title="Increase text size"
                                aria-label="Increase text size"
                            >
                                <FaPlus size={14} />
                            </button>
                            <button
                                onClick={resetTextSize}
                                className="p-2 rounded border border-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                title="Reset text size to normal"
                                aria-label="Reset text size to normal"
                            >
                                <FaUndo size={14} />
                            </button>
                        </div>

                        <button onClick={toggleTheme} className="hidden lg:flex items-center gap-2 poppins-medium hover:underline">
                            {isDarkMode ? <FiSun size={24} /> : <FiMoon size={24} />}
                            <span>{isDarkMode ? 'Light' : 'Dark'} Mode</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className={`flex-1 ${themeClasses.mainContent} ${textSize} border-b-1 overflow-x-hidden overflow-y-auto`}>
                <div className="w-full max-w-full">
                    <Outlet context={{
                        isDarkMode,
                        textSize,
                        increaseTextSize,
                        decreaseTextSize,
                        resetTextSize
                    }} />
                </div>
            </main>

            {/* Go to Top Button */}
            {isVisible && (
                <button onClick={scrollToTop} className="fixed bottom-4 right-4 p-3 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-700 transition duration-300">
                    <FaArrowUp size={20} />
                </button>
            )}

            {/* Footer */}
            <footer className={themeClasses.navbar}>
                <div className="bg-[#202124] text-white p-4 text-center">
                    <p className="poppins-light text-sm">&copy; 2025 Product_Name by <span className="italic">Sivanesan</span></p>
                    <p className="poppins-light text-sm">Student of Bharathidasan University</p>
                    {/* Small Admin Login Button */}
                    <div className="mt-3">
                        <NavLink
                            to="/admin/login"
                            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors duration-200 poppins-light"
                        >
                            <FaLock size={10} />
                            <span>Admin</span>
                        </NavLink>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Layout;
