'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CoursesSection from '@/components/CoursesSection';
import WelcomeCard from '@/components/WelcomeCard';
import PostsSection from '@/components/PostsSection';
import LatestPostsSection from '@/components/LatestPostsSection';
import AiSection from '@/components/AiSection';

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [authAlert, setAuthAlert] = useState<string | null>(null);
  
  // Check for auth alert parameter and clear it from URL
  useEffect(() => {
    const alertMessage = searchParams.get('authAlert');
    if (alertMessage) {
      // Set the alert message
      setAuthAlert(alertMessage);
      
      // Remove the query parameter from URL to prevent showing alert on refresh
      const url = new URL(window.location.href);
      url.searchParams.delete('authAlert');
      window.history.replaceState({}, '', url);
      
      // Clear the alert after 5 seconds
      const timer = setTimeout(() => {
        setAuthAlert(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams]);
  
  return (
    <>
      {/* Auth Alert Banner */}
      {authAlert && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-lg w-full max-w-md">
          <p className="font-medium">{authAlert}</p>
          <p className="text-sm mt-1">Please sign in using the button in the navigation bar.</p>
          <button 
            className="absolute top-2 right-2 text-red-500"
            onClick={() => setAuthAlert(null)}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
    
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <CoursesSection />
        </div>
        
        <div className="lg:col-span-9 space-y-6">
          <WelcomeCard />
          <PostsSection />
        </div>
      </div>
    </>
  );
}