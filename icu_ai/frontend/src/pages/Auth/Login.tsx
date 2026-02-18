import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 px-4">
            <div className="max-w-md w-full">
                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        AI Hackathon Helper
                    </h1>
                    <p className="text-gray-400">Sign in to manage your projects</p>
                </div>

                {/* Login Card */}
                <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-700">
                    <h2 className="text-2xl font-bold text-white mb-6">Welcome Back</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
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
                        </div>

                        {/* Forgot Password Link */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    className="h-4 w-4 bg-gray-700 border-gray-600 rounded text-purple-500 focus:ring-purple-500"
                                />
                                <label htmlFor="remember" className="ml-2 block text-sm text-gray-300">
                                    Remember me
                                </label>
                            </div>
                            <a href="#" className="text-sm text-purple-400 hover:text-purple-300 transition">
                                Forgot password?
                            </a>
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
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
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

                    {/* Sign Up Link */}
                    <p className="mt-6 text-center text-sm text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-semibold transition">
                            Sign up
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-xs text-gray-500">
                    By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
};

export default Login;
