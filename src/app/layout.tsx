import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

// Initialize the Inter font with Latin subset
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Whitespac3 Learning Platform',
  description: 'An educational platform for online courses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-gray-50">
        <div className="flex min-h-screen flex-col">
          {/* You could add a global header here if needed */}
          <main className="flex-grow">
            {children}
          </main>
          {/* You could add a global footer here if needed */}
        </div>
      </body>
    </html>
  );
}