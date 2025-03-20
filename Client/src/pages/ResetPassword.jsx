import { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { FaLock, FaCheck, FaTimes } from 'react-icons/fa';
import PropTypes from 'prop-types';

const ResetPassword = () => {
    const { token } = useParams();
    const { isDarkMode } = useOutletContext();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    // Use an array of validation rules instead of an object
    const [passwordValidation, setPasswordValidation] = useState([
        { id: 'minLength', isValid: false, text: 'At least 8 characters' },
        { id: 'uppercase', isValid: false, text: 'One uppercase letter' },
        { id: 'lowercase', isValid: false, text: 'One lowercase letter' },
        { id: 'number', isValid: false, text: 'One number' },
        { id: 'special', isValid: false, text: 'One special character (!@#$%^&*)' }
    ]);

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
        successText: 'text-green-500',
    };

    useEffect(() => {
        if (!token) {
            setError('Invalid reset link');
        }
    }, [token]);

    const validatePassword = (password) => {
        return [
            { id: 'minLength', isValid: password.length >= 8 },
            { id: 'uppercase', isValid: /[A-Z]/.test(password) },
            { id: 'lowercase', isValid: /[a-z]/.test(password) },
            { id: 'number', isValid: /[0-9]/.test(password) },
            { id: 'special', isValid: /[!@#$%^&*]/.test(password) }
        ];
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'password') {
            // Update validation state
            setPasswordValidation(validatePassword(value));
        }

        if (name === 'confirmPassword') {
            if (value !== formData.password) {
                setError('Passwords do not match');
            } else {
                setError('');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Check if passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Check if all password validations pass
        const allValid = passwordValidation.every(rule => rule.isValid);
        if (!allValid) {
            setError('Password does not meet requirements');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: token,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Password reset failed');
            }

            setSuccess('Password reset successful! Redirecting to login...');

            // Redirect to login page after 3 seconds
            setTimeout(() => {
                navigate('/admin/login');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Password reset failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const ValidationItem = ({ isValid, text }) => (
        <div className={`flex items-center gap-2 ${isValid ? themeClasses.successText : themeClasses.errorText}`}>
            {isValid ? <FaCheck size={12} /> : <FaTimes size={12} />}
            <span className="text-sm">{text}</span>
        </div>
    );
    ValidationItem.propTypes = {
        isValid: PropTypes.bool.isRequired,
        text: PropTypes.string.isRequired,
    };

    return (
        <div className={`flex items-center justify-center min-h-[80vh] z-50 relative ${isDarkMode ? 'bg-[#202124] text-white' : 'bg-white text-[#202124]'}`}>
            <div className={`w-full max-w-md p-8 border rounded-lg shadow-md ${themeClasses.card} mx-4`}>
                <div className="flex justify-center mb-6">
                    <div className={`p-3 rounded-full ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                        <FaLock size={24} className="text-blue-600" />
                    </div>
                </div>
                <h2 className="text-2xl font-semibold text-center mb-6 poppins-medium">Reset Password</h2>

                {error && (
                    <div className={`p-3 mb-4 text-sm rounded-md ${isDarkMode ? 'bg-red-900/20' : 'bg-red-100'} ${themeClasses.errorText}`}>
                        {error}
                    </div>
                )}

                {success && (
                    <div className={`p-3 mb-4 text-sm rounded-md ${isDarkMode ? 'bg-green-900/20' : 'bg-green-100'} ${themeClasses.successText}`}>
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="password" className="block mb-2 text-sm font-medium poppins-regular">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`${themeClasses.input} block w-full p-2.5 rounded-lg border`}
                            placeholder="Enter your new password"
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

                    <div className="mb-6">
                        <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium poppins-regular">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`${themeClasses.input} block w-full p-2.5 rounded-lg border`}
                            placeholder="Confirm your new password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`${themeClasses.button} w-full py-2.5 px-5 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 poppins-medium`}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
