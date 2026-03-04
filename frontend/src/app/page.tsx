"use client";

import WalletConnectButton from "../components/WalletConnectButton";
import ResumeUpload from "../components/ResumeUpload";
import Image from "next/image";

export default function Home() {
    return (
        <div className="min-h-screen font-sans selection:bg-indigo-500/30">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 glass border-b-0 border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex-shrink-0 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
                                B
                            </div>
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                                BlockCredAI
                            </span>
                        </div>
                        <div>
                            <WalletConnectButton />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">
                {/* Hero Section */}
                <div className="text-center max-w-3xl mb-16 space-y-6">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4 drop-shadow-lg">
                        Trustless Employment <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
                            Verification Engine
                        </span>
                    </h1>
                    <p className="text-lg text-indigo-100/70 leading-relaxed font-light">
                        Empowering the future of HR with Blockchain immutability and AI-driven fraud detection.
                        Secure your credentials. Authenticate your experience.
                    </p>
                </div>

                {/* Verification App Container */}
                <div className="w-full max-w-lg glass rounded-2xl p-8 shadow-2xl shadow-indigo-900/20 mb-24 relative overflow-hidden">
                    {/* Subtle glow effect behind the card */}
                    <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl mix-blend-screen"></div>
                    <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl mix-blend-screen"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8 border-b border-indigo-500/20 pb-4">
                            <div className="p-2 bg-indigo-500/10 rounded-lg shrink-0">
                                <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-white tracking-wide">AI Resume Scanner</h2>
                        </div>

                        <ResumeUpload />
                    </div>
                </div>

                {/* Founder Section */}
                <div className="w-full max-w-4xl pt-16 border-t border-white/10">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
                            Meet the Founder
                        </h3>
                        <div className="h-1 w-20 bg-indigo-500 rounded-full mx-auto mt-4 opacity-50"></div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-10 glass p-8 rounded-3xl mx-auto relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="shrink-0 relative z-10 flex flex-col items-center">
                            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-indigo-500/30 shadow-2xl relative">
                                {/* Fallback image placeholder assuming user moves their provided image to public directory */}
                                <Image
                                    src="/founder.jpg"
                                    alt="Saurabh Kumar - Founder"
                                    fill
                                    unoptimized
                                    className="object-cover hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "https://ui-avatars.com/api/?name=Saurabh+Kumar&background=4f46e5&color=fff&size=200";
                                    }}
                                />
                            </div>
                            <div className="mt-4 px-4 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-widest border border-indigo-500/30">
                                Founder & Lead Developer
                            </div>
                        </div>
                        <div className="text-center md:text-left relative z-10 flex-1">
                            <h4 className="text-2xl font-bold text-white mb-2">Saurabh Kumar</h4>
                            <p className="text-indigo-200 mb-4 font-medium flex items-center justify-center md:justify-start gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                </svg>
                                Visionary Engineer
                            </p>
                            <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                                Passionate about merging decentralized technologies with artificial intelligence to solve real-world problems.
                                Saurabh created BlockCredAI to tackle resume fraud and build a transparent, tamper-proof ecosystem for
                                employment verification. Driven by a commitment to ethical AI and open web principles.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8 text-center text-gray-500 text-sm mt-12 bg-black/20">
                <p>© {new Date().getFullYear()} BlockCredAI by Saurabh Kumar. All rights reserved.</p>
            </footer>
        </div>
    );
}
