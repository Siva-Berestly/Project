import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaUser, FaBook, FaSignOutAlt, FaCog } from 'react-icons/fa';

const AdminDashboard = () => {
    const { isDarkMode } = useOutletContext();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('overview');
    const navigate = useNavigate();

    // Stats for demonstration
    const stats = {
        totalCourses: 12,
        totalStudents: 245,
        completionRate: 68,
        activeUsers: 132
    };

    const themeClasses = {
        container: isDarkMode ? 'bg-[#202124] text-white' : 'bg-white text-gray-800',
        card: isDarkMode ? 'bg-[#292a2d] border-gray-700' : 'bg-gray-50 border-gray-200',
        sidebar: isDarkMode ? 'bg-[#292a2d] border-gray-700' : 'bg-gray-100 border-gray-200',
        button: isDarkMode
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white',
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
    }, [navigate]);

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
                        <ul className="space-y-1 poppins-regular">
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
                <div className="flex-1 p-6">
                    <h1 className="text-2xl font-bold mb-6 poppins-medium">Admin Dashboard</h1>

                    {activeSection === 'overview' && (
                        <div>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className={`${themeClasses.card} p-6 rounded-lg border shadow-sm`}>
                                    <h3 className="text-lg font-medium mb-2">Courses</h3>
                                    <p className="text-3xl font-bold">{stats.totalCourses}</p>
                                </div>
                                <div className={`${themeClasses.card} p-6 rounded-lg border shadow-sm`}>
                                    <h3 className="text-lg font-medium mb-2">Students</h3>
                                    <p className="text-3xl font-bold">{stats.totalStudents}</p>
                                </div>
                                <div className={`${themeClasses.card} p-6 rounded-lg border shadow-sm`}>
                                    <h3 className="text-lg font-medium mb-2">Completion Rate</h3>
                                    <p className="text-3xl font-bold">{stats.completionRate}%</p>
                                </div>
                                <div className={`${themeClasses.card} p-6 rounded-lg border shadow-sm`}>
                                    <h3 className="text-lg font-medium mb-2">Active Users</h3>
                                    <p className="text-3xl font-bold">{stats.activeUsers}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-4 mb-8">
                                <button className={`${themeClasses.button} px-4 py-2 rounded`}>Add New Course</button>
                                <button className={`${themeClasses.button} px-4 py-2 rounded`}>Manage Users</button>
                            </div>

                            {/* Recent Activity Placeholder */}
                            <div className={`${themeClasses.card} p-6 rounded-lg border shadow-sm`}>
                                <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                                <p className="text-sm opacity-75">No recent activity to display.</p>
                            </div>
                        </div>
                    )}

                    {activeSection === 'settings' && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Settings</h2>
                            <p className="mb-4">Manage your dashboard settings here.</p>

                            <div className={`${themeClasses.card} p-6 rounded-lg border shadow-sm`}>
                                <h3 className="font-medium mb-4">Profile Information</h3>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Username</label>
                                    <input
                                        type="text"
                                        value={user?.username || ''}
                                        className={`w-full p-2 border rounded ${isDarkMode ? 'bg-[#202124] border-gray-700' : 'bg-white border-gray-300'}`}
                                        disabled
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input
                                        type="text"
                                        value={user?.email || ''}
                                        className={`w-full p-2 border rounded ${isDarkMode ? 'bg-[#202124] border-gray-700' : 'bg-white border-gray-300'}`}
                                        disabled
                                    />
                                </div>
                                <button className={`${themeClasses.button} px-4 py-2 rounded`}>Change Password</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
