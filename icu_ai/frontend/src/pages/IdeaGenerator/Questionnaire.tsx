import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { generateIdeas, type QuestionnaireData } from '../../services/api';

export default function Questionnaire() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState<Partial<QuestionnaireData>>({
        skill_level: 'intermediate',
        primary_skill: '',
        languages: [],
        frameworks: [],
        team_size: 1,
        time_available: 48,
        theme: '',
        required_tech: '',
        primary_goal: '',
        domain_interests: [],
        personal_frustrations: '',
        emerging_tech: [],
        project_type: '',
        platform: [],
        ui_importance: 'medium',
        ai_preference: 'optional',
        target_audience: [],
        desired_change: [],
    });

    const totalSteps = 5;

    const validateStep = (step: number): string | null => {
        switch (step) {
            case 1:
                if (!formData.primary_skill) return 'Please select your strongest skill';
                if (!formData.languages || formData.languages.length === 0) return 'Please select at least one programming language';
                return null;
            case 2:
                if (!formData.primary_goal) return 'Please select your primary goal';
                return null;
            default:
                return null;
        }
    };

    const handleNext = () => {
        const validationError = validateStep(currentStep);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(''); // Clear any previous errors
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        setError(''); // Clear errors when going back
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return; // prevent duplicate submissions that spam the API
        setError('');
        setLoading(true);

        try {
            // Validate required fields
            if (!formData.primary_skill || !formData.primary_goal || formData.languages?.length === 0) {
                setError('Please fill in all required fields');
                setLoading(false);
                return;
            }

            const result = await generateIdeas(formData as QuestionnaireData);
            navigate(`/ideas/${result.id}`, { state: { ideas: result } });

        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed to generate ideas');
        } finally {
            setLoading(false);
        }
    };

    const updateFormData = (updates: Partial<QuestionnaireData>) => {
        setFormData({ ...formData, ...updates });
    };

    const toggleArrayItem = (field: keyof QuestionnaireData, value: string) => {
        const current = (formData[field] as string[]) || [];
        const updated = current.includes(value)
            ? current.filter(item => item !== value)
            : [...current, value];
        updateFormData({ [field]: updated });
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-2">🎯 Let's Find Your Perfect Project Idea</h1>
                <p className="text-gray-600">Answer a few questions to get personalized hackathon project ideas</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
                    <span className="text-sm text-gray-600">{Math.round((currentStep / totalSteps) * 100)}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3 flex-1">
                            <h3 className="text-sm font-medium text-red-800">
                                {error.includes('rate limit') || error.includes('429') ? 'API Rate Limit Reached' : 'Error Generating Ideas'}
                            </h3>
                            <div className="mt-2 text-sm text-red-700">
                                {error}
                            </div>
                            {(error.includes('rate limit') || error.includes('429')) && (
                                <div className="mt-3 text-sm text-red-600">
                                    <p className="font-medium">What you can do:</p>
                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                        <li>Wait 1-2 minutes and try again</li>
                                        <li>The API has usage limits to prevent abuse</li>
                                        <li>Your request will be automatically retried</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="card">
                {/* Step 1: Technical Background */}
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold mb-4">About You - Technical Background</h2>

                        <div>
                            <label className="block text-sm font-medium mb-2">What's your coding experience? *</label>
                            <div className="space-y-2">
                                {['beginner', 'intermediate', 'advanced', 'expert'].map(level => (
                                    <label key={level} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="skill_level"
                                            value={level}
                                            checked={formData.skill_level === level}
                                            onChange={(e) => updateFormData({ skill_level: e.target.value })}
                                            className="mr-3"
                                        />
                                        <span className="capitalize">{level}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Your strongest skill? *</label>
                            <select
                                className="input-field"
                                value={formData.primary_skill}
                                onChange={(e) => updateFormData({ primary_skill: e.target.value })}
                                required
                            >
                                <option value="">Select...</option>
                                <option value="Frontend Development">Frontend Development</option>
                                <option value="Backend Development">Backend Development</option>
                                <option value="Full Stack Development">Full Stack Development</option>
                                <option value="Mobile Development">Mobile Development</option>
                                <option value="Data Science / ML">Data Science / ML</option>
                                <option value="UI/UX Design">UI/UX Design</option>
                                <option value="DevOps / Cloud">DevOps / Cloud</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Programming languages? * (select all that apply)</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'Rust', 'Swift', 'Kotlin', 'PHP'].map(lang => (
                                    <label key={lang} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.languages?.includes(lang)}
                                            onChange={() => toggleArrayItem('languages', lang)}
                                            className="mr-2"
                                        />
                                        {lang}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Frameworks you know? (optional)</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {['React', 'Vue', 'Angular', 'Node.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'React Native', 'Flutter'].map(fw => (
                                    <label key={fw} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.frameworks?.includes(fw)}
                                            onChange={() => toggleArrayItem('frameworks', fw)}
                                            className="mr-2"
                                        />
                                        {fw}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Team size?</label>
                            <div className="flex space-x-4">
                                {[1, 2, 3, 4, 5].map(size => (
                                    <label key={size} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="team_size"
                                            value={size}
                                            checked={formData.team_size === size}
                                            onChange={(e) => updateFormData({ team_size: parseInt(e.target.value) })}
                                            className="mr-2"
                                        />
                                        {size === 5 ? '5+' : size}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Hackathon Context */}
                {currentStep === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold mb-4">Hackathon Context</h2>

                        <div>
                            <label className="block text-sm font-medium mb-2">How much time do you have? *</label>
                            <select
                                className="input-field"
                                value={formData.time_available}
                                onChange={(e) => updateFormData({ time_available: parseInt(e.target.value) })}
                            >
                                <option value={12}>12 hours or less</option>
                                <option value={24}>24 hours</option>
                                <option value={48}>48 hours (weekend)</option>
                                <option value={72}>3-4 days</option>
                                <option value={168}>One week</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Hackathon theme? (optional)</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.theme}
                                onChange={(e) => updateFormData({ theme: e.target.value })}
                                placeholder="e.g., Healthcare Innovation, Climate Action"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Required technologies? (optional)</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.required_tech}
                                onChange={(e) => updateFormData({ required_tech: e.target.value })}
                                placeholder="e.g., Must use OpenAI API, Blockchain required"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">What's your primary goal? *</label>
                            <div className="space-y-2">
                                {['win', 'learn', 'portfolio', 'solve_problem', 'network'].map(goal => (
                                    <label key={goal} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="primary_goal"
                                            value={goal}
                                            checked={formData.primary_goal === goal}
                                            onChange={(e) => updateFormData({ primary_goal: e.target.value })}
                                            className="mr-3"
                                        />
                                        <span className="capitalize">{goal.replace('_', ' ')}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Interests */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold mb-4">Interests & Passion</h2>

                        <div>
                            <label className="block text-sm font-medium mb-2">Which domains excite you? (select up to 3)</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Healthcare', 'Education', 'Finance', 'Environment', 'Social Impact', 'Gaming', 'E-commerce', 'Productivity', 'Communication', 'Transportation'].map(domain => (
                                    <label key={domain} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.domain_interests?.includes(domain)}
                                            onChange={() => toggleArrayItem('domain_interests', domain)}
                                            disabled={formData.domain_interests && formData.domain_interests.length >= 3 && !formData.domain_interests.includes(domain)}
                                            className="mr-2"
                                        />
                                        {domain}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">What problems frustrate you in daily life? (optional)</label>
                            <textarea
                                className="input-field"
                                value={formData.personal_frustrations}
                                onChange={(e) => updateFormData({ personal_frustrations: e.target.value })}
                                placeholder="Think about annoyances, inefficiencies, or challenges you face regularly..."
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">What emerging technologies interest you?</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['AI & Machine Learning', 'Blockchain & Web3', 'AR/VR', 'IoT', 'Quantum Computing', '5G & Edge Computing'].map(tech => (
                                    <label key={tech} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.emerging_tech?.includes(tech)}
                                            onChange={() => toggleArrayItem('emerging_tech', tech)}
                                            className="mr-2"
                                        />
                                        {tech}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Project Preferences */}
                {currentStep === 4 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold mb-4">Project Preferences</h2>

                        <div>
                            <label className="block text-sm font-medium mb-2">What type of project appeals to you?</label>
                            <select
                                className="input-field"
                                value={formData.project_type}
                                onChange={(e) => updateFormData({ project_type: e.target.value })}
                            >
                                <option value="">Select...</option>
                                <option value="consumer_app">Consumer Application (B2C)</option>
                                <option value="business_tool">Business Tool (B2B)</option>
                                <option value="developer_tool">Developer Tool</option>
                                <option value="game">Game or Entertainment</option>
                                <option value="data_viz">Data Visualization</option>
                                <option value="educational">Educational Tool</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Preferred platform?</label>
                            <div className="space-y-2">
                                {['Web application', 'Mobile app', 'Desktop application', 'Browser extension', 'API/Backend only'].map(platform => (
                                    <label key={platform} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.platform?.includes(platform)}
                                            onChange={() => toggleArrayItem('platform', platform)}
                                            className="mr-2"
                                        />
                                        {platform}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">How important is visual design/UI?</label>
                            <div className="space-y-2">
                                {[
                                    { value: 'very_important', label: 'Very important - I want stunning UI' },
                                    { value: 'important', label: 'Important - Clean and professional' },
                                    { value: 'medium', label: 'Somewhat important - Functional and decent' },
                                    { value: 'not_important', label: 'Not important - Function over form' }
                                ].map(option => (
                                    <label key={option.value} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="ui_importance"
                                            value={option.value}
                                            checked={formData.ui_importance === option.value}
                                            onChange={(e) => updateFormData({ ui_importance: e.target.value })}
                                            className="mr-3"
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Do you want to use AI/ML?</label>
                            <div className="space-y-2">
                                {[
                                    { value: 'required', label: 'Must be AI-powered' },
                                    { value: 'preferred', label: 'AI would be great' },
                                    { value: 'optional', label: 'AI is optional' },
                                    { value: 'no', label: 'Prefer traditional programming' }
                                ].map(option => (
                                    <label key={option.value} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="ai_preference"
                                            value={option.value}
                                            checked={formData.ai_preference === option.value}
                                            onChange={(e) => updateFormData({ ai_preference: e.target.value })}
                                            className="mr-3"
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 5: Impact & Audience */}
                {currentStep === 5 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold mb-4">Impact & Audience</h2>

                        <div>
                            <label className="block text-sm font-medium mb-2">Who should benefit from your project?</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Students', 'Professionals', 'Businesses', 'Elderly people', 'Children/Parents', 'Developers', 'General public'].map(audience => (
                                    <label key={audience} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.target_audience?.includes(audience)}
                                            onChange={() => toggleArrayItem('target_audience', audience)}
                                            className="mr-2"
                                        />
                                        {audience}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">What change do you want to create?</label>
                            <div className="space-y-2">
                                {['Make something more efficient', 'Make something more accessible', 'Create entertainment', 'Solve environmental issue', 'Improve health/wellness', 'Enhance education', 'Foster connections'].map(change => (
                                    <label key={change} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.desired_change?.includes(change)}
                                            onChange={() => toggleArrayItem('desired_change', change)}
                                            className="mr-2"
                                        />
                                        {change}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="mt-8 flex justify-between">
                    <button
                        type="button"
                        onClick={handlePrev}
                        disabled={currentStep === 1}
                        className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="h-5 w-5 mr-1" />
                        Previous
                    </button>

                    {currentStep < totalSteps ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="btn-primary flex items-center"
                        >
                            Next
                            <ChevronRight className="h-5 w-5 ml-1" />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex items-center"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Generating Ideas...
                                </>
                            ) : (
                                'Generate Ideas ✨'
                            )}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
