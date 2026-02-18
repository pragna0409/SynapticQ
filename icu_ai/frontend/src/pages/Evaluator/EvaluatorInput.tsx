import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Github, Zap, Loader2 } from 'lucide-react';
import { evaluateProject, uploadFile, fetchGithubRepo, type ProjectEvaluationRequest } from '../../services/api';
import { useDropzone } from 'react-dropzone';

export default function EvaluatorInput() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'text' | 'upload' | 'github' | 'quick'>('text');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [formData, setFormData] = useState<ProjectEvaluationRequest>({
        name: '',
        description: '',
        tech_stack: '',
        theme: '',
        time_available: 48,
        team_size: 1,
    });

    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [githubUrl, setGithubUrl] = useState('');

    // Quick tab fields
    const [quickProblem, setQuickProblem] = useState('');
    const [quickSolution, setQuickSolution] = useState('');
    const [quickFeatures, setQuickFeatures] = useState('');

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
            setUploadedFiles([...uploadedFiles, ...acceptedFiles]);
        },
        maxFiles: 10,
        maxSize: 25 * 1024 * 1024, // 25MB
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let projectData = { ...formData };

            // Handle file uploads
            if (activeTab === 'upload' && uploadedFiles.length > 0) {
                const fileTexts = await Promise.all(
                    uploadedFiles.map(file => uploadFile(file))
                );
                projectData.description = fileTexts.map(f => f.text).join('\n\n');
            }

            // Handle GitHub URL
            if (activeTab === 'github' && githubUrl) {
                const repoData = await fetchGithubRepo(githubUrl);
                projectData.description = repoData.readme;
                projectData.tech_stack = repoData.languages.join(', ');
                projectData.github_url = githubUrl;
            }

            // Handle Quick tab
            if (activeTab === 'quick') {
                projectData.description = `Problem: ${quickProblem}\n\nSolution: ${quickSolution}\n\nKey Features:\n${quickFeatures}`;
            }

            // Validate
            if (!projectData.name || !projectData.description) {
                setError('Project name and description are required');
                setLoading(false);
                return;
            }

            const wordCount = projectData.description.split(/\s+/).length;
            if (wordCount < 100) {
                setError(`Description must be at least 100 words (currently ${wordCount} words)`);
                setLoading(false);
                return;
            }

            // Submit evaluation
            const result = await evaluateProject(projectData);

            // Navigate to results
            navigate(`/evaluate/results/${result.id}`, { state: { evaluation: result } });

        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed to evaluate project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Evaluate Your Project</h1>
                <p className="text-gray-600">Get comprehensive AI-powered feedback on your hackathon project</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-2 mb-6 border-b">
                <TabButton
                    active={activeTab === 'text'}
                    onClick={() => setActiveTab('text')}
                    icon={<FileText className="h-5 w-5" />}
                    label="Text"
                />
                <TabButton
                    active={activeTab === 'upload'}
                    onClick={() => setActiveTab('upload')}
                    icon={<Upload className="h-5 w-5" />}
                    label="Upload"
                />
                <TabButton
                    active={activeTab === 'github'}
                    onClick={() => setActiveTab('github')}
                    icon={<Github className="h-5 w-5" />}
                    label="GitHub"
                />
                <TabButton
                    active={activeTab === 'quick'}
                    onClick={() => setActiveTab('quick')}
                    icon={<Zap className="h-5 w-5" />}
                    label="Quick"
                />
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="card">
                {/* Text Tab */}
                {activeTab === 'text' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Project Name *</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., HealthTrack AI"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Project Description * (minimum 100 words)
                            </label>
                            <textarea
                                className="input-field min-h-[200px]"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe your project: problem, solution, features, impact..."
                                required
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                {formData.description.split(/\s+/).filter(w => w).length} words
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Tech Stack</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.tech_stack}
                                onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
                                placeholder="e.g., React, Node.js, PostgreSQL, OpenAI"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Hackathon Theme</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.theme}
                                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                                    placeholder="e.g., Healthcare Innovation"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Time Available (hours)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={formData.time_available}
                                    onChange={(e) => setFormData({ ...formData, time_available: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Team Size</label>
                            <div className="flex space-x-4">
                                {[1, 2, 3, 4, 5].map(size => (
                                    <label key={size} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="team_size"
                                            value={size}
                                            checked={formData.team_size === size}
                                            onChange={(e) => setFormData({ ...formData, team_size: parseInt(e.target.value) })}
                                            className="mr-2"
                                        />
                                        {size === 5 ? '5+' : size}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Upload Tab */}
                {activeTab === 'upload' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Project Name *</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
                                }`}
                        >
                            <input {...getInputProps()} />
                            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-lg mb-2">Drag & drop files here, or click to browse</p>
                            <p className="text-sm text-gray-500">
                                Supported: .md, .txt, .pdf, .docx, code files (.py, .js, etc.)
                            </p>
                            <p className="text-sm text-gray-500">Max 10 files, 25MB total</p>
                        </div>

                        {uploadedFiles.length > 0 && (
                            <div className="space-y-2">
                                <p className="font-medium">Uploaded Files:</p>
                                {uploadedFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                        <span className="text-sm">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                                        <button
                                            type="button"
                                            onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx))}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* GitHub Tab */}
                {activeTab === 'github' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Project Name *</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">GitHub Repository URL *</label>
                            <input
                                type="url"
                                className="input-field"
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                                placeholder="https://github.com/username/repository"
                                required
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                We'll automatically fetch your README and detect languages
                            </p>
                        </div>
                    </div>
                )}

                {/* Quick Tab */}
                {activeTab === 'quick' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Project Name *</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">❓ What problem does it solve?</label>
                            <textarea
                                className="input-field"
                                value={quickProblem}
                                onChange={(e) => {
                                    setQuickProblem(e.target.value);
                                    setFormData({
                                        ...formData,
                                        description: `Problem: ${e.target.value}\n\nSolution: ${quickSolution}\n\nKey Features:\n${quickFeatures}`
                                    });
                                }}
                                placeholder="Describe the problem your project addresses..."
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">💡 What's your solution?</label>
                            <textarea
                                className="input-field"
                                value={quickSolution}
                                onChange={(e) => {
                                    setQuickSolution(e.target.value);
                                    setFormData({
                                        ...formData,
                                        description: `Problem: ${quickProblem}\n\nSolution: ${e.target.value}\n\nKey Features:\n${quickFeatures}`
                                    });
                                }}
                                placeholder="Explain how your project solves the problem..."
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">🛠️ Tech stack used?</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.tech_stack}
                                onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
                                placeholder="e.g., React, Python, Firebase"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">⚡ Key features (3-5)?</label>
                            <textarea
                                className="input-field"
                                value={quickFeatures}
                                onChange={(e) => {
                                    setQuickFeatures(e.target.value);
                                    setFormData({
                                        ...formData,
                                        description: `Problem: ${quickProblem}\n\nSolution: ${quickSolution}\n\nKey Features:\n${e.target.value}`
                                    });
                                }}
                                placeholder="List your main features..."
                                rows={3}
                            />
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <div className="mt-6 flex space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="btn-secondary"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-primary flex items-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            'Evaluate Project →'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${active
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}
