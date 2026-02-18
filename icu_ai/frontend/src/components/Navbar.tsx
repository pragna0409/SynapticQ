import { Link, useNavigate } from 'react-router-dom';
import { Rocket, Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        navigate('/');
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <Rocket className="h-8 w-8 text-primary-600" />
                            <span className="text-xl font-bold text-gray-900">AI Hackathon Helper</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors">
                            Home
                        </Link>
                        <Link to="/evaluate" className="text-gray-700 hover:text-primary-600 transition-colors">
                            Evaluate Project
                        </Link>
                        <Link to="/generate" className="text-gray-700 hover:text-primary-600 transition-colors">
                            Generate Ideas
                        </Link>
                        {isAuthenticated && (
                            <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors">
                                Dashboard
                            </Link>
                        )}

                        {/* Auth Buttons / User Menu */}
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium">{user?.name}</span>
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200">
                                        <Link
                                            to="/dashboard"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <User className="inline h-4 w-4 mr-2" />
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <LogOut className="inline h-4 w-4 mr-2" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-700 hover:text-primary-600"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="md:hidden bg-white border-t">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <Link
                            to="/"
                            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                            onClick={() => setIsOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            to="/evaluate"
                            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                            onClick={() => setIsOpen(false)}
                        >
                            Evaluate Project
                        </Link>
                        <Link
                            to="/generate"
                            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                            onClick={() => setIsOpen(false)}
                        >
                            Generate Ideas
                        </Link>
                        {isAuthenticated && (
                            <Link
                                to="/dashboard"
                                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                                onClick={() => setIsOpen(false)}
                            >
                                Dashboard
                            </Link>
                        )}

                        {/* Mobile Auth Buttons */}
                        {isAuthenticated ? (
                            <>
                                <div className="px-3 py-2 text-sm text-gray-500 border-t mt-2 pt-2">
                                    Signed in as <span className="font-semibold">{user?.name}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsOpen(false);
                                    }}
                                    className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                                >
                                    <LogOut className="inline h-4 w-4 mr-2" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md border-t mt-2 pt-2"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="block px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md text-center"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
