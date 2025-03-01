'use client';

import ContentCreator from '@/components/MarkdownEditor';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function CreatePostPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  
  // Immediate check and redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      setRedirecting(true);
      const searchParams = new URLSearchParams();
      searchParams.set('authAlert', 'You need to sign in to create content.');
      router.replace(`/?${searchParams}`);
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading for initial auth check
  if (!isLoaded || redirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">
          {redirecting ? "Redirecting to login..." : "Loading..."}
        </p>
      </div>
    );
  }
  
  // Extra safety - don't render content if not signed in
  // This shouldn't happen due to the redirect, but just in case
  if (!isSignedIn) {
    return null;
  }

  // Only render if authenticated
  return <ContentCreator />;
}