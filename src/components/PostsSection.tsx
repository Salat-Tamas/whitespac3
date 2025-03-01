'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { ThumbsUp, MessageSquare, Share2, Loader2, AlertTriangle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { fetchPosts, Post, togglePostLike, addComment, getComments } from '@/services/postService';
import { fetchTopicsWithCourses, Course, Topic } from '@/services/courseService'; // Import course service
import { useClerk } from '@clerk/clerk-react';
import MDEditor from "@uiw/react-md-editor";
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { PostComments } from './PostComments';
import {useTheme} from 'next-themes';

// Type for minimal user data
interface UserData {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  imageUrl?: string;
}

// Function to format author name
const formatAuthorName = (user?: UserData) => {
  if (!user) return 'Unknown Author';
  
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  if (user.username) {
    return user.username;
  }
  
  return `User ${user.id.substring(0, 6)}`;
};

// Function to format relative time
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

export function PostsSection() {
  const { isSignedIn, userId } = useAuth();
  const clerk = useClerk();
  const [posts, setPosts] = useState<Post[]>([]);
  const [authors, setAuthors] = useState<Record<string, UserData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [apiAttempted, setApiAttempted] = useState(false);
  
  // Course data state
  const [coursesMap, setCoursesMap] = useState<Record<number, Course>>({});
  const [coursesLoading, setCoursesLoading] = useState(true);
  
  // Pagination state
  const [postsLimit, setPostsLimit] = useState(5);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Add these new states
  const [expandedCommentId, setExpandedCommentId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, any[]>>({});

  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  // Fetch course data
  useEffect(() => {
    async function loadCourses() {
      try {
        const { topics } = await fetchTopicsWithCourses();
        
        // Create a flat map of courses by ID for quick lookups
        const courseMap: Record<number, Course> = {};
        topics.forEach(topic => {
          topic.courses.forEach(course => {
            courseMap[course.id] = course;
          });
        });
        
        setCoursesMap(courseMap);
      } catch (err) {
        console.error('Error loading course data:', err);
      } finally {
        setCoursesLoading(false);
      }
    }
    
    loadCourses();
  }, []);

  // Fetch posts
  useEffect(() => {
    const loadPosts = async (isLoadingMore = false) => {
      try {
        if (!isLoadingMore) {
          setIsLoading(true);
        } else {
          setLoadingMore(true);
        }
        setApiAttempted(true);
        
        const { posts: fetchedPosts, error: fetchError, usingSampleData: usingSample } = 
          await fetchPosts({ sortByLikes: false, limit: postsLimit });
        
        setPosts(fetchedPosts);
        setError(fetchError);
        setUsingSampleData(usingSample);
        
        // If we got fewer posts than requested, we've reached the end
        setHasMore(fetchedPosts.length >= postsLimit);
        
        // Collect unique author IDs to fetch their info
        const uniqueAuthorIds = [...new Set(fetchedPosts.map(post => post.author_id))];
        
        // Fetch user data for authors
        if (clerk?.users) {
          try {
            const authorData: Record<string, UserData> = {};
            
            for (const authorId of uniqueAuthorIds) {
              try {
                // Try to get the user directly from Clerk
                const user = await clerk.users.getUser(authorId);
                
                if (user) {
                  authorData[authorId] = {
                    id: user.id,
                    firstName: user.firstName || undefined,
                    lastName: user.lastName || undefined,
                    username: user.username || undefined,
                    imageUrl: user.imageUrl || undefined
                  };
                  console.log(`Found user for ${authorId}:`, user.firstName, user.lastName);
                } else {
                  console.warn(`No user found for ID ${authorId}`);
                  // Add placeholder data
                  authorData[authorId] = {
                    id: authorId,
                    username: `Author ${authorId.substring(0, 6)}`
                  };
                }
              } catch (userError) {
                console.warn(`Could not fetch user data for ID ${authorId}:`, userError);
                // Add placeholder data
                authorData[authorId] = {
                  id: authorId,
                  username: `Author ${authorId.substring(0, 6)}`
                };
              }
            }
            
            console.log('Author data collected:', authorData);
            setAuthors(authorData);
          } catch (userError) {
            console.error('Error fetching author data:', userError);
          }
        } else {
          console.warn('Clerk users API not available');
        }
      } catch (err) {
        console.error('Unexpected error in PostsSection:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
        setLoadingMore(false);
      }
    };

    loadPosts();
  }, [clerk?.users, postsLimit]);

  // Get course name from ID using the dynamic courses data
  const getCourseName = (courseId: number): string => {
    if (coursesMap[courseId]) {
      return coursesMap[courseId].name || coursesMap[courseId].title || `Course ${courseId}`;
    }
    return `Course ${courseId}`;
  };

  const handleLikePost = async (postId: string) => {
    if (!userId) {
      toast.error('Please sign in to like posts', { position: 'top-center' });
      return;
    }

    try {
      const currentPost = posts.find(post => post.id === postId);
      if (!currentPost) return;

      const result = await togglePostLike(
        postId, 
        userId, 
        currentPost.liked_by_user,
        currentPost.like_count
      );
      
      if (result.success) {
        setPosts(currentPosts => 
          currentPosts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  liked_by_user: result.liked,
                  like_count: result.likeCount
                } 
              : post
          )
        );

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

  // Add this function to handle comment dialog open
  const handleCommentClick = async (postId: string) => {
    if (expandedCommentId === postId) {
      setExpandedCommentId(null);
      return;
    }

    setExpandedCommentId(postId);
    try {
      // This is where we fetch comments
      const fetchedComments = await getComments(postId);
      setComments(prev => ({
        ...prev,
        [postId]: fetchedComments
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    }
  };

  // Add function to handle new comments
  const handleAddComment = async (content: string) => {
    if (!expandedCommentId || !userId) return;

    try {
      const newComment = await addComment(expandedCommentId, content, userId);
      setComments(prev => ({
        ...prev,
        [expandedCommentId]: [...(prev[expandedCommentId] || []), newComment]
      }));
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Latest Posts</CardTitle>
        </div>
        <CardDescription>
          Trending educational content
          {usingSampleData && apiAttempted && (
            <span className="ml-2 text-xs text-amber-500 font-medium">
              (Using sample data - API unavailable)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      {usingSampleData && apiAttempted && (
        <CardContent className="pt-0 pb-1">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 
                        dark:border-amber-800 text-amber-800 dark:text-amber-200 
                        rounded-md p-3 text-sm flex items-start">
            <AlertTriangle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              Unable to connect to <code className="bg-amber-100 dark:bg-amber-900/40 px-1 
                                                 py-0.5 rounded">fokakefir.go.ro</code>. 
              Displaying sample post data for development purposes.
            </div>
          </div>
        </CardContent>
      )}
      
      <CardContent>
        {isLoading || coursesLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">
              {isLoading ? "Loading posts..." : "Loading course data..."}
            </span>
          </div>
        ) : error && !usingSampleData ? (
          <div className="py-6 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <p className="text-center py-4 text-sm text-muted-foreground">
                No posts available
              </p>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="border rounded-md p-4 bg-card relative">
                  {/* Relative time indicator */}
                  <div className="absolute top-3 right-3 text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{getRelativeTime(post.created_at)}</span>
                  </div>

                  <h3 className="font-medium text-lg mb-1 pr-24">
                    <Link href={`/posts/${post.id}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </h3>
                  <div className="text-sm text-muted-foreground mb-3">
                    <span className="font-medium">
                      {formatAuthorName(authors[post.author_id])}
                    </span>
                    <span> in </span>
                    <Link href={`/courses/${post.course_id}`} className="text-primary hover:underline">
                      {getCourseName(post.course_id)}
                    </Link>
                  </div>
                  <div className="prose dark:prose-invert prose-sm max-w-none mb-3" data-color-mode={isDarkMode ? 'dark' : 'light'}>
                    <MDEditor.Markdown 
                      source={post.preview_md} 
                      rehypePlugins={[]}
                    />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <button 
                      onClick={() => handleLikePost(post.id)}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1 rounded-md transition-all",
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
                          "tabular-nums text-sm min-w-[1.5rem]",
                          post.liked_by_user && "text-primary"
                        )}>
                          {post.like_count}
                        </span>
                      </div>
                    </button>
                    <button 
                      onClick={() => handleCommentClick(post.id)}
                      className={cn(
                        "flex items-center gap-1 transition-colors",
                        expandedCommentId === post.id ? "text-primary" : "hover:text-primary"
                      )}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Comments</span>
                    </button>
                    <button 
                      onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_URL}/posts/${post.id}`);
                        toast.success('Share link copied to clipboard', {
                          position: 'top-center',
                          duration: 1500
                        });
                      } catch (err) {
                        toast.error('Failed to copy link');
                      }
                      }}
                      className="flex items-center gap-1 hover:text-primary transition"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </button>
                  </div>
                  
                  <PostComments
                    comments={comments[post.id] || []}
                    onAddComment={handleAddComment}
                    isOpen={expandedCommentId === post.id}
                  />
                </div>
              ))
            )}

<div className="flex justify-center mt-6">
  {posts.length > 0 && (
    hasMore ? (
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setPostsLimit(prevLimit => prevLimit + 10)}
        disabled={loadingMore}
      >
        {loadingMore ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading more...</span>
          </>
        ) : (
          <>
            <span>View more posts</span>
          </>
        )}
      </Button>
    ) : (
      <div className="text-sm text-muted-foreground">
        No more posts to load
      </div>
    )
  )}
</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PostsSection;