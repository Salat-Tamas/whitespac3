'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/clerk-react';
import { fetchPostById, togglePostLike, getComments, addComment } from '@/services/postService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, ThumbsUp, MessageSquare, ArrowLeft, Clock, Loader2, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import MDEditor from "@uiw/react-md-editor";
import { cn } from "@/lib/utils";
import { toast } from 'react-hot-toast';
import { PostComments } from '@/components/PostComments';
import { Share2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import AiSection from '@/components/AiSection';
import Split from 'react-split';

type Post = {
  id: string;
  title: string;
  preview_md: string;
  content_md: string;
  author_id: string;
  author_name: string;
  course_id: number;
  created_at: string;
  like_count: number;
  liked_by_user: boolean;
};

type Comment = {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  author_name?: string;
  user_name?: string;
};

// Helper function for relative time display
const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);
  
  if (diffSecs < 60) {
    return `${diffSecs} seconds ago`;
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export default function PostDetailPage() {
  // Get postId from route parameters
  const params = useParams();
  const postId = params.postId as string;
  const { isSignedIn, userId } = useAuth();
  const router = useRouter();
  
  // State
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsExpanded, setCommentsExpanded] = useState(false);

  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  // Fetch post details
  useEffect(() => {
    async function loadPostDetails() {
      try {
        setIsLoading(true);
        
        // Fetch post by ID
        const { post: fetchedPost, error: fetchError, usingSampleData: usingSample } = await fetchPostById(postId);
        
        if (fetchError || !fetchedPost) {
          setError(fetchError || 'Post not found');
          setIsLoading(false);
          return;
        }
        
        setPost(fetchedPost);
        setUsingSampleData(usingSample);
        
        // Load comments initially if there's a hash in the URL for comments
        if (window.location.hash === '#comments') {
          loadComments();
          setCommentsExpanded(true);
        }
      } catch (err) {
        console.error('Error loading post details:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    
    if (postId) {
      loadPostDetails();
    }
  }, [postId]);
  
// Replace the handleLikePost function with this implementation:

const handleLikePost = async () => {
  if (!isSignedIn) {
    // Direct user to sign in
    const searchParams = new URLSearchParams();
    searchParams.set('authAlert', 'You need to sign in to like posts.');
    window.location.href = `/?${searchParams}`;
    return;
  }

  try {
    if (!post || !userId) return;
    
    // Include all required parameters for togglePostLike
    const result = await togglePostLike(
      post.id, 
      userId,
      post.liked_by_user,
      post.like_count
    );
    
    if (result.success) {
      setPost(currentPost => {
        if (!currentPost) return null;
        
        return {
          ...currentPost,
          liked_by_user: result.liked,
          like_count: result.likeCount
        };
      });
      
      toast.success(result.liked ? 'Post liked!' : 'Post unliked!', {
        position: 'top-center',
        duration: 1500
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    toast.error('Failed to update like status', { position: 'top-center' });
  }
};
  
  // Load comments
  const loadComments = async () => {
    if (!post || commentsLoading) return;
    
    try {
      setCommentsLoading(true);
      const fetchedComments = await getComments(post.id);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setCommentsLoading(false);
    }
  };
  
  // Toggle comments section
  const handleCommentsClick = () => {
    if (!commentsExpanded && comments.length === 0) {
      loadComments();
    }
    
    setCommentsExpanded(!commentsExpanded);
    
    // Update URL hash
    if (!commentsExpanded) {
      window.location.hash = 'comments';
    } else {
      // Remove hash without page jump
      history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  };
  
  // Add a new comment
  const handleAddComment = async (content: string) => {
    if (!isSignedIn || !post || !userId) return;
    
    try {
      const newComment = await addComment(post.id, content, userId);
      
      // Add the new comment to the top of the list
      setComments(prevComments => [newComment, ...prevComments]);
      
      toast.success('Comment added!', {
        position: 'top-center',
        duration: 1500
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="mx-auto max-w-3xl">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="mx-auto mb-4 text-destructive" size={48} />
            <h2 className="text-xl font-bold mb-4">Error Loading Post</h2>
            <p className="mb-4">{error}</p>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Post not found
  if (!post) {
    return (
      <div className="container mx-auto">
        <Card className="mx-auto max-w-3xl">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="mx-auto mb-4 text-amber-500" size={48} />
            <h2 className="text-xl font-bold mb-4">Post Not Found</h2>
            <p className="mb-4">The requested post could not be found.</p>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto h-[calc(100vh-4rem)] flex flex-col">
      {/* Back Navigation */}
      <div className="mb-4 flex-shrink-0">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Split 
        className="split flex flex-1 min-h-0" // Changed height handling
        sizes={[65, 35]}
        minSize={400}
        gutterSize={8}
        snapOffset={30}
      >
        <div className="overflow-y-auto pr-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          {/* Post Content Card */}
          <Card>
            {/* Post Header */}
            <CardHeader>
              <div className="flex justify-between items-start mb-1">
          <CardTitle className="text-2xl font-bold">
            {post.title}
          </CardTitle>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <span className="font-medium">{post.author_name}</span>
                  <span> · </span>
                  <Clock className="h-3 w-3 inline mr-1" />
                  <span>{getRelativeTime(post.created_at)}</span>
                  <span> · </span>
                  <span>
                    Course: <Link href={`/courses/${post.course_id}`} className="text-primary hover:underline">
                      #{post.course_id}
                    </Link>
                  </span>
                </div>
                
                {usingSampleData && (
                  <span className="text-xs text-amber-500 font-medium">
                    (Using sample data)
                  </span>
                )}
              </div>
            </CardHeader>
            
            {/* Post Content */}
            <CardContent className="pt-0">
              <div className="prose dark:prose-invert prose-headings:font-heading prose-headings:leading-tight max-w-none" data-color-mode={isDarkMode ? 'dark' : 'light'}>
                <MDEditor.Markdown 
                  source={post.content_md} 
                  rehypePlugins={[]}
                />
              </div>
            </CardContent>
            
            {/* Post Actions */}
            <CardFooter className="border-t pt-4 flex justify-between">
              <div className="flex space-x-4">
                <button 
                  onClick={handleLikePost}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md transition-all",
                    "hover:bg-primary/10",
                    post.liked_by_user ? 
                      "text-primary font-medium bg-primary/5 border border-primary/20" : 
                      "hover:text-primary border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <ThumbsUp className={cn(
                      "h-4 w-4 transition-transform",
                      post.liked_by_user && "fill-primary",
                      "hover:scale-110"
                    )} />
                    <span className={cn(
                      "tabular-nums text-sm",
                      post.liked_by_user && "text-primary"
                    )}>
                      {post.like_count}
                    </span>
                  </div>
                </button>
                
                <button 
                  onClick={handleCommentsClick}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md transition-all",
                    "hover:bg-primary/10 hover:text-primary",
                    commentsExpanded && "bg-primary/5 text-primary"
                  )}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Comments</span>
                </button>
                
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard!', { position: 'top-center' });
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-primary/10 hover:text-primary transition-all"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
              </div>
              
              {isSignedIn && post.course_id && (
                <Link 
                  href={`/posts/create?course_id=${post.course_id}`}
                  className="text-primary text-sm hover:underline"
                >
                  Create a new post in this course
                </Link>
              )}
            </CardFooter>
          </Card>

          {/* Comments Section */}
          {commentsExpanded && (
            <div className="mt-6" id="comments">
              <Card>
                <CardHeader>
                  <CardTitle>Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <PostComments 
                    comments={comments}
                    onAddComment={handleAddComment}
                    isLoading={commentsLoading}
                    isOpen={true}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="pl-4 h-full overflow-hidden">
          <AiSection 
          markdown={post.content_md}  />
        </div>
      </Split>
    </div>
  );
}