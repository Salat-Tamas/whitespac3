'use client';

import CoursesSection from '@/components/CoursesSection';
import WelcomeCard from '@/components/WelcomeCard';
import PostsSection from '@/components/PostsSection';
import LatestPostsSection from '@/components/LatestPostsSection';
import AiSection from '@/components/AiSection';

export default function HomePage() {
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-3 space-y-6">
        <CoursesSection />
      </div>
      
      <div className="lg:col-span-6 space-y-6">
        <WelcomeCard />
        
        <PostsSection />
        
        <LatestPostsSection />
      </div>
      
      <div className="lg:col-span-3 space-y-6">
        <AiSection />
      </div>
    </div>
  );
}