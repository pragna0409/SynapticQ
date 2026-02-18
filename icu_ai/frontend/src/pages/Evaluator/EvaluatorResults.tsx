import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw, Target, Lightbulb, TrendingUp, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import type { EvaluationResponse } from '../../services/api';

export default function EvaluatorResults() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, token } = useAuth();
    const [evaluation] = useState<EvaluationResponse | null>(location.state?.evaluation || null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!evaluation && !id) {
            navigate('/evaluate');
        }
    }, [evaluation, id, navigate]);

    const handleSaveToDashboard = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setSaving(true);
        try {
            const response = await fetch('http://localhost:5000/api/saved-projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    type: 'evaluation',
                    project_id: id,
                }),
            });

            if (response.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error('Error saving to dashboard:', error);
        } finally {
            setSaving(false);
        }
    };

    if (!evaluation) {
        return <div>Loading...</div>;
    }

    const radarData = [
        { dimension: 'Technical', score: evaluation.scores.technical },
        { dimension: 'Innovation', score: evaluation.scores.innovation },
        { dimension: 'Impact', score: evaluation.scores.impact },
        { dimension: 'Execution', score: evaluation.scores.execution },
    ];

    const readinessLabels: Record<string, { label: string; color: string }> = {
        exceptional: { label: 'Exceptional', color: 'text-green-600 bg-green-100' },
        winner_potential: { label: 'Winner Potential', color: 'text-blue-600 bg-blue-100' },
        competition_ready: { label: 'Competition-Ready', color: 'text-primary-600 bg-primary-100' },
        demo_ready: { label: 'Demo-Ready', color: 'text-yellow-600 bg-yellow-100' },
        early_prototype: { label: 'Early Prototype', color: 'text-gray-600 bg-gray-100' },
    };

    const readiness = readinessLabels[evaluation.readiness_level] || readinessLabels.demo_ready;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <Link to="/evaluate" className="flex items-center text-gray-600 hover:text-gray-900">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Input
                </Link>
                <div className="flex space-x-3">
                    {isAuthenticated && (
                        <button
                            onClick={handleSaveToDashboard}
                            disabled={saving || saved}
                            className={`btn-primary flex items-center ${saved ? 'bg-green-600 hover:bg-green-700' : ''}`}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save to Dashboard'}
                        </button>
                    )}
                    <button className="btn-secondary flex items-center" onClick={() => navigate('/evaluate')}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Re-evaluate
                    </button>
                    <button className="btn-primary flex items-center">
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Project Title */}
            <div className="card mb-6">
                <h1 className="text-2xl font-bold mb-2">Evaluation Results</h1>
                <div className="flex items-center space-x-2 text-gray-600">
                    <span className="text-sm">{evaluation.analysis.classification.primary_domain}</span>
                    <span>•</span>
                    <span className="text-sm">{evaluation.analysis.classification.tech_categories.join(', ')}</span>
                </div>
            </div>

            {/* Overall Score */}
            <div className="card mb-6 text-center">
                <h2 className="text-lg font-semibold mb-4">Overall Score</h2>
                <div className="flex items-center justify-center mb-4">
                    <div className="relative">
                        <div className="text-6xl font-bold text-primary-600 animate-count-up">
                            {evaluation.overall_score}
                        </div>
                        <div className="text-2xl text-gray-500">/100</div>
                    </div>
                </div>
                <div className={`inline-block px-4 py-2 rounded-full font-medium ${readiness.color}`}>
                    {readiness.label}
                </div>
                <div className="mt-4 max-w-2xl mx-auto">
                    <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-primary-600 h-full transition-all duration-1000 ease-out"
                            style={{ width: `${evaluation.overall_score}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
                <StatCard
                    icon={<Target className="h-6 w-6" />}
                    label="Technical"
                    score={evaluation.scores.technical}
                />
                <StatCard
                    icon={<Lightbulb className="h-6 w-6" />}
                    label="Innovation"
                    score={evaluation.scores.innovation}
                />
                <StatCard
                    icon={<TrendingUp className="h-6 w-6" />}
                    label="Impact"
                    score={evaluation.scores.impact}
                />
                <StatCard
                    icon={<CheckCircle className="h-6 w-6" />}
                    label="Execution"
                    score={evaluation.scores.execution}
                />
            </div>

            {/* Executive Summary */}
            <div className="card mb-6">
                <h2 className="text-xl font-bold mb-3 flex items-center">
                    📋 Executive Summary
                </h2>
                <p className="text-gray-700 leading-relaxed">
                    {evaluation.analysis.executive_summary}
                </p>
            </div>

            {/* Radar Chart */}
            <div className="card mb-6">
                <h2 className="text-xl font-bold mb-4">📊 Detailed Scores</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="dimension" />
                        <PolarRadiusAxis angle={90} domain={[0, 10]} />
                        <Radar
                            name="Score"
                            dataKey="score"
                            stroke="#6366f1"
                            fill="#6366f1"
                            fillOpacity={0.6}
                        />
                    </RadarChart>
                </ResponsiveContainer>

                <div className="grid md:grid-cols-2 gap-4 mt-6">
                    {Object.entries(evaluation.scores.detailed).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 capitalize">
                                {key.replace(/_/g, ' ')}
                            </span>
                            <div className="flex items-center space-x-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-primary-600 h-2 rounded-full"
                                        style={{ width: `${(value / 10) * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium w-8">{value}/10</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Strengths */}
            <div className="card mb-6">
                <h2 className="text-xl font-bold mb-4 flex items-center text-green-600">
                    ✅ Top Strengths
                </h2>
                <div className="space-y-4">
                    {evaluation.analysis.strengths.map((strength, idx) => (
                        <div key={idx} className="border-l-4 border-green-500 pl-4">
                            <h3 className="font-semibold mb-1">{strength.title}</h3>
                            <p className="text-gray-700">{strength.description}</p>
                            <span className={`text-xs font-medium mt-1 inline-block ${strength.impact === 'high' ? 'text-green-600' :
                                strength.impact === 'medium' ? 'text-yellow-600' : 'text-gray-600'
                                }`}>
                                {strength.impact.toUpperCase()} IMPACT
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Areas for Improvement */}
            <div className="card mb-6">
                <h2 className="text-xl font-bold mb-4 flex items-center text-orange-600">
                    ⚠️ Areas for Improvement
                </h2>
                <div className="space-y-4">
                    {evaluation.analysis.improvements.map((improvement, idx) => (
                        <div
                            key={idx}
                            className={`border-l-4 pl-4 ${improvement.priority === 'high' ? 'border-red-500' :
                                improvement.priority === 'medium' ? 'border-yellow-500' : 'border-blue-500'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <h3 className="font-semibold mb-1">{improvement.title}</h3>
                                <span className={`text-xs font-medium px-2 py-1 rounded ${improvement.priority === 'high' ? 'bg-red-100 text-red-700' :
                                    improvement.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                    {improvement.priority.toUpperCase()} PRIORITY
                                </span>
                            </div>
                            <p className="text-gray-700">{improvement.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Wins */}
            <div className="card mb-6 bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
                <h2 className="text-xl font-bold mb-4 flex items-center text-primary-700">
                    ⚡ Quick Wins (1-2 hours)
                </h2>
                <div className="space-y-4">
                    {evaluation.recommendations.quick_wins.map((win, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                            <h3 className="font-semibold mb-2 text-primary-700">{win.action}</h3>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">Why:</span>
                                    <span className="text-gray-600 ml-2">{win.why}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">How:</span>
                                    <span className="text-gray-600 ml-2">{win.how}</span>
                                </div>
                                <div className="flex items-center text-primary-600">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    <span className="font-medium">{win.time_estimate}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pitch Suggestions */}
            {evaluation.recommendations.pitch && (
                <div className="card mb-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                        🎤 Pitch Suggestions
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">One-liner Elevator Pitch:</h3>
                            <p className="text-lg italic text-primary-700 bg-primary-50 p-4 rounded-lg">
                                "{evaluation.recommendations.pitch.elevator_pitch}"
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, score }: { icon: React.ReactNode; label: string; score: number }) {
    return (
        <div className="card text-center">
            <div className="text-primary-600 mb-2 flex justify-center">{icon}</div>
            <div className="text-2xl font-bold text-gray-900">{score}/10</div>
            <div className="text-sm text-gray-600">{label}</div>
        </div>
    );
}
