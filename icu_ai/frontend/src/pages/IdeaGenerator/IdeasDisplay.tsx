import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Zap, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { IdeaResponse } from '../../services/api';

export default function IdeasDisplay() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, token } = useAuth();
    const [ideas] = useState<IdeaResponse | null>(location.state?.ideas || null);
    const [selectedIdea, setSelectedIdea] = useState<number | null>(null);
    const [savingStates, setSavingStates] = useState<Record<number, { saving: boolean; saved: boolean }>>({});

    useEffect(() => {
        if (!ideas && !id) {
            navigate('/generate');
        }
    }, [ideas, id, navigate]);

    const handleSaveForLater = async (ideaIndex: number) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setSavingStates(prev => ({ ...prev, [ideaIndex]: { saving: true, saved: false } }));

        try {
            const response = await fetch('http://localhost:5000/api/saved-projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    type: 'idea',
                    idea_id: ideas?.id,
                    idea_index: ideaIndex,
                    create_task: false, // Just save, don't create task
                }),
            });

            if (response.ok) {
                setSavingStates(prev => ({ ...prev, [ideaIndex]: { saving: false, saved: true } }));
                setTimeout(() => {
                    setSavingStates(prev => ({ ...prev, [ideaIndex]: { saving: false, saved: false } }));
                }, 3000);
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            console.error('Error saving idea:', error);
            setSavingStates(prev => ({ ...prev, [ideaIndex]: { saving: false, saved: false } }));
            alert('Failed to save idea. Please try again.');
        }
    };

    const handleStartBuilding = async (ideaIndex: number) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setSavingStates(prev => ({ ...prev, [ideaIndex]: { saving: true, saved: false } }));

        try {
            const response = await fetch('http://localhost:5000/api/saved-projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    type: 'idea',
                    idea_id: ideas?.id,
                    idea_index: ideaIndex,
                    create_task: true, // Create task and save
                }),
            });

            if (response.ok) {
                setSavingStates(prev => ({ ...prev, [ideaIndex]: { saving: false, saved: true } }));
                // Navigate to dashboard after a short delay
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
            } else {
                throw new Error('Failed to start building');
            }
        } catch (error) {
            console.error('Error starting build:', error);
            setSavingStates(prev => ({ ...prev, [ideaIndex]: { saving: false, saved: false } }));
            alert('Failed to start building. Please try again.');
        }
    };

    if (!ideas) {
        return <div>Loading...</div>;
    }

    const getMatchColor = (score: number) => {
        if (score >= 90) return 'bg-green-100 text-green-700 border-green-300';
        if (score >= 80) return 'bg-blue-100 text-blue-700 border-blue-300';
        if (score >= 70) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
        return 'bg-gray-100 text-gray-700 border-gray-300';
    };

    const getMatchLabel = (score: number) => {
        if (score >= 90) return '💚 BEST MATCH';
        if (score >= 80) return '💛 GREAT FIT';
        if (score >= 70) return '🧡 GOOD FIT';
        return '💙 CONSIDER';
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <Link to="/generate" className="flex items-center text-gray-600 hover:text-gray-900">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Questions
                </Link>
                <button className="btn-secondary">
                    Generate New Ideas
                </button>
            </div>

            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-2">🎉 Here Are Your Personalized Ideas!</h1>
                <p className="text-gray-600">Based on your profile, we generated {ideas.ideas.length} tailored project ideas</p>
            </div>

            {/* Ideas Grid */}
            <div className="space-y-6">
                {ideas.ideas.map((idea, index) => (
                    <div
                        key={index}
                        className={`card hover:shadow-xl transition-all duration-200 cursor-pointer ${selectedIdea === index ? 'ring-2 ring-primary-500' : ''
                            }`}
                        onClick={() => setSelectedIdea(selectedIdea === index ? null : index)}
                    >
                        {/* Idea Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 border ${getMatchColor(idea.match_score)}`}>
                                    {getMatchLabel(idea.match_score)} ({idea.match_score}% fit)
                                </div>
                                <h2 className="text-2xl font-bold mb-1">{idea.name}</h2>
                                <p className="text-gray-600 italic">{idea.tagline}</p>
                            </div>
                            <button className="text-gray-400 hover:text-red-500 transition-colors">
                                <Heart className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="text-sm text-gray-600">Complexity</div>
                                <div className="font-semibold capitalize">{idea.feasibility.complexity}</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="text-sm text-gray-600">Domain</div>
                                <div className="font-semibold">{idea.domain || 'General'}</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="text-sm text-gray-600">Time Fit</div>
                                <div className="font-semibold text-xs">{idea.feasibility.time_fit.split(' ').slice(0, 3).join(' ')}</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="text-sm text-gray-600">Impact</div>
                                <div className="font-semibold">{idea.impact.scale.split(' ')[0]}</div>
                            </div>
                        </div>

                        {/* Collapsed View */}
                        {selectedIdea !== index && (
                            <div>
                                <h3 className="font-semibold mb-2">The Problem:</h3>
                                <p className="text-gray-700 mb-4 line-clamp-2">{idea.problem.statement}</p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <span className="flex items-center">
                                            <Zap className="h-4 w-4 mr-1" />
                                            {idea.technical.tech_stack.slice(0, 3).join(', ')}
                                        </span>
                                    </div>
                                    <button className="text-primary-600 hover:text-primary-700 font-medium">
                                        View Full Details →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Expanded View */}
                        {selectedIdea === index && (
                            <div className="space-y-6 mt-6 border-t pt-6">
                                {/* Problem */}
                                <div>
                                    <h3 className="font-bold text-lg mb-2">❓ The Problem</h3>
                                    <p className="text-gray-700 mb-2">{idea.problem.statement}</p>
                                    <p className="text-gray-600 text-sm"><strong>Why it matters:</strong> {idea.problem.why_matters}</p>
                                    <p className="text-gray-600 text-sm"><strong>Current gaps:</strong> {idea.problem.current_gaps}</p>
                                </div>

                                {/* Solution */}
                                <div>
                                    <h3 className="font-bold text-lg mb-2">💡 Your Solution</h3>
                                    <p className="text-gray-700 mb-3">{idea.solution.description}</p>
                                    <div>
                                        <strong className="text-sm">Key Features:</strong>
                                        <ul className="list-disc list-inside mt-1 space-y-1">
                                            {idea.solution.key_features.map((feature, idx) => (
                                                <li key={idx} className="text-gray-700">{feature}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="mt-3 p-3 bg-primary-50 rounded-lg">
                                        <strong className="text-primary-700">Unique Value:</strong>
                                        <p className="text-primary-900 mt-1">{idea.solution.value_proposition}</p>
                                    </div>
                                </div>

                                {/* Technical Approach */}
                                <div>
                                    <h3 className="font-bold text-lg mb-2">🛠️ Technical Approach</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <strong className="text-sm">Tech Stack:</strong>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {idea.technical.tech_stack.map((tech, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <strong className="text-sm">Key Components:</strong>
                                            <ul className="list-disc list-inside mt-2 text-sm">
                                                {idea.technical.components.map((comp, idx) => (
                                                    <li key={idx} className="text-gray-700">{comp}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <strong className="text-sm">Architecture:</strong>
                                        <p className="text-gray-700 text-sm mt-1">{idea.technical.architecture}</p>
                                    </div>
                                </div>

                                {/* Implementation Roadmap */}
                                <div>
                                    <h3 className="font-bold text-lg mb-2">⏱️ Implementation Roadmap</h3>
                                    <div className="space-y-3">
                                        {[
                                            { phase: 'Phase 1', data: idea.roadmap.phase1, color: 'border-green-500' },
                                            { phase: 'Phase 2', data: idea.roadmap.phase2, color: 'border-yellow-500' },
                                            { phase: 'Phase 3', data: idea.roadmap.phase3, color: 'border-blue-500' }
                                        ].map((phase, idx) => (
                                            <div key={idx} className={`border-l-4 ${phase.color} pl-4`}>
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <strong className="text-sm">{phase.phase}</strong>
                                                    <span className="text-xs text-gray-600">({phase.data.hours})</span>
                                                </div>
                                                <ul className="list-disc list-inside text-sm space-y-1">
                                                    {phase.data.tasks.map((task, taskIdx) => (
                                                        <li key={taskIdx} className="text-gray-700">{task}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Wow Factors */}
                                <div>
                                    <h3 className="font-bold text-lg mb-2">✨ Wow Factors</h3>
                                    <div className="grid md:grid-cols-2 gap-2">
                                        {idea.wow_factors.map((factor, idx) => (
                                            <div key={idx} className="flex items-start space-x-2 p-2 bg-yellow-50 rounded">
                                                <Zap className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-700">{factor}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex space-x-4 pt-4 border-t">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleStartBuilding(index);
                                        }}
                                        disabled={savingStates[index]?.saving || savingStates[index]?.saved}
                                        className={`btn-primary flex-1 flex items-center justify-center ${
                                            savingStates[index]?.saved ? 'bg-green-600 hover:bg-green-700' : ''
                                        }`}
                                    >
                                        {savingStates[index]?.saving ? (
                                            <>Saving...</>
                                        ) : savingStates[index]?.saved ? (
                                            <>
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Saved! Redirecting...
                                            </>
                                        ) : (
                                            <>Start Building This Idea</>
                                        )}
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSaveForLater(index);
                                        }}
                                        disabled={savingStates[index]?.saving || savingStates[index]?.saved}
                                        className={`btn-secondary flex items-center justify-center ${
                                            savingStates[index]?.saved ? 'bg-green-100 text-green-700 border-green-300' : ''
                                        }`}
                                    >
                                        {savingStates[index]?.saving ? (
                                            <>Saving...</>
                                        ) : savingStates[index]?.saved ? (
                                            <>
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Saved!
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Save for Later
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
