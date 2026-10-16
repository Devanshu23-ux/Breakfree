import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BreakFree — Break the Chain. One Day at a Time.',
  description:
    'BreakFree helps you quit smoking, alcohol, or any habit with streaks, points, badges, and daily challenges. Track your progress and celebrate every free day.',
  keywords: 'quit smoking, addiction recovery, habit tracker, streak app, gamified wellness',
  openGraph: {
    title: 'BreakFree — Break the Chain',
    description: 'Quit any habit with streaks, badges and daily challenges.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#1DB89A" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        <div className="app-shell">
          {children}
        </div>
      </body>
    </html>
  );
}
