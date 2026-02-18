import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

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

interface KanbanBoardProps {
    tasks: Task[];
    onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
    onTaskDelete: (taskId: string) => void;
    onRefresh: () => void;
}

const columns = [
    { id: 'draft', title: 'DRAFT', color: 'from-purple-600 to-purple-800' },
    { id: 'in_progress', title: 'IN PROGRESS', color: 'from-pink-600 to-yellow-600' },
    { id: 'editing', title: 'EDITING', color: 'from-teal-600 to-purple-600' },
    { id: 'done', title: 'DONE', color: 'from-blue-600 to-pink-600' },
];

export default function KanbanBoard({ tasks, onTaskUpdate, onTaskDelete, onRefresh }: KanbanBoardProps) {
    const [draggedTask, setDraggedTask] = useState<Task | null>(null);

    const handleDragStart = (task: Task) => {
        setDraggedTask(task);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (status: string) => {
        if (draggedTask) {
            onTaskUpdate(draggedTask.id, { status: status as Task['status'] });
            setDraggedTask(null);
        }
    };

    const getTasksByStatus = (status: string) => {
        return tasks.filter(task => task.status === status);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 h-full">
            {columns.map((column) => (
                <div
                    key={column.id}
                    className="flex flex-col min-w-0"
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(column.id)}
                >
                    {/* Column Header */}
                    <div className={`bg-gradient-to-r ${column.color} rounded-t-lg p-4 text-white`}>
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-sm tracking-wider">{column.title}</h3>
                            <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs">
                                {getTasksByStatus(column.id).length}
                            </span>
                        </div>
                    </div>

                    {/* Column Content */}
                    <div className="flex-1 bg-gray-800 bg-opacity-30 rounded-b-lg p-3 lg:p-4 space-y-3 lg:space-y-4 min-h-[300px] lg:min-h-[500px]">
                        {getTasksByStatus(column.id).map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onDragStart={() => handleDragStart(task)}
                                onUpdate={(updates) => onTaskUpdate(task.id, updates)}
                                onDelete={() => onTaskDelete(task.id)}
                            />
                        ))}

                        {/* Add Task Button */}
                        <button className="w-full py-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition flex items-center justify-center space-x-2">
                            <Plus className="h-5 w-5" />
                            <span>Add Task</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
