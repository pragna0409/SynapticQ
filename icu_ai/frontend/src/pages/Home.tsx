import { Link } from 'react-router-dom';
import { Sparkles, Target, TrendingUp, Lightbulb, BarChart3, Zap } from 'lucide-react';

export default function Home() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="animate-fade-in">
                        <Sparkles className="h-16 w-16 mx-auto mb-6" />
                        <h1 className="text-5xl md:text-6xl font-bold mb-6">
                            AI Hackathon Helper
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-primary-100">
                            Your Personal Hackathon Mentor
                        </p>
                        <p className="text-lg mb-12 max-w-2xl mx-auto text-primary-50">
                            Get AI-powered project evaluations, personalized idea generation, and actionable guidance to win your next hackathon
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/evaluate" className="btn-primary bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-4">
                                Evaluate My Project
                            </Link>
                            <Link to="/generate" className="btn-secondary border-white text-white hover:bg-white/10 text-lg px-8 py-4">
                                Get Project Ideas
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center animate-slide-up">
                            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-primary-600">1</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Upload Your Project</h3>
                            <p className="text-gray-600">
                                Share your project description, code, or GitHub repo
                            </p>
                        </div>

                        <div className="text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-primary-600">2</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
                            <p className="text-gray-600">
                                Get comprehensive evaluation across 15+ dimensions
                            </p>
                        </div>

                        <div className="text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-primary-600">3</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Win Your Hackathon</h3>
                            <p className="text-gray-600">
                                Implement actionable recommendations and impress judges
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={<BarChart3 className="h-8 w-8" />}
                            title="Multi-Dimensional Scoring"
                            description="Get scored on technical excellence, innovation, impact, and execution quality"
                        />
                        <FeatureCard
                            icon={<Lightbulb className="h-8 w-8" />}
                            title="Personalized Ideas"
                            description="Generate tailored project ideas based on your skills and interests"
                        />
                        <FeatureCard
                            icon={<Target className="h-8 w-8" />}
                            title="Actionable Feedback"
                            description="Receive specific, prioritized recommendations you can implement immediately"
                        />
                        <FeatureCard
                            icon={<Zap className="h-8 w-8" />}
                            title="Quick Wins"
                            description="Identify improvements you can make in 1-2 hours for maximum impact"
                        />
                        <FeatureCard
                            icon={<TrendingUp className="h-8 w-8" />}
                            title="Track Progress"
                            description="Re-evaluate your project and see improvement over time"
                        />
                        <FeatureCard
                            icon={<Sparkles className="h-8 w-8" />}
                            title="Wow Factor Tips"
                            description="Learn how to make judges say 'wow' with your demo"
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-primary-600 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Win Your Next Hackathon?</h2>
                    <p className="text-xl mb-8 text-primary-100">
                        Join thousands of hackers who've improved their projects with AI-powered guidance
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/evaluate" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                            Evaluate Your Project Now
                        </Link>
                        <Link to="/generate" className="btn-secondary border-white text-white hover:bg-white/10">
                            Generate Project Ideas
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="card hover:shadow-lg transition-shadow duration-200">
            <div className="text-primary-600 mb-4">{icon}</div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    );
}
