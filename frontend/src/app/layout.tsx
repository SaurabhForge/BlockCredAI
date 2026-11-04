import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BlockCredAI — Trustless Employment Verification Engine',
  description: 'Blockchain-based employment verification with AI fraud detection',
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080610] text-white selection:bg-purple-500/30 selection:text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
