
import { MoreVertical } from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    status_message?: string;
}

interface UserProfileProps {
    user: User | null;
}

export default function UserProfile({ user }: UserProfileProps) {
    if (!user) return null;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="bg-gray-700 bg-opacity-50 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
                <h3 className="text-white font-semibold">{user.name}</h3>
                <button className="text-gray-400 hover:text-white transition">
                    <MoreVertical className="h-4 w-4" />
                </button>
            </div>

            {/* Avatar */}
            <div className="flex justify-center mb-4">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-yellow-600 p-1">
                        <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">
                                {getInitials(user.name)}
                            </span>
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-gray-800"></div>
                </div>
            </div>

            {/* Status Message */}
            <p className="text-center text-gray-400 text-sm">
                {user.status_message || 'Ready to build amazing projects!'}
            </p>
        </div>
    );
}
