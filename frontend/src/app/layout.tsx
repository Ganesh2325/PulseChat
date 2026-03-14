import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PulseChat — Real-Time Messaging',
  description: 'A production-grade real-time messaging platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[var(--bg-primary)] text-[var(--text-primary)] h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
