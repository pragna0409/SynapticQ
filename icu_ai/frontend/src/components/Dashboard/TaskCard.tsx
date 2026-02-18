import { useState } from 'react';
import { Star, MoreVertical, MessageSquare, Paperclip, Eye, Check } from 'lucide-react';

interface Subtask {
    id: string;
    title: string;
    type: string;
    color: string;
    completed: boolean;
}

interface Task {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: 'main' | 'secondary' | 'tertiary';
    progress: number;
    is_favorite: boolean;
    subtasks: Subtask[];
    interactions: {
        comments: number;
        views: number;
        attachments: number;
    };
}

interface TaskCardProps {
    task: Task;
    onDragStart: () => void;
    onUpdate: (updates: Partial<Task>) => void;
    onDelete: () => void;
}

const priorityColors = {
    main: 'border-l-4 border-l-blue-500',
    secondary: 'border-l-4 border-l-purple-500',
    tertiary: 'border-l-4 border-l-pink-500',
};

const subtaskColors: { [key: string]: string } = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    yellow: 'bg-yellow-500',
    teal: 'bg-teal-500',
};

export default function TaskCard({ task, onDragStart, onUpdate, onDelete }: TaskCardProps) {
    const [showMenu, setShowMenu] = useState(false);

    const toggleFavorite = () => {
        onUpdate({ is_favorite: !task.is_favorite });
    };

    const getTypeLabel = (type: string) => {
        return type || '•';
    };

    return (
        <div
            draggable
            onDragStart={onDragStart}
            className={`bg-gray-700 bg-opacity-50 backdrop-blur-sm rounded-lg p-4 cursor-move hover:bg-opacity-70 transition ${priorityColors[task.priority]}`}
        >
            {/* Card Header */}
            <div className="flex items-start justify-between mb-3">
                <h4 className="text-white font-semibold text-sm flex-1">
                    {task.priority === 'main' && 'Main Task'}
                    {task.priority === 'secondary' && 'Secondary Task'}
                    {task.priority === 'tertiary' && 'Tertiary Task'}
                </h4>
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="text-gray-400 hover:text-white transition"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-32 bg-gray-800 rounded-lg shadow-lg py-1 z-10 border border-gray-700">
                            <button
                                onClick={() => {
                                    onDelete();
                                    setShowMenu(false);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Subtasks */}
            <div className="space-y-2 mb-3">
                {task.subtasks.slice(0, 3).map((subtask) => (
                    <div key={subtask.id} className="flex items-center space-x-2">
                        <span className={`${subtaskColors[subtask.color] || 'bg-gray-500'} text-white text-xs font-bold px-2 py-1 rounded`}>
                            {getTypeLabel(subtask.type)}
                        </span>
                        <span className="text-gray-300 text-xs flex-1 truncate">
                            {subtask.title}
                        </span>
                        {subtask.completed && (
                            <Check className="h-3 w-3 text-green-400" />
                        )}
                    </div>
                ))}
                {task.subtasks.length > 3 && (
                    <div className="text-xs text-gray-400 ml-8">
                        +{task.subtasks.length - 3} more
                    </div>
                )}
            </div>

            {/* Team Members (if applicable) */}
            {task.status !== 'done' && task.priority === 'main' && (
                <div className="flex items-center space-x-1 mb-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                        A
                    </div>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 flex items-center justify-center text-white text-xs font-semibold">
                        B
                    </div>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                        C
                    </div>
                </div>
            )}

            {/* Progress Bar (for in_progress status) */}
            {task.status === 'in_progress' && (
                <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-pink-500 to-yellow-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Supervisor Approval (for editing status) */}
            {task.status === 'editing' && (
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400">Supervisor</span>
                    <div className="flex items-center space-x-1">
                        <Check className="h-4 w-4 text-green-400" />
                        {task.subtasks.length > 2 && (
                            <>
                                <Check className="h-4 w-4 text-green-400" />
                                <Check className="h-4 w-4 text-green-400" />
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Footer - Interactions and Favorite */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-600">
                <div className="flex items-center space-x-3 text-gray-400 text-xs">
                    <div className="flex items-center space-x-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{task.interactions.comments}</span>
                    </div>
                    {task.interactions.attachments > 0 && (
                        <div className="flex items-center space-x-1">
                            <Paperclip className="h-3 w-3" />
                        </div>
                    )}
                    <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{task.interactions.views}</span>
                    </div>
                </div>
                <button
                    onClick={toggleFavorite}
                    className={`transition ${task.is_favorite ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
                >
                    <Star className={`h-4 w-4 ${task.is_favorite ? 'fill-current' : ''}`} />
                </button>
            </div>
        </div>
    );
}
