"use client";

import BrandLogo from "./BrandLogo";

type TeamMember = {
  name: string;
  github: string;
};

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Aditya Kumar",
    github: "https://github.com/Adii-27",
  },
  {
    name: "Saurabh Kumar",
    github: "https://github.com/SaurabhForge",
  },
  {
    name: "Rajeev Ranjan",
    github: "https://github.com/dearrajuyadav61-sketch",
  },
  {
    name: "Saurabh",
    github: "https://github.com/saurabhsah11",
  },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-purple-500/20 bg-[#07050E] shadow-[0_-2px_20px_rgba(168,85,247,0.1)] relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 items-start">
          {/* SECTION A — Project Brand (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-4">
            <a href="#" className="inline-block focus:outline-none" aria-label="BlockCredAI home">
              <BrandLogo variant="footer" />
            </a>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-sm">
              Building trust in employment verification through blockchain technology and AI-assisted resume screening.
            </p>
            <div>
              <a
                href="https://github.com/SaurabhForge/BlockCredAI"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0D0B1A] border border-purple-500/25 text-xs text-gray-200 hover:border-purple-400 hover:bg-purple-950/30 transition-all shadow-sm group"
              >
                <svg
                  className="w-4 h-4 text-white group-hover:text-purple-300 transition-colors shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <span className="font-medium text-white">View project on GitHub</span>
                <svg
                  className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* SECTION B — Quick Links (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-sm font-bold text-white tracking-wide">Quick Links</h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#ai-resume-scanner"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-300 hover:text-white transition-colors group"
                >
                  <svg
                    className="w-3.5 h-3.5 text-purple-400 group-hover:text-purple-300 transition-colors shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <span>AI Resume Scanner</span>
                </a>
              </li>
              <li>
                <a
                  href="#submit-employment-record"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-300 hover:text-white transition-colors group"
                >
                  <svg
                    className="w-3.5 h-3.5 text-purple-400 group-hover:text-purple-300 transition-colors shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <span>Submit Employment Record</span>
                </a>
              </li>
            </ul>
          </div>

          {/* SECTION C — Meet the Team (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-2">
            <h3 className="text-sm font-bold text-white tracking-wide">Meet the Team</h3>
            <p className="text-xs text-gray-300">
              Designed and developed collaboratively by our team.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-1.5">
              {TEAM_MEMBERS.map((member) => (
                <div
                  key={member.name}
                  className="rounded-xl bg-[#0D0B1A]/90 border border-purple-500/20 p-2.5 sm:p-3 text-center hover:border-purple-400/50 hover:bg-purple-950/20 transition-all duration-200 flex flex-col items-center justify-between group shadow-sm min-h-[95px]"
                >
                  <svg
                    className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors mb-2 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <span className="text-xs font-semibold text-white tracking-tight leading-snug break-words mb-1">
                    {member.name}
                  </span>
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-purple-300 hover:text-purple-200 transition-colors"
                  >
                    <svg
                      className="w-3 h-3 text-purple-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      />
                    </svg>
                    <span>GitHub</span>
                    <svg
                      className="w-2.5 h-2.5 text-purple-400/80"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER COPYRIGHT */}
        <div className="border-t border-purple-500/10 mt-10 pt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} BlockCredAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
