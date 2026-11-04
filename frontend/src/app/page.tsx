"use client";

import BrandLogo from "../components/BrandLogo";
import WalletConnectButton from "../components/WalletConnectButton";
import ResumeUpload from "../components/ResumeUpload";
import SubmitVerification from "../components/SubmitVerification";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080610] text-white font-sans selection:bg-purple-500/30 selection:text-white flex flex-col justify-between">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-gray-950 shadow-lg"
      >
        Skip to main content
      </a>

      {/* ── 1. NORMAL HORIZONTAL NAVBAR (NORMAL FLOW, SCROLLS WITH PAGE) ── */}
      <header className="relative w-full border-b border-purple-500/20 bg-[#080610]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Primary navigation"
            className="flex items-center justify-between h-[85px] sm:h-[96px] gap-4"
          >
            {/* Left: Official BlockCredAI Logo (Restrained size, never overflows) */}
            <div className="flex-shrink-0 flex items-center">
              <a href="#" className="flex items-center shrink-0 focus:outline-none" aria-label="BlockCredAI home">
                <BrandLogo variant="navbar" priority />
              </a>
            </div>

            {/* Right: MetaMask Wallet Connection */}
            <div className="flex-shrink-0 flex items-center">
              <WalletConnectButton />
            </div>
          </nav>
        </div>
      </header>

      {/* ── 2. MAIN HOMEPAGE CONTENT DIRECTLY BELOW NAVBAR ── */}
      <main id="main-content" className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col items-center">
        {/* HERO SECTION */}
        <section aria-labelledby="hero-title" className="pt-12 sm:pt-16 pb-10 sm:pb-14 w-full flex flex-col items-center text-center relative">
          {/* Ambient Purple/Indigo Glow */}
          <div
            aria-hidden="true"
            className="absolute top-2 left-1/2 -translate-x-1/2 w-[320px] sm:w-[650px] lg:w-[850px] h-[300px] sm:h-[400px] bg-gradient-to-b from-purple-600/20 via-indigo-600/10 to-transparent blur-3xl pointer-events-none rounded-full"
          />

          <div className="relative z-10 max-w-3xl mx-auto space-y-4 sm:space-y-5">
            <h1 id="hero-title" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              <span className="text-white block">Trustless Employment</span>
              <span className="block bg-gradient-to-r from-[#6366F1] via-[#A855F7] to-[#E879F9] bg-clip-text text-transparent mt-1 pb-1">
                Verification Engine
              </span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed font-normal max-w-2xl mx-auto px-2">
              Empowering the future of HR with Blockchain immutability and AI-driven fraud detection.
              Secure your credentials. Authenticate your experience.
            </p>
          </div>
        </section>

        {/* MAIN APPLICATION CARDS — SIDE BY SIDE ON DESKTOP (EQUAL HEIGHT VIA items-stretch) */}
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20 sm:mb-28 items-stretch">
          {/* ── LEFT CARD: AI Resume Scanner ── */}
          <section
            id="ai-resume-scanner"
            aria-labelledby="ai-scanner-heading"
            className="rounded-2xl sm:rounded-3xl bg-[#0D0B18]/90 border border-purple-500/25 p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_35px_rgba(139,92,246,0.12)] relative flex flex-col h-full justify-between"
          >
            {/* Ambient inner purple glow */}
            <div
              aria-hidden="true"
              className="absolute -top-24 -left-24 w-60 h-60 bg-purple-600/15 rounded-full blur-3xl pointer-events-none rounded-full"
            />
            <div className="relative z-10 flex flex-col flex-1 h-full">
              <div className="flex items-center gap-3.5 mb-6 border-b border-purple-500/15 pb-5 shrink-0">
                <div className="w-11 h-11 rounded-xl bg-purple-950/50 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 id="ai-scanner-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    AI Resume Scanner
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-300 mt-0.5">
                    Scan a candidate&apos;s resume for fraud
                  </p>
                </div>
              </div>

              <ResumeUpload />
            </div>
          </section>

          {/* ── RIGHT CARD: Submit Employment Record ── */}
          <section
            id="submit-employment-record"
            aria-labelledby="submit-record-heading"
            className="rounded-2xl sm:rounded-3xl bg-[#0D0B18]/90 border border-emerald-500/25 p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_35px_rgba(16,185,129,0.08)] relative flex flex-col h-full justify-between"
          >
            {/* Ambient inner teal/emerald glow */}
            <div
              aria-hidden="true"
              className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none rounded-full"
            />
            <div className="relative z-10 flex flex-col flex-1 h-full">
              <div className="flex items-center gap-3.5 mb-6 border-b border-emerald-500/15 pb-5 shrink-0">
                <div className="w-11 h-11 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div>
                  <h2 id="submit-record-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Submit Employment Record
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-300 mt-0.5">
                    Employers: register a job on-chain
                  </p>
                </div>
              </div>

              <SubmitVerification />
            </div>
          </section>
        </div>
      </main>

      {/* ── 3. APPROVED FOOTER ── */}
      <Footer />
    </div>
  );
}
