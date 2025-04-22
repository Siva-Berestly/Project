import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaArrowDownShortWide } from "react-icons/fa6";
import { FaUser, FaBook, FaSignOutAlt, FaBookReader, FaTrash, FaPlus, FaEdit, FaCog, FaCheck, FaTimes } from 'react-icons/fa';
import PropTypes from 'prop-types';

// Define ValidationItem component outside main component
const ValidationItem = ({ isValid, text }) => (
    <div className={`flex items-center gap-2 ${isValid ? 'text-green-500' : 'text-red-500'}`}>
        {isValid ? (
            <FaCheck size={12} />
        ) : (
            <FaTimes size={12} />
        )}
        <span className="text-sm">{text}</span>
    </div>
);

// Add PropTypes validation
ValidationItem.propTypes = {
    isValid: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired
};

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
        title: '' // Removed 'id'
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Add new state variables for section management
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showAddSectionForm, setShowAddSectionForm] = useState(false);
    const [sectionForm, setSectionForm] = useState({
        heading: '',
        content: '',
        vcontent: '' // Removed 'hid'
    });

    // Add new state variables for editing courses and sections
    const [showEditCourseForm, setShowEditCourseForm] = useState(false);
    const [editCourseForm, setEditCourseForm] = useState({
        id: '',
        title: ''
    });
    const [showEditSectionForm, setShowEditSectionForm] = useState(false);
    const [editSectionForm, setEditSectionForm] = useState({
        hid: '',
        heading: '',
        content: '',
        vcontent: ''
    });

    // Add new state variables for settings
    const [settingsForm, setSettingsForm] = useState({
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Password validation state
    const [passwordValidation, setPasswordValidation] = useState([
        { id: 'minLength', isValid: false, text: 'At least 8 characters' },
        { id: 'uppercase', isValid: false, text: 'One uppercase letter' },
        { id: 'lowercase', isValid: false, text: 'One lowercase letter' },
        { id: 'number', isValid: false, text: 'One number' },
        { id: 'special', isValid: false, text: 'One special character (!@#$%^&*)' }
    ]);

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

        const fetchUserData = async () => {
            try {
                const response = await fetch('/api/admin/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const userData = await response.json();
                // Update settings form with current email
                setSettingsForm(prev => ({
                    ...prev,
                    email: userData.email
                }));
            } catch (err) {
                console.error('Error fetching user data:', err);
            }
        };

        fetchUser();
        fetchUserData();
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
            if (!courseForm.title) {
                setError('Course title is required');
                return;
            }

            const response = await fetch('/api/admin/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    title: courseForm.title,
                    sections: []
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add course');
            }

            setSuccessMessage('Course added successfully');
            setCourseForm({ title: '' }); // Reset form
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
        setSectionForm({ heading: '', content: '', vcontent: '' });
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
            if (!sectionForm.heading || !sectionForm.content) {
                setError('Section heading and content are required');
                return;
            }

            console.log("Sending section data:", {
                heading: sectionForm.heading,
                content: sectionForm.content,
                vcontent: sectionForm.vcontent
            });  // Add this debug log

            const response = await fetch(`/api/admin/courses/${selectedCourse.id}/sections`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    heading: sectionForm.heading,
                    content: sectionForm.content,
                    vcontent: sectionForm.vcontent
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add section');
            }

            setSuccessMessage('Section added successfully');
            setSectionForm({ heading: '', content: '', vcontent: '' }); // Reset form
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

    // Function to handle editing a course
    const handleEditCourseClick = (course) => {
        setEditCourseForm({
            id: course.id,
            title: course.title
        });
        setShowEditCourseForm(true);
        setShowAddCourseForm(false);
    };

    // Handle course edit form submission
    const handleEditCourse = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        try {
            if (!editCourseForm.title) {
                setError('Course title is required');
                return;
            }

            // First check if the PUT endpoint works
            try {
                const response = await fetch(`/api/admin/courses/${editCourseForm.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify({
                        title: editCourseForm.title
                    })
                });

                // If PUT works, handle the response normally
                if (response.ok) {
                    setSuccessMessage('Course updated successfully');
                    setShowEditCourseForm(false);
                    fetchCourses();
                    return;
                }

                // If we get here, PUT method failed but didn't throw an error
                console.log('PUT method not supported, falling back to POST');
            } catch (err) {
                console.log('PUT method failed:', err);
                // Continue to fallback method
            }

            // Fallback: Try the update endpoint with POST method
            const updateResponse = await fetch(`/api/admin/courses/${editCourseForm.id}/update`, {
                method: 'POST',  // Use POST as fallback
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    title: editCourseForm.title
                })
            });

            if (!updateResponse.ok) {
                // Check if the response is JSON
                let errorData;
                const contentType = updateResponse.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    errorData = await updateResponse.json();
                } else {
                    // If not JSON, get the text and create a generic error message
                    await updateResponse.text();
                    throw new Error('Server returned a non-JSON response. API endpoint may not exist.');
                }

                throw new Error(errorData.message || 'Failed to update course');
            }

            setSuccessMessage('Course updated successfully');
            setShowEditCourseForm(false);
            fetchCourses();
        } catch (err) {
            setError('Error updating course: ' + err.message);
            console.error('Error updating course:', err);
        }
    };

    // Function to handle editing a section
    const handleEditSectionClick = (section) => {
        setEditSectionForm({
            hid: section.hid,
            heading: section.heading,
            content: section.tcontent,
            vcontent: section.vcontent || ''
        });
        setShowEditSectionForm(true);
        setShowAddSectionForm(false);
    };

    // Handle section edit form submission
    const handleEditSection = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        try {
            if (!editSectionForm.heading || !editSectionForm.content) {
                setError('Section heading and content are required');
                return;
            }

            // First check if the PUT endpoint works
            try {
                const response = await fetch(`/api/admin/courses/${selectedCourse.id}/sections/${editSectionForm.hid}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify({
                        heading: editSectionForm.heading,
                        content: editSectionForm.content,
                        vcontent: editSectionForm.vcontent
                    })
                });

                // If PUT works, handle the response normally
                if (response.ok) {
                    setSuccessMessage('Section updated successfully');
                    setShowEditSectionForm(false);
                    fetchCourses();
                    return;
                }

                // If we get here, PUT method failed but didn't throw an error
                console.log('PUT method not supported for section update, falling back to POST');
            } catch (err) {
                console.log('PUT method failed for section update:', err);
                // Continue to fallback method
            }

            // Fallback: Try the update endpoint with POST method
            const updateResponse = await fetch(`/api/admin/courses/${selectedCourse.id}/sections/${editSectionForm.hid}/update`, {
                method: 'POST',  // Use POST as fallback
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    heading: editSectionForm.heading,
                    content: editSectionForm.content,
                    vcontent: editSectionForm.vcontent
                })
            });

            if (!updateResponse.ok) {
                // Check if the response is JSON
                let errorData;
                const contentType = updateResponse.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    errorData = await updateResponse.json();
                } else {
                    // If not JSON, get the text and create a generic error message
                    throw new Error('Server returned a non-JSON response. API endpoint may not exist.');
                }

                throw new Error(errorData.message || 'Failed to update section');
            }

            setSuccessMessage('Section updated successfully');
            setShowEditSectionForm(false);
            fetchCourses();
        } catch (err) {
            setError('Error updating section: ' + err.message);
            console.error('Error updating section:', err);
        }
    };

    // Handle edit form input changes
    const handleEditCourseInputChange = (e) => {
        const { name, value } = e.target;
        setEditCourseForm({ ...editCourseForm, [name]: value });
    };

    // Handle edit section form input changes
    const handleEditSectionInputChange = (e) => {
        const { name, value } = e.target;
        setEditSectionForm({ ...editSectionForm, [name]: value });
    };

    // Validate password
    const validatePassword = (password) => {
        return [
            { id: 'minLength', isValid: password.length >= 8, text: 'At least 8 characters' },
            { id: 'uppercase', isValid: /[A-Z]/.test(password), text: 'One uppercase letter' },
            { id: 'lowercase', isValid: /[a-z]/.test(password), text: 'One lowercase letter' },
            { id: 'number', isValid: /[0-9]/.test(password), text: 'One number' },
            { id: 'special', isValid: /[!@#$%^&*]/.test(password), text: 'One special character (!@#$%^&*)' }
        ];
    };

    // Handle settings form input change
    const handleSettingsInputChange = (e) => {
        const { name, value } = e.target;
        setSettingsForm({
            ...settingsForm,
            [name]: value
        });

        // Update password validation if needed
        if (name === 'newPassword') {
            setPasswordValidation(validatePassword(value));
        }
    };

    // Handle email update
    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        try {
            const response = await fetch('/api/admin/settings/email', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    email: settingsForm.email
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update email');
            }

            setSuccessMessage('Email updated successfully');
        } catch (err) {
            setError('Error updating email: ' + err.message);
            console.error('Error updating email:', err);
        }
    };

    // Handle password update
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        // Check if passwords match
        if (settingsForm.newPassword !== settingsForm.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        // Check if all password validations pass
        const allValid = passwordValidation.every(rule => rule.isValid);
        if (!allValid) {
            setError('Password does not meet all requirements');
            return;
        }

        try {
            const response = await fetch('/api/admin/settings/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    currentPassword: settingsForm.currentPassword,
                    newPassword: settingsForm.newPassword
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update password');
            }

            setSuccessMessage('Password updated successfully');
            setSettingsForm({
                ...settingsForm,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            setError('Error updating password: ' + err.message);
            console.error('Error updating password:', err);
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
                            <h2 className="poppins-regular uppercase">{user?.username}</h2>
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
                                    onClick={() => setActiveSection('settings')}
                                    className={`w-full text-left p-2 rounded flex items-center gap-3 ${activeSection === 'settings' ? 'bg-blue-500 text-white poppins-semibold' : themeClasses.menuItem}`}
                                >
                                    <FaCog /> Settings
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
                    <h1 className="text-2xl poppins-regular mb-6 poppins-medium">Admin Dashboard</h1>

                    {/* Display error and success messages */}
                    {error && (
                        <div className="p-3 mb-4 text-sm rounded-md poppins-regular text-center bg-red-100 border-red-300 border-1 text-red-700 dark:bg-red-900/20 dark:text-red-500 relative">
                            {error}
                            <button
                                onClick={() => setError('')}
                                className="absolute top-3 right-5 font-bold hover:text-red-800 dark:hover:text-red-400"
                                aria-label="Close error message"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {successMessage && (
                        <div className="p-3 mb-4 text-sm rounded-md poppins-regular text-center bg-green-100 border-green-300 border-1 text-green-700 dark:bg-green-900/20 dark:text-green-500 relative">
                            {successMessage}
                            <button
                                onClick={() => setSuccessMessage('')}
                                className="absolute top-3 right-5 font-bold hover:text-green-800 dark:hover:text-green-400"
                                aria-label="Close success message"
                            >
                                ✕
                            </button>
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
                                    <ul className="list-decimal pl-6">
                                        {courses.map(course => (
                                            <li key={course.id} className="mb-3">
                                                <span className="poppins-semibold">{course.title}</span>
                                                {/* <span className="text-sm poppins-thin text-gray-500 dark:text-gray-400"> ID: {course.id}</span> */}
                                                {course.sections && course.sections.length > 0 && (
                                                    <ul className="list-circle pl-6 mt-1">
                                                        {course.sections.map(section => (
                                                            <li key={section.hid} className="text-sm poppins-light list-disc">
                                                                {section.heading}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className='poppins-regular'>No courses available</p>
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
                                    <h3 className="text-lg poppins-semibold mb-4">Add New Course</h3>
                                    <form onSubmit={handleAddCourse}>
                                        <div className="mb-4">
                                            <label htmlFor="title" className="block mb-2 text-sm poppins-medium">Course Title</label>
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

                            {/* Edit Course Form */}
                            {showEditCourseForm && (
                                <div className={`${themeClasses.card} p-6 rounded-lg border shadow-sm mb-8`}>
                                    <h3 className="text-lg poppins-medium mb-4">Edit Course</h3>
                                    <form onSubmit={handleEditCourse}>
                                        <div className="mb-4">
                                            <label htmlFor="editTitle" className="block mb-2 text-sm poppins-medium">Course Title</label>
                                            <input
                                                type="text"
                                                id="editTitle"
                                                name="title"
                                                value={editCourseForm.title}
                                                onChange={handleEditCourseInputChange}
                                                className={`${themeClasses.input} w-full p-2 rounded-md border`}
                                                placeholder="Enter course title"
                                                required
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                className={`${themeClasses.button} px-4 py-2 rounded poppins-medium`}
                                            >
                                                Update Course
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowEditCourseForm(false)}
                                                className={`bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded poppins-medium`}
                                            >
                                                Cancel
                                            </button>
                                        </div>
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
                                                    <th className="px-6 py-3 text-left text-xs poppins-regular uppercase tracking-wider">#</th>
                                                    <th className="px-6 py-3 text-left text-xs poppins-regular uppercase tracking-wider">Title</th>
                                                    <th className="px-6 py-3 text-left text-xs poppins-regular uppercase tracking-wider">Sections</th>
                                                    <th className="px-6 py-3 text-left text-xs poppins-regular uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {courses.map((course, index) => (
                                                    <tr key={course.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap poppins-regular">{index + 1}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap poppins-regular">{course.title}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap poppins-regular">{course.sections ? course.sections.length : 0}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap poppins-regular">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleEditCourseClick(course)}
                                                                    className={`bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1`}
                                                                    title="Edit Course"
                                                                >
                                                                    <FaEdit /> Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteCourse(course.id)}
                                                                    className={`${themeClasses.dangerButton} px-3 py-1 rounded-md text-sm flex items-center gap-1`}
                                                                    title="Delete Course"
                                                                >
                                                                    <FaTrash /> Delete
                                                                </button>
                                                            </div>
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
                                                <h4 className="poppins-regular">{course.title}</h4>
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
                                            onClick={() => {
                                                setShowAddSectionForm(!showAddSectionForm);
                                                setShowEditSectionForm(false);
                                            }}
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
                                                    <label htmlFor="heading" className="block mb-2 text-sm poppins-regular">Section Heading</label>
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
                                                    <label htmlFor="content" className="block mb-2 text-sm poppins-regular">Section Content</label>
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
                                                    <label htmlFor="vcontent" className="block mb-2 text-sm poppins-regular">Video Content URL</label>
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

                                    {/* Edit Section Form */}
                                    {showEditSectionForm && (
                                        <div className={`${themeClasses.card} p-6 rounded-lg border shadow-sm mb-6`}>
                                            <h3 className="text-lg poppins-medium mb-4">
                                                Edit Section in &quot;{selectedCourse.title}&quot;
                                            </h3>
                                            <form onSubmit={handleEditSection}>
                                                <div className="mb-4">
                                                    <label htmlFor="editHeading" className="block mb-2 text-sm poppins-regular">Section Heading</label>
                                                    <input
                                                        type="text"
                                                        id="editHeading"
                                                        name="heading"
                                                        value={editSectionForm.heading}
                                                        onChange={handleEditSectionInputChange}
                                                        className={`${themeClasses.input} w-full p-2 rounded-md border`}
                                                        placeholder="Enter section heading"
                                                        required
                                                    />
                                                </div>
                                                <div className="mb-4">
                                                    <label htmlFor="editContent" className="block mb-2 text-sm poppins-regular">Section Content</label>
                                                    <textarea
                                                        id="editContent"
                                                        name="content"
                                                        value={editSectionForm.content}
                                                        onChange={handleEditSectionInputChange}
                                                        rows="6"
                                                        className={`${themeClasses.input} w-full p-2 rounded-md border`}
                                                        placeholder="Enter section content"
                                                        required
                                                    ></textarea>
                                                </div>
                                                <div className="mb-4">
                                                    <label htmlFor="editVcontent" className="block mb-2 text-sm poppins-regular">Video Content URL</label>
                                                    <input
                                                        type="text"
                                                        id="editVcontent"
                                                        name="vcontent"
                                                        value={editSectionForm.vcontent}
                                                        onChange={handleEditSectionInputChange}
                                                        className={`${themeClasses.input} w-full p-2 rounded-md border`}
                                                        placeholder="Enter YouTube URL or direct video link"
                                                    />
                                                    <p className="text-xs mt-1 opacity-75">Optional: Add a YouTube link (e.g., https://youtube.com/watch?v=12345) or direct video URL</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="submit"
                                                        className={`${themeClasses.button} px-4 py-2 rounded poppins-medium`}
                                                    >
                                                        Update Section
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowEditSectionForm(false)}
                                                        className={`bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded poppins-medium`}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
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
                                                            <th className="px-6 py-3 text-left text-xs poppins-regular uppercase tracking-wider">#</th>
                                                            <th className="px-6 py-3 text-left text-xs poppins-regular uppercase tracking-wider">Heading</th>
                                                            <th className="px-6 py-3 text-left text-xs poppins-regular uppercase tracking-wider">Video</th>
                                                            <th className="px-6 py-3 text-left text-xs poppins-regular uppercase tracking-wider">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                        {selectedCourse.sections.map((section, index) => (
                                                            <tr key={section.hid}>
                                                                <td className="px-6 py-4 whitespace-nowrap poppins-regular">{index + 1}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap poppins-regular">{section.heading}</td>
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
                                                                <td className="px-6 py-4 whitespace-nowrap poppins-regular">
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => handleEditSectionClick(section)}
                                                                            className={`bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1`}
                                                                            title="Edit Section"
                                                                        >
                                                                            <FaEdit /> Edit
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteSection(selectedCourse.id, section.hid)}
                                                                            className={`${themeClasses.dangerButton} px-3 py-1 rounded-md text-sm flex items-center gap-1`}
                                                                            title="Delete Section"
                                                                        >
                                                                            <FaTrash /> Delete
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="py-4 text-center poppins-medium">No sections available for this course</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {activeSection === 'settings' && (
                        <div>
                            <h2 className="text-xl underline font-semibold mb-6 poppins-semibold">Account Settings</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Update Email Form */}
                                <div className={`${themeClasses.card} p-6 rounded-lg border shadow-sm`}>
                                    <h3 className="text-lg poppins-medium mb-4">Update Email</h3>
                                    <form onSubmit={handleUpdateEmail}>
                                        <div className="mb-4">
                                            <label htmlFor="email" className="block mb-2 text-sm poppins-regular">Email Address</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={settingsForm.email}
                                                onChange={handleSettingsInputChange}
                                                className={`${themeClasses.input} w-full p-2 rounded-md border`}
                                                placeholder="Enter new email address"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className={`${themeClasses.button} px-4 py-2 rounded poppins-medium`}
                                        >
                                            Update Email
                                        </button>
                                    </form>
                                </div>

                                {/* Update Password Form */}
                                <div className={`${themeClasses.card} p-6 rounded-lg border shadow-sm`}>
                                    <h3 className="text-lg poppins-medium mb-4">Update Password</h3>
                                    <form onSubmit={handleUpdatePassword}>
                                        <div className="mb-4">
                                            <label htmlFor="currentPassword" className="block mb-2 text-sm poppins-regular">Current Password</label>
                                            <input
                                                type="password"
                                                id="currentPassword"
                                                name="currentPassword"
                                                value={settingsForm.currentPassword}
                                                onChange={handleSettingsInputChange}
                                                className={`${themeClasses.input} w-full p-2 rounded-md border`}
                                                placeholder="Enter current password"
                                                required
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label htmlFor="newPassword" className="block mb-2 text-sm poppins-regular">New Password</label>
                                            <input
                                                type="password"
                                                id="newPassword"
                                                name="newPassword"
                                                value={settingsForm.newPassword}
                                                onChange={handleSettingsInputChange}
                                                className={`${themeClasses.input} w-full p-2 rounded-md border`}
                                                placeholder="Enter new password"
                                                required
                                            />
                                            <div className="mt-2 space-y-1">
                                                {passwordValidation.map(rule => (
                                                    <ValidationItem
                                                        key={rule.id}
                                                        isValid={rule.isValid}
                                                        text={rule.text}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <label htmlFor="confirmPassword" className="block mb-2 text-sm poppins-regular">Confirm New Password</label>
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={settingsForm.confirmPassword}
                                                onChange={handleSettingsInputChange}
                                                className={`${themeClasses.input} w-full p-2 rounded-md border`}
                                                placeholder="Confirm new password"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className={`${themeClasses.button} px-4 py-2 rounded poppins-medium`}
                                        >
                                            Update Password
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
