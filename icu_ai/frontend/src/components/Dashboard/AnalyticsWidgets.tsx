import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface Task {
    id: string;
    status: string;
    priority: string;
    progress: number;
}

interface AnalyticsWidgetsProps {
    tasks: Task[];
}

interface ScheduleBlock {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    color: string;
}

export default function AnalyticsWidgets({ tasks }: AnalyticsWidgetsProps) {
    const { token } = useAuth();
    const [schedule, setSchedule] = useState<ScheduleBlock[]>([]);

    useEffect(() => {
        loadSchedule();
    }, []);

    const loadSchedule = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/schedule', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setSchedule(data.schedule);
            }
        } catch (error) {
            console.error('Error loading schedule:', error);
        }
    };

    // Calculate completed tasks by priority
    const completedTasks = tasks.filter(t => t.status === 'done');
    const mainCompleted = completedTasks.filter(t => t.priority === 'main').length;
    const secondaryCompleted = completedTasks.filter(t => t.priority === 'secondary').length;
    const tertiaryCompleted = completedTasks.filter(t => t.priority === 'tertiary').length;

    // Calculate efficiency
    const totalProgress = tasks.reduce((sum, t) => sum + t.progress, 0);
    const avgProgress = tasks.length > 0 ? Math.round(totalProgress / tasks.length) : 0;
    const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
    const efficiency = Math.round((avgProgress + completionRate) / 2);

    const maxCompleted = Math.max(mainCompleted, secondaryCompleted, tertiaryCompleted, 1);

    const colorMap: { [key: string]: string } = {
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        pink: 'bg-pink-500',
        yellow: 'bg-yellow-500',
        teal: 'bg-teal-500',
    };

    return (
        <div className="space-y-6">
            {/* Completed Tasks Widget */}
            <div className="bg-gray-700 bg-opacity-50 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4">COMPLETED TASKS</h3>
                <div className="flex items-end justify-between h-32 space-x-2">
                    {/* Main */}
                    <div className="flex-1 flex flex-col items-center">
                        <div
                            className="w-full bg-blue-500 rounded-t transition-all duration-300"
                            style={{ height: `${(mainCompleted / maxCompleted) * 100}%` }}
                        ></div>
                        <div className="text-white font-bold text-lg mt-2">{mainCompleted}</div>
                        <div className="text-gray-400 text-xs">Main</div>
                    </div>

                    {/* Secondary */}
                    <div className="flex-1 flex flex-col items-center">
                        <div
                            className="w-full bg-purple-500 rounded-t transition-all duration-300"
                            style={{ height: `${(secondaryCompleted / maxCompleted) * 100}%` }}
                        ></div>
                        <div className="text-white font-bold text-lg mt-2">{secondaryCompleted}</div>
                        <div className="text-gray-400 text-xs">Secondary</div>
                    </div>

                    {/* Tertiary */}
                    <div className="flex-1 flex flex-col items-center">
                        <div
                            className="w-full bg-pink-500 rounded-t transition-all duration-300"
                            style={{ height: `${(tertiaryCompleted / maxCompleted) * 100}%` }}
                        ></div>
                        <div className="text-white font-bold text-lg mt-2">{tertiaryCompleted}</div>
                        <div className="text-gray-400 text-xs">Tertiary</div>
                    </div>
                </div>
            </div>

            {/* Efficiency Widget */}
            <div className="bg-gray-700 bg-opacity-50 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4">EFFICIENCY</h3>
                <div className="flex items-center justify-center">
                    <div className="relative w-32 h-32">
                        <svg className="transform -rotate-90 w-32 h-32">
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-gray-600"
                            />
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={`${2 * Math.PI * 56}`}
                                strokeDashoffset={`${2 * Math.PI * 56 * (1 - efficiency / 100)}`}
                                className={`${efficiency >= 75 ? 'text-blue-500' :
                                    efficiency >= 50 ? 'text-purple-500' :
                                        efficiency >= 25 ? 'text-pink-500' :
                                            'text-yellow-500'
                                    } transition-all duration-500`}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">{efficiency}</div>
                                <div className="text-xs text-gray-400">%</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-4 text-center">
                    <div className="text-xs text-gray-400">Overall Efficiency</div>
                    <div className="text-sm text-gray-300 mt-1">
                        {tasks.length} total tasks • {completedTasks.length} completed
                    </div>
                </div>
            </div>

            {/* Plan Widget */}
            <div className="bg-gray-700 bg-opacity-50 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4">PLAN</h3>
                <div className="space-y-3">
                    {schedule.length > 0 ? (
                        schedule.map((block) => (
                            <div key={block.id} className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-1 h-8 ${colorMap[block.color] || 'bg-gray-500'} rounded`}></div>
                                    <div className="flex-1">
                                        <div className="text-xs text-gray-400">
                                            {block.start_time} - {block.end_time}
                                        </div>
                                        <div className="text-sm text-white truncate">{block.title}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <>
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <div className="w-1 h-8 bg-blue-500 rounded"></div>
                                    <div className="flex-1">
                                        <div className="text-xs text-gray-400">12:00 - 13:00</div>
                                        <div className="text-sm text-white truncate">Review project evaluations</div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <div className="w-1 h-8 bg-teal-500 rounded"></div>
                                    <div className="flex-1">
                                        <div className="text-xs text-gray-400">13:00 - 14:00</div>
                                        <div className="text-sm text-white truncate">Work on draft tasks</div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <div className="w-1 h-8 bg-pink-500 rounded"></div>
                                    <div className="flex-1">
                                        <div className="text-xs text-gray-400">14:00 - 15:00</div>
                                        <div className="text-sm text-white truncate">Team meeting and sync</div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <div className="w-1 h-8 bg-yellow-500 rounded"></div>
                                    <div className="flex-1">
                                        <div className="text-xs text-gray-400">15:00 - 16:00</div>
                                        <div className="text-sm text-white truncate">Final polish and testing</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
