import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import ExtensionErrorHandler from '../components/ExtensionErrorHandler';

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
      <head>
        {/* Intercept external extension unhandled rejections during capture phase before Turbopack dev overlay */}
        <Script
          id="suppress-extension-errors"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                window.addEventListener('unhandledrejection', function(event) {
                  try {
                    var r = event.reason || '';
                    var m = (r.message || r) + '';
                    var s = (r.stack || '') + '';
                    if (
                      m.includes('MetaMask') ||
                      m.includes('Failed to connect') ||
                      s.includes('nkbihfbeogaeaoehlefnkodbefgpgknn') ||
                      s.includes('inpage.js')
                    ) {
                      event.preventDefault();
                      event.stopImmediatePropagation();
                    }
                  } catch (e) {}
                }, true);
              }
            `,
          }}
        />
      </head>
      <body className="bg-gray-900 text-white">
        <ExtensionErrorHandler />
        {children}
      </body>
    </html>
  );
}
