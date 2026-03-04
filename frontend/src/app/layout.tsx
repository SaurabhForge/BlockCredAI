import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BlockCredAI - Decentralized Employment Verification',
  description: 'Blockchain-based employment verification with AI fraud detection',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">
        {children}
      </body>
    </html>
  );
}
