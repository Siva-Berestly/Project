import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaArrowDownShortWide } from "react-icons/fa6";
import { FaUser, FaBook, FaSignOutAlt, FaBookReader, FaTrash, FaPlus } from 'react-icons/fa';

const AdminDashboard = () => {
    const { isDarkMode } = useOutletContext();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('overview');
    const navigate = useNavigate();

    // New state variables for course management
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [showAddCourseForm, setShowAddCourseForm] = useState(false);
    const [courseForm, setCourseForm] = useState({
        id: '',
        title: ''
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Add new state variables for section management
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showAddSectionForm, setShowAddSectionForm] = useState(false);
    const [sectionForm, setSectionForm] = useState({
        hid: '',
        heading: '',
        content: '',
        vcontent: '' // Add vcontent to the form state
    });

    const themeClasses = {
        container: isDarkMode ? 'bg-[#202124] text-white' : 'bg-white text-gray-800',
        card: isDarkMode ? 'bg-[#292a2d] border-gray-700' : 'bg-gray-50 border-gray-200',
        sidebar: isDarkMode ? 'bg-[#292a2d] border-gray-700' : 'bg-gray-100 border-gray-200',
        input: isDarkMode ? 'bg-[#3c4043] border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800',
        button: isDarkMode
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white',
        dangerButton: 'bg-red-500 hover:bg-red-600 text-white',
        menuItem: isDarkMode
            ? 'hover:bg-[#3c4043] text-gray-300 hover:text-white'
            : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'
    };

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }

        // Fetch user data or verify token
        const fetchUser = async () => {
            try {
                // This would be replaced with an actual API call to verify the token
                // For now, we'll simulate a successful response
                setUser({
                    username: 'admin',
                    role: 'admin',
                    email: 'admin@example.com'
                });
            } catch (error) {
                console.error('Authentication error:', error);
                localStorage.removeItem('authToken');
                navigate('/admin/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
        fetchCourses(); // Fetch courses when component mounts
    }, [navigate]);

    // Function to fetch courses from the API
    const fetchCourses = async () => {
        setLoadingCourses(true);
        setError('');

        try {
            const response = await fetch('/api/admin/courses');
            if (!response.ok) {
                throw new Error('Failed to fetch courses');
            }
            const data = await response.json();
            setCourses(data);
        } catch (err) {
            setError('Error fetching courses: ' + err.message);
            console.error('Error fetching courses:', err);
        } finally {
            setLoadingCourses(false);
        }
    };

    // Handle form input changes
    const handleCourseInputChange = (e) => {
        const { name, value } = e.target;
        setCourseForm({ ...courseForm, [name]: value });
    };

    // Handle form submission
    const handleAddCourse = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        try {
            // Validate form
            if (!courseForm.id || !courseForm.title) {
                setError('Course ID and title are required');
                return;
            }

            const response = await fetch('/api/admin/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    id: parseInt(courseForm.id),
                    title: courseForm.title,
                    sections: []
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add course');
            }

            setSuccessMessage('Course added successfully');
            setCourseForm({ id: '', title: '' });
            setShowAddCourseForm(false);
            fetchCourses();
        } catch (err) {
            setError('Error adding course: ' + err.message);
            console.error('Error adding course:', err);
        }
    };

    // Handle course deletion
    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;

        setError('');
        setSuccessMessage('');

        try {
            const response = await fetch(`/api/admin/courses/${courseId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete course');
            }

            setSuccessMessage('Course deleted successfully');
            fetchCourses();
        } catch (err) {
            setError('Error deleting course: ' + err.message);
            console.error('Error deleting course:', err);
        }
    };

    // Function to handle selecting a course for section management
    const handleCourseSelect = (course) => {
        setSelectedCourse(course);
        setSectionForm({ hid: '', heading: '', content: '', vcontent: '' });
        setShowAddSectionForm(false);
    };

    // Handle section form input changes
    const handleSectionInputChange = (e) => {
        const { name, value } = e.target;
        setSectionForm({ ...sectionForm, [name]: value });
    };

    // Handle section form submission
    const handleAddSection = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        try {
            // Validate form
            if (!sectionForm.hid || !sectionForm.heading || !sectionForm.content) {
                setError('Section ID, heading, and content are required');
                return;
            }

            const response = await fetch(`/api/admin/courses/${selectedCourse.id}/sections`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    hid: parseInt(sectionForm.hid),
                    heading: sectionForm.heading,
                    content: sectionForm.content,
                    vcontent: sectionForm.vcontent // Include vcontent in the request
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add section');
            }

            setSuccessMessage('Section added successfully');
            setSectionForm({ hid: '', heading: '', content: '', vcontent: '' }); // Reset form
            setShowAddSectionForm(false);
            fetchCourses();
        } catch (err) {
            setError('Error adding section: ' + err.message);
            console.error('Error adding section:', err);
        }
    };

    // Handle section deletion
    const handleDeleteSection = async (courseId, sectionId) => {
        if (!window.confirm('Are you sure you want to delete this section?')) return;

        setError('');
        setSuccessMessage('');

        try {
            const response = await fetch(`/api/admin/courses/${courseId}/sections/${sectionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete section');
            }

            setSuccessMessage('Section deleted successfully');
            fetchCourses();
        } catch (err) {
            setError('Error deleting section: ' + err.message);
            console.error('Error deleting section:', err);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Do you really want to log out?')) {
            localStorage.removeItem('authToken');
            navigate('/admin/login');
        }
    };

    if (loading) {
        return (
            <div className={`min-h-[80vh] flex items-center justify-center ${themeClasses.container}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-[80vh] ${themeClasses.container}`}>
            <div className="flex flex-col md:flex-row w-full">
                {/* Sidebar */}
                <div className={`w-full md:w-64 ${themeClasses.sidebar} border-r p-4`}>
                    <div className="flex items-center gap-3 mb-6 p-2">
                        <div className="bg-blue-500 text-white p-2 rounded-full">
                            <FaUser />
                        </div>
                        <div>
                            <h2 className="font-semibold uppercase">{user?.username}</h2>
                        </div>
                    </div>

                    <nav>
                        <ul className="space-y-2 poppins-regular">
                            <li>
                                <button
                                    onClick={() => setActiveSection('overview')}
                                    className={`w-full text-left p-2 rounded flex items-center gap-3 ${activeSection === 'overview' ? 'bg-blue-500 text-white poppins-semibold' : themeClasses.menuItem}`}
                                >
                                    <FaBook /> Overview
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveSection('courses')}
                                    className={`w-full text-left p-2 rounded flex items-center gap-3 ${activeSection === 'courses' ? 'bg-blue-500 text-white poppins-semibold' : themeClasses.menuItem}`}
                                >
                                    <FaBookReader /> Manage Courses
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveSection('sections')}
                                    className={`w-full text-left p-2 rounded flex items-center gap-3 ${activeSection === 'sections' ? 'bg-blue-500 text-white poppins-semibold' : themeClasses.menuItem}`}
                                >
                                    <FaArrowDownShortWide /> Manage Sections
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className={`w-full text-left p-2 rounded flex items-center gap-3 ${themeClasses.menuItem}`}
                                >
                                    <FaSignOutAlt /> Logout
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="min-h-[85vh] flex-1 p-6">
                    <h1 className="text-2xl font-bold mb-6 poppins-medium">Admin Dashboard</h1>

                    {/* Display error and success messages */}
                    {error && (
                        <div className="p-3 mb-4 text-sm rounded-md bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-500">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="p-3 mb-4 text-sm rounded-md bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-500">
                            {successMessage}
                        </div>
                    )}

                    {activeSection === 'overview' && (
                        <div>
                            <h2 className="text-xl poppins-semibold underline mb-4">Overview</h2>
                            <p className="mb-4 poppins-regular">Welcome to the admin dashboard. Here you can manage your courses and sections.</p>

                            <div className={`${themeClasses.card} p-6 rounded-lg border shadow-sm`}>
                                <h3 className="poppins-medium mb-4">Available Courses</h3>
                                {loadingCourses ? (
                                    <p>Loading courses...</p>
                                ) : courses.length > 0 ? (
                                    <ul className="list-disc pl-6">
                                        {courses.map(course => (
                                            <li key={course.id} className="mb-2">
                                                <span className="font-semibold">{course.title}</span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400"> (ID: {course.id})</span>
                                                {course.sections && course.sections.length > 0 && (
                                                    <ul className="list-circle pl-6 mt-1">
                                                        {course.sections.map(section => (
                                                            <li key={section.hid} className="text-sm">
                                                                {section.heading}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No courses available</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === 'courses' && (
                        <div>
                            <h2 className="text-xl poppins-semibold underline mb-4">Manage Courses</h2>

                            {/* Course Management Controls */}
                            <div className="flex flex-wrap gap-4 mb-8">
                                <button
                                    onClick={() => setShowAddCourseForm(!showAddCourseForm)}
                                    className={`${themeClasses.button} px-4 py-2 rounded poppins-medium flex items-center gap-2`}
                                >
                                    {showAddCourseForm ? 'Cancel' : <><FaPlus /> Add New Course</>}
                                </button>
                            </div>

                            {/* Add Course Form */}
                            {showAddCourseForm && (
                                <div className={`${themeClasses.card} p-6 rounded-lg border shadow-sm mb-8`}>
                                    <h3 className="text-lg poppins-medium mb-4">Add New Course</h3>
                                    <form onSubmit={handleAddCourse}>
                                        <div className="mb-4">
                                            <label htmlFor="id" className="block mb-2 text-sm font-medium">Course ID</label>
                                            <input
                                                type="number"
                                                id="id"
                                                name="id"
                                                value={courseForm.id}
                                                onChange={handleCourseInputChange}
                                                className={`${themeClasses.input} w-full p-2 rounded-md border`}
                                                placeholder="Enter numeric ID"
                                                required
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label htmlFor="title" className="block mb-2 text-sm font-medium">Course Title</label>
                                            <input
                                                type="text"
                                                id="title"
                                                name="title"
                                                value={courseForm.title}
                                                onChange={handleCourseInputChange}
                                                className={`${themeClasses.input} w-full p-2 rounded-md border`}
                                                placeholder="Enter course title"
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className={`${themeClasses.button} px-4 py-2 rounded poppins-medium`}
                                        >
                                            Add Course
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Course List */}
                            <div className={`${themeClasses.card} p-6 rounded-lg border shadow-sm`}>
                                <h3 className="text-lg poppins-medium mb-4">Available Courses</h3>
                                {loadingCourses ? (
                                    <div className="text-center py-4">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                                        <p className="mt-2">Loading courses...</p>
                                    </div>
                                ) : courses.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead>
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Title</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Sections</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {courses.map(course => (
                                                    <tr key={course.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">{course.id}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{course.title}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{course.sections ? course.sections.length : 0}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <button
                                                                onClick={() => handleDeleteCourse(course.id)}
                                                                className={`${themeClasses.dangerButton} px-3 py-1 rounded-md text-sm flex items-center gap-1`}
                                                                title="Delete Course"
                                                            >
                                                                <FaTrash /> Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="py-4 text-center">No courses available</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === 'sections' && (
                        <div>
                            <h2 className="text-xl poppins-semibold underline mb-4">Manage Sections</h2>

                            {/* Course Selection */}
                            <div className={`${themeClasses.card} p-6 rounded-lg border shadow-sm mb-6`}>
                                <h3 className="text-lg poppins-medium mb-4">Select Course</h3>
                                {loadingCourses ? (
                                    <p>Loading courses...</p>
                                ) : courses.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {courses.map(course => (
                                            <button
                                                key={course.id}
                                                onClick={() => handleCourseSelect(course)}
                                                className={`p-4 rounded-lg border ${selectedCourse?.id === course.id
                                                    ? 'bg-blue-500 text-white'
                                                    : `${themeClasses.card} hover:bg-gray-100 dark:hover:bg-gray-700`}`}
                                            >
                                                <h4 className="font-semibold">{course.title}</h4>
                                                <p className="text-sm opacity-75">ID: {course.id}</p>
                                                <p className="text-sm mt-2">{course.sections?.length || 0} section(s)</p>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p>No courses available. Please add a course first.</p>
                                )}
                            </div>

                            {/* Section Management */}
                            {selectedCourse && (
                                <>
                                    {/* Section Controls */}
                                    <div className="flex flex-wrap gap-4 mb-6">
                                        <button
                                            onClick={() => setShowAddSectionForm(!showAddSectionForm)}
                                            className={`${themeClasses.button} px-4 py-2 rounded poppins-medium flex items-center gap-2`}
                                        >
                                            {showAddSectionForm ? 'Cancel' : <><FaPlus /> Add New Section</>}
                                        </button>
                                    </div>

                                    {/* Add Section Form */}
                                    {showAddSectionForm && (
                                        <div className={`${themeClasses.card} p-6 rounded-lg border shadow-sm mb-6`}>
                                            <h3 className="text-lg poppins-medium mb-4">
                                                Add New Section to &quot;{selectedCourse.title}&quot;
                                            </h3>
                                            <form onSubmit={handleAddSection}>
                                                <div className="mb-4">
                                                    <label htmlFor="hid" className="block mb-2 text-sm font-medium">Section ID</label>
                                                    <input
                                                        type="number"
                                                        id="hid"
                                                        name="hid"
                                                        value={sectionForm.hid}
                                                        onChange={handleSectionInputChange}
                                                        className={`${themeClasses.input} w-full p-2 rounded-md border`}
                                                        placeholder="Enter numeric ID"
                                                        required
                                                    />
                                                </div>

                                                <div className="mb-4">
                                                    <label htmlFor="heading" className="block mb-2 text-sm font-medium">Section Heading</label>
                                                    <input
                                                        type="text"
                                                        id="heading"
                                                        name="heading"
                                                        value={sectionForm.heading}
                                                        onChange={handleSectionInputChange}
                                                        className={`${themeClasses.input} w-full p-2 rounded-md border`}
                                                        placeholder="Enter section heading"
                                                        required
                                                    />
                                                </div>

                                                <div className="mb-4">
                                                    <label htmlFor="content" className="block mb-2 text-sm font-medium">Section Content</label>
                                                    <textarea
                                                        id="content"
                                                        name="content"
                                                        value={sectionForm.content}
                                                        onChange={handleSectionInputChange}
                                                        rows="6"
                                                        className={`${themeClasses.input} w-full p-2 rounded-md border`}
                                                        placeholder="Enter section content"
                                                        required
                                                    ></textarea>
                                                </div>

                                                <div className="mb-4">
                                                    <label htmlFor="vcontent" className="block mb-2 text-sm font-medium">Video Content URL</label>
                                                    <input
                                                        type="text"
                                                        id="vcontent"
                                                        name="vcontent"
                                                        value={sectionForm.vcontent}
                                                        onChange={handleSectionInputChange}
                                                        className={`${themeClasses.input} w-full p-2 rounded-md border`}
                                                        placeholder="Enter YouTube URL or direct video link"
                                                    />
                                                    <p className="text-xs mt-1 opacity-75">Optional: Add a YouTube link (e.g., https://youtube.com/watch?v=12345) or direct video URL</p>
                                                </div>

                                                <button
                                                    type="submit"
                                                    className={`${themeClasses.button} px-4 py-2 rounded poppins-medium`}
                                                >
                                                    Add Section
                                                </button>
                                            </form>
                                        </div>
                                    )}

                                    {/* List of Sections */}
                                    <div className={`${themeClasses.card} p-6 rounded-lg border shadow-sm`}>
                                        <h3 className="text-lg poppins-medium mb-4">
                                            Sections in &quot;{selectedCourse.title}&quot;
                                        </h3>
                                        {selectedCourse.sections && selectedCourse.sections.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                    <thead>
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Heading</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Video</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                        {selectedCourse.sections.map(section => (
                                                            <tr key={section.hid}>
                                                                <td className="px-6 py-4 whitespace-nowrap">{section.hid}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap">{section.heading}</td>
                                                                <td className="px-6 py-4">
                                                                    {section.vcontent ? (
                                                                        <span className="px-2 py-1 text-xs rounded-md bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-500">
                                                                            Video Available
                                                                        </span>
                                                                    ) : (
                                                                        <span className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-500 dark:bg-gray-700/20 dark:text-gray-400">
                                                                            No Video
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <button
                                                                        onClick={() => handleDeleteSection(selectedCourse.id, section.hid)}
                                                                        className={`${themeClasses.dangerButton} px-3 py-1 rounded-md text-sm flex items-center gap-1`}
                                                                        title="Delete Section"
                                                                    >
                                                                        <FaTrash /> Delete
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="py-4 text-center">No sections available for this course</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
