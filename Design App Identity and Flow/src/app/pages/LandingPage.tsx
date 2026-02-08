
import { useNavigate } from 'react-router';
import { ArrowRight, Shield, Users, Award, MapPin } from 'lucide-react';

export function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
            {/* Navigation Bar */}
            <nav className="fixed w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 flex items-center justify-center">
                                <img src="/assets/civic-flow-logo.png" alt="CivicFlow Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">CivicFlow</span>
                        </div>
                        <div className="hidden md:flex space-x-8">
                            <a href="#features" className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400">Features</a>
                            <a href="#about" className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400">About</a>
                            <a href="#demo" className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400">Demo</a>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-4 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                        >
                            Enter App
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl z-0 pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-40 right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold uppercase tracking-wide mb-6">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                        Hackathon Demo Version
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-300">
                        Empowering Citizens.<br />
                        Transforming Cities.
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-600 dark:text-slate-400">
                        CivicFlow connects communities with local government through AI-powered reporting, real-time tracking, and gamified civic engagement.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            Launch Live Demo <ArrowRight className="w-5 h-5" />
                        </button>
                        <button className="px-8 py-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            Watch Video
                        </button>
                    </div>

                    <div className="mt-16 relative mx-auto max-w-5xl">
                        <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                            {/* Placeholder for App Screenshot - Using a gradient/mock for now */}
                            <div className="aspect-[16/9] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                                <p className="text-slate-400 font-medium">App Dashboard Preview</p>
                                {/* Ideally, we'd put an actual screenshot of the dashboard here */}
                            </div>
                        </div>
                        {/* Floating Badges */}
                        <div className="absolute -left-4 top-20 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce-slow border border-slate-100 dark:border-slate-700">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Safety Score</p>
                                <p className="font-bold text-slate-900 dark:text-white">85/100</p>
                            </div>
                        </div>
                        <div className="absolute -right-4 bottom-20 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce-slow delay-700 border border-slate-100 dark:border-slate-700">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                                <Award className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Current Rank</p>
                                <p className="font-bold text-slate-900 dark:text-white">Gold League</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-white dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                            Why CivicFlow?
                        </h2>
                        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                            Bridging the gap between citizens and authorities with next-gen technology.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Feature 1 */}
                        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800/80 transition-colors group">
                            <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                                <MapPin className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">AI-Powered Reporting</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Smart location tagging and automatic issue classification using Gemini AI ensures reports reach the right department instantly.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-800/80 transition-colors group">
                            <div className="w-14 h-14 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                                <Award className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Gamified Engagement</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Earn XP, climb leaderboards (Bronze to Diamond), and get recognized as a "Civil Hero" for your contributions.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-slate-800/80 transition-colors group">
                            <div className="w-14 h-14 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400 mb-6 group-hover:scale-110 transition-transform">
                                <Users className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Community Action</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Organize volunteer drives, crowdfunding campaigns, and neighborhood watches directly through the platform.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-blue-600 dark:bg-blue-700">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to shape the future of your city?
                    </h2>
                    <p className="text-blue-100 text-lg mb-10">
                        Join thousands of active citizens making a real difference today.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-10 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-gray-50 transition-all hover:-translate-y-1"
                    >
                        Start Demo Now
                    </button>
                    <p className="mt-4 text-blue-200 text-sm">No sign-up required for Hackathon Judge Demo</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 flex items-center justify-center">
                            <img src="/assets/civic-flow-logo.png" alt="CivicFlow Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-semibold text-white">CivicFlow</span>
                    </div>
                    <div className="text-sm">
                        © 2024 CivicFlow. Built for Commit Challenge.
                    </div>
                </div>
            </footer>
        </div>
    );
}
