import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import KanbanBoard from '../components/Dashboard/KanbanBoard';
import UserProfile from '../components/Dashboard/UserProfile';
import AnalyticsWidgets from '../components/Dashboard/AnalyticsWidgets';
import { LayoutGrid, MessageSquare, CheckSquare, Calendar, Globe, BarChart3, User as UserIcon, Bookmark, Lightbulb, FileText } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    description: string;
    status: 'draft' | 'in_progress' | 'editing' | 'done';
    priority: 'main' | 'secondary' | 'tertiary';
    progress: number;
    is_favorite: boolean;
    subtasks: Array<{
        id: string;
        title: string;
        type: string;
        color: string;
        completed: boolean;
    }>;
    interactions: {
        comments: number;
        views: number;
        attachments: number;
    };
}

interface SavedProject {
    id: string;
    type: 'evaluation' | 'idea';
    name: string;
    created_at: string;
    task_id?: string;
    project_id?: string;
    idea_id?: string;
}

export default function Dashboard() {
    const { user, token } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        loadTasks();
        loadSavedProjects();
    }, []);

    const loadSavedProjects = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/saved-projects', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setSavedProjects(data.saved_projects || []);
            }
        } catch (error) {
            console.error('Error loading saved projects:', error);
        }
    };

    const loadTasks = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/tasks', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setTasks(data.tasks);
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
        try {
            const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updates),
            });

            if (response.ok) {
                await loadTasks();
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleTaskDelete = async (taskId: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                await loadTasks();
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading your dashboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            {/* Top Navigation Bar */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold text-white">Task Management</h1>
                            <div className="text-sm text-gray-400">
                                Tasks › Today
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="text-gray-400 hover:text-white transition">
                                Pricing
                            </button>
                            <button className="text-gray-400 hover:text-white transition">
                                About
                            </button>
                            <button className="text-gray-400 hover:text-white transition">
                                Language
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row">
                {/* Left Sidebar - Icon Navigation */}
                <div className="w-full lg:w-16 bg-gray-800 bg-opacity-50 backdrop-blur-lg border-r border-gray-700 flex flex-row lg:flex-col items-center justify-center lg:justify-start py-4 lg:py-6 space-x-4 lg:space-x-0 lg:space-y-6">
                    <button
                        onClick={() => setActiveView(activeView === 'grid' ? 'list' : 'grid')}
                        className="p-3 rounded-lg hover:bg-gray-700 transition text-gray-400 hover:text-white"
                        title="Toggle View"
                    >
                        <LayoutGrid className="h-6 w-6" />
                    </button>
                    <button className="p-3 rounded-lg hover:bg-gray-700 transition text-gray-400 hover:text-white" title="Messages">
                        <MessageSquare className="h-6 w-6" />
                    </button>
                    <button className="p-3 rounded-lg hover:bg-gray-700 transition text-gray-400 hover:text-white" title="Completed">
                        <CheckSquare className="h-6 w-6" />
                    </button>
                    <button className="p-3 rounded-lg hover:bg-gray-700 transition text-gray-400 hover:text-white" title="Calendar">
                        <Calendar className="h-6 w-6" />
                    </button>
                    <button className="p-3 rounded-lg hover:bg-gray-700 transition text-gray-400 hover:text-white" title="Global">
                        <Globe className="h-6 w-6" />
                    </button>
                    <button className="p-3 rounded-lg hover:bg-gray-700 transition text-gray-400 hover:text-white" title="Analytics">
                        <BarChart3 className="h-6 w-6" />
                    </button>
                    <button className="p-3 rounded-lg hover:bg-gray-700 transition text-gray-400 hover:text-white" title="Profile">
                        <UserIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-4 lg:p-6 overflow-x-auto">
                    <div className="animate-fade-in">
                        <KanbanBoard
                            tasks={tasks}
                            onTaskUpdate={handleTaskUpdate}
                            onTaskDelete={handleTaskDelete}
                            onRefresh={loadTasks}
                        />
                    </div>
                </div>

                {/* Right Sidebar - User Profile & Analytics */}
                <div className="w-full lg:w-80 bg-gray-800 bg-opacity-50 backdrop-blur-lg border-t lg:border-l border-gray-700 p-4 lg:p-6 space-y-6 overflow-y-auto">
                    <UserProfile user={user} />
                    <AnalyticsWidgets tasks={tasks} />
                    
                    {/* Saved Projects Section */}
                    <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-4">
                            <Bookmark className="h-5 w-5 text-yellow-400" />
                            <h3 className="text-lg font-semibold text-white">Saved Items</h3>
                        </div>
                        {savedProjects.length === 0 ? (
                            <p className="text-gray-400 text-sm">No saved items yet</p>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {savedProjects.slice(0, 5).map((saved) => (
                                    <div
                                        key={saved.id}
                                        className="bg-gray-600 bg-opacity-50 rounded p-3 hover:bg-opacity-70 transition cursor-pointer"
                                        onClick={() => {
                                            if (saved.task_id) {
                                                // Scroll to task if it exists
                                                const taskElement = document.querySelector(`[data-task-id="${saved.task_id}"]`);
                                                if (taskElement) {
                                                    taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                }
                                            }
                                        }}
                                    >
                                        <div className="flex items-start space-x-2">
                                            {saved.type === 'idea' ? (
                                                <Lightbulb className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                            ) : (
                                                <FileText className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm font-medium truncate">{saved.name}</p>
                                                <p className="text-gray-400 text-xs mt-1">
                                                    {saved.type === 'idea' ? 'Idea' : 'Evaluation'}
                                                    {saved.task_id && ' • Has Task'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {savedProjects.length > 5 && (
                                    <p className="text-gray-400 text-xs text-center pt-2">
                                        +{savedProjects.length - 5} more
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
