import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Signup: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const getPasswordStrength = (pass: string): { strength: number; label: string; color: string } => {
        let strength = 0;
        if (pass.length >= 8) strength++;
        if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++;
        if (pass.match(/\d/)) strength++;
        if (pass.match(/[^a-zA-Z\d]/)) strength++;

        if (strength === 0) return { strength: 0, label: '', color: '' };
        if (strength <= 2) return { strength: 33, label: 'Weak', color: 'bg-red-500' };
        if (strength === 3) return { strength: 66, label: 'Medium', color: 'bg-yellow-500' };
        return { strength: 100, label: 'Strong', color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength(password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (!agreedToTerms) {
            setError('Please agree to the Terms of Service and Privacy Policy');
            return;
        }

        setIsLoading(true);

        try {
            await signup(name, email, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Signup failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 px-4 py-12">
            <div className="max-w-md w-full">
                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        AI Hackathon Helper
                    </h1>
                    <p className="text-gray-400">Create your account to get started</p>
                </div>

                {/* Signup Card */}
                <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-700">
                    <h2 className="text-2xl font-bold text-white mb-6">Sign Up</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Input */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                placeholder="John Doe"
                            />
                        </div>

                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                placeholder="you@example.com"
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                placeholder="••••••••"
                            />

                            {/* Password Strength Indicator */}
                            {password && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-400">Password Strength:</span>
                                        <span className={`text-xs font-semibold ${passwordStrength.label === 'Weak' ? 'text-red-400' :
                                                passwordStrength.label === 'Medium' ? 'text-yellow-400' :
                                                    'text-green-400'
                                            }`}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                            style={{ width: `${passwordStrength.strength}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                placeholder="••••••••"
                            />
                            {confirmPassword && password !== confirmPassword && (
                                <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
                            )}
                        </div>

                        {/* Terms and Conditions */}
                        <div className="flex items-start">
                            <input
                                id="terms"
                                type="checkbox"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="mt-1 h-4 w-4 bg-gray-700 border-gray-600 rounded text-purple-500 focus:ring-purple-500"
                            />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
                                I agree to the{' '}
                                <a href="#" className="text-purple-400 hover:text-purple-300">
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="#" className="text-purple-400 hover:text-purple-300">
                                    Privacy Policy
                                </a>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating account...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-6 mb-6 flex items-center">
                        <div className="flex-1 border-t border-gray-600"></div>
                        <span className="px-4 text-sm text-gray-400">or</span>
                        <div className="flex-1 border-t border-gray-600"></div>
                    </div>

                    {/* Continue as Guest */}
                    <Link
                        to="/"
                        className="block w-full py-3 px-4 bg-gray-700 bg-opacity-50 hover:bg-opacity-70 text-white font-semibold rounded-lg text-center transition border border-gray-600"
                    >
                        Continue as Guest
                    </Link>

                    {/* Login Link */}
                    <p className="mt-6 text-center text-sm text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition">
                            Sign in
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-xs text-gray-500">
                    By creating an account, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
};

export default Signup;
