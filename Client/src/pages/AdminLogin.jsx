import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import { HiX } from 'react-icons/hi';

const AdminLogin = () => {
    const { isDarkMode } = useOutletContext();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [error, setError] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const navigate = useNavigate();

    const themeClasses = {
        card: isDarkMode
            ? 'bg-[#202124] border-gray-700'
            : 'bg-white border-gray-200',
        input: isDarkMode
            ? 'bg-[#202124] border-gray-600 text-white'
            : 'bg-white border-gray-300 text-[#202124]',
        button: 'bg-blue-600 hover:bg-blue-700 text-white',
        errorText: 'text-red-500',
        modal: isDarkMode
            ? 'bg-[#292a2d] border-gray-700'
            : 'bg-white border-gray-200',
        overlay: 'bg-black bg-opacity-50',
        link: 'text-blue-500 hover:text-blue-600',
        successText: 'text-green-500',
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            // Check if response is OK before trying to parse JSON
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json();

            // Save token to localStorage
            localStorage.setItem('authToken', data.token);
            navigate('/admin/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Login failed. Please check your credentials and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setResetMessage('');
        setResetLoading(true);

        try {
            // Replace with your actual password reset API call
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: forgotPasswordEmail })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Password reset request failed');
            }

            setResetMessage('Password reset instructions sent to your email.');

            // Display development information if available
            if (data.resetUrl) {
                console.info('Development mode - Reset URL:', data.resetUrl);
                if (!data.emailSent) {
                    setResetMessage('Email server is not configured properly. In development mode, you can use this token to reset your password: ' + data.resetToken);
                }
            }

            // Close the modal after 5 seconds to give time to read any development messages
            setTimeout(() => {
                setShowForgotPassword(false);
            }, 5000);
        } catch (err) {
            setError(err.message || 'Password reset request failed. Please try again.');
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className={`flex items-center justify-center min-h-[80vh] z-50 relative ${isDarkMode ? 'bg-[#202124] text-white' : 'bg-white text-[#202124]'}`}>
            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className={`${themeClasses.overlay} fixed inset-0`} onClick={() => setShowForgotPassword(false)}></div>
                    <div className={`${themeClasses.modal} w-full max-w-md p-6 rounded-lg shadow-lg relative`}>
                        <button
                            onClick={() => setShowForgotPassword(false)}
                            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                        >
                            <HiX size={20} />
                        </button>
                        <h3 className="text-xl font-semibold mb-4 poppins-medium">Reset Password</h3>

                        {error && (
                            <div className={`p-3 mb-4 text-sm rounded-md ${isDarkMode ? 'bg-red-900/20' : 'bg-red-100'} ${themeClasses.errorText}`}>
                                {error}
                            </div>
                        )}

                        {resetMessage && (
                            <div className={`p-3 mb-4 text-sm rounded-md ${isDarkMode ? 'bg-green-900/20' : 'bg-green-100'} ${themeClasses.successText}`}>
                                {resetMessage}
                            </div>
                        )}

                        <form onSubmit={handleForgotPassword}>
                            <div className="mb-4">
                                <label htmlFor="email" className="block mb-2 text-sm font-medium poppins-regular">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <FaEnvelope className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
                                    </div>
                                    <input
                                        type="email"
                                        id="reset-email"
                                        value={forgotPasswordEmail}
                                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                        className={`${themeClasses.input} pl-10 block w-full p-2.5 rounded-lg border`}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={resetLoading}
                                className={`${themeClasses.button} w-full py-2.5 px-5 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 poppins-medium`}
                            >
                                {resetLoading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className={`w-full max-w-md p-8 border rounded-lg shadow-md ${themeClasses.card} mx-4`}>
                <div className="flex justify-center mb-6">
                    <div className={`p-3 rounded-full ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                        <FaLock size={24} className="text-blue-600" />
                    </div>
                </div>
                <h2 className="text-2xl font-semibold text-center mb-6 poppins-medium">Admin Login</h2>

                {error && (
                    <div className={`p-3 mb-4 text-sm rounded-md ${isDarkMode ? 'bg-red-900/20' : 'bg-red-100'} ${themeClasses.errorText}`}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="username" className="block mb-2 text-sm font-medium poppins-regular">
                            Username
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <FaUser className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
                            </div>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                autoComplete="username"
                                value={formData.username}
                                onChange={handleChange}
                                className={`${themeClasses.input} pl-10 block w-full p-2.5 rounded-lg border poppins-regular`}
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-2">
                        <label htmlFor="password" className="block mb-2 text-sm font-medium poppins-regular">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <FaLock className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
                            </div>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                autoComplete="current-password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`${themeClasses.input} pl-10 block w-full p-2.5 rounded-lg border poppins-regular`}
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-6 text-right poppins-regular">
                        <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className={`text-sm ${themeClasses.link}`}
                        >
                            Forgot Password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`${themeClasses.button} w-full py-2.5 px-5 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 poppins-medium`}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
