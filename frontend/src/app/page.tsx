"use client";

import WalletConnectButton from "../components/WalletConnectButton";
import ResumeUpload from "../components/ResumeUpload";
import SubmitVerification from "../components/SubmitVerification";
import Image from "next/image";

export default function Home() {
    return (
        <div className="min-h-screen font-sans selection:bg-indigo-500/30">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-gray-950">
                Skip to main content
            </a>
            {/* Navbar */}
            <nav aria-label="Primary navigation" className="fixed top-0 w-full z-50 glass border-b-0 border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex-shrink-0 flex items-center gap-3">
                            <div aria-hidden="true" className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
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

            <main id="main-content" className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">
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

                {/* Verification App Container — two cards side by side */}
                <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-6 mb-24">

                    {/* ── AI Resume Scanner ── */}
                    <div className="flex-1 glass rounded-2xl p-8 shadow-2xl shadow-indigo-900/20 relative overflow-hidden">
                        <div aria-hidden="true" className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl mix-blend-screen"></div>
                        <div aria-hidden="true" className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl mix-blend-screen"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8 border-b border-indigo-500/20 pb-4">
                                <div className="p-2 bg-indigo-500/10 rounded-lg shrink-0">
                                    <svg className="w-6 h-6 text-indigo-400" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white tracking-wide">AI Resume Scanner</h2>
                                    <p className="text-xs text-indigo-300/60 mt-0.5">Scan a candidate&apos;s resume for fraud</p>
                                </div>
                            </div>
                            <ResumeUpload />
                        </div>
                    </div>

                    {/* ── Employer: Submit Verification ── */}
                    <div className="flex-1 glass rounded-2xl p-8 shadow-2xl shadow-emerald-900/20 relative overflow-hidden">
                        <div aria-hidden="true" className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl mix-blend-screen"></div>
                        <div aria-hidden="true" className="absolute -bottom-32 -left-32 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl mix-blend-screen"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8 border-b border-emerald-500/20 pb-4">
                                <div className="p-2 bg-emerald-500/10 rounded-lg shrink-0">
                                    <svg className="w-6 h-6 text-emerald-400" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white tracking-wide">Submit Employment Record</h2>
                                    <p className="text-xs text-emerald-300/60 mt-0.5">Employers: register a job on-chain</p>
                                </div>
                            </div>
                            <SubmitVerification />
                        </div>
                    </div>

                </div>

            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8 text-center text-gray-500 text-sm mt-12 bg-black/20">
                <p>&copy; {new Date().getFullYear()} BlockCredAI by Saurabh Kumar. All rights reserved.</p>
            </footer>
        </div>
    );
}
