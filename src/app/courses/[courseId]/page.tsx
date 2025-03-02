'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Add useRouter
import { useAuth } from '@clerk/clerk-react'; // Client-side import
import { toast } from 'react-hot-toast';
import { fetchPosts, togglePostLike, getComments, addComment } from '@/services/postService';
import { fetchTopicsWithCourses, Course } from '@/services/courseService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ThumbsUp, MessageSquare, Clock, Loader2, ArrowLeft, Share2, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import MDEditor from "@uiw/react-md-editor";
import { cn } from "@/lib/utils";
import { PostComments } from '@/components/PostComments';
import { useTheme } from 'next-themes';

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
  user_name: string;
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  author_name?: string;
};

// Helper function for relative time
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

export default function CourseDetailPage() {
  // Use useParams hook instead of direct param access
  const params = useParams();
  const router = useRouter(); // Add useRouter for navigation
  const courseId = parseInt(params.courseId as string);
  const { isSignedIn, userId } = useAuth();
  
  // State
  const [course, setCourse] = useState<Course | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [sortByLikes, setSortByLikes] = useState(false);
  
  // Comment state
  const [expandedCommentId, setExpandedCommentId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});

  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  // Load course and posts
  useEffect(() => {
    const loadCourseAndPosts = async () => {
      try {
        setIsLoading(true);
        
        // First, load course data from topics
        const { topics, usingSampleData: usingSample } = await fetchTopicsWithCourses();
        
        // Find the course in the topics data
        let foundCourse: Course | null = null;
        for (const topic of topics) {
          const course = topic.courses.find(c => c.id === courseId);
          if (course) {
            foundCourse = course;
            break;
          }
        }
        
        setCourse(foundCourse);
        setUsingSampleData(usingSample);
        
        if (!foundCourse) {
          setError('Course not found');
          setIsLoading(false);
          return;
        }
        
        // Now load posts for this course specifically
        const { posts: coursePosts, usingSampleData: usingPostsSampleData } = await fetchPosts({ 
          course_id: courseId,
          sortByLikes: sortByLikes // Add sorting parameter
        });
        
        setPosts(coursePosts);
        setUsingSampleData(usingSampleData || usingPostsSampleData);
        
      } catch (err) {
        console.error('Error loading course details:', err);
        setError('Failed to load course data');
        toast.error('Failed to load course details');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (courseId && !isNaN(courseId)) {
      loadCourseAndPosts();
    }
  }, [courseId, sortByLikes]);

  // Handle like post - match home page functionality
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
        currentPost.like_count  // Add this parameter
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
        
        // toast.success(result.liked ? 'Post liked!' : 'Post unliked!', {
        //   position: 'top-center',
        //   duration: 1500
        // });
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
        [expandedCommentId]: [
          newComment,
          ...(prev[expandedCommentId] || [])
        ]
      }));
      
      // toast.success('Comment added!', {
      //   position: 'top-center',
      //   duration: 1500
      // });
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
          <p className="text-muted-foreground">Loading course details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="mx-auto mb-4 text-destructive" size={48} />
            <h2 className="text-xl font-bold mb-4">Error Loading Course</h2>
            <p className="mb-4">{error}</p>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Course not found
  if (!course) {
    return (
      <div className="container mx-auto py-8">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="mx-auto mb-4 text-amber-500" size={48} />
            <h2 className="text-xl font-bold mb-4">Course Not Found</h2>
            <p className="mb-4">The requested course could not be found.</p>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Navigation */}
        <div className="mb-4">
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
        
        <div className="grid gap-6">
          {/* Course Header Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                {course.name || `Course #${courseId}`}
              </CardTitle>
              <CardDescription className="text-base">
                {course.description || 'No description available'}
              </CardDescription>
            </CardHeader>
          </Card>
          
          {/* Course Posts Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Course Posts</CardTitle>
                  <CardDescription>
                    {sortByLikes ? "Most liked content" : "Recently added content"}
                    {usingSampleData && (
                      <span className="ml-2 text-xs text-amber-500 font-medium">
                        (Using sample data - API unavailable)
                      </span>
                    )}
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => setSortByLikes(!sortByLikes)}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {sortByLikes ? "Show Latest" : "Show Trending"}
                    </span>
                  </Button>
                  
                  {isSignedIn && (
                    <Link href={`/posts/create?course_id=${courseId}`}>
                      <Button size="sm">New Post</Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No posts yet in this course.</p>
                  {isSignedIn && (
                    <Link href={`/posts/create?course_id=${courseId}`}>
                      <Button>Create the First Post</Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
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
                          {post.author_name || `User ${post.author_id.substring(0, 6)}`}
                        </span>
                      </div>
                      <div className="prose dark:prose-invert prose-sm max-w-none mb-3 p-4 bg-white dark:bg-[#0d1117] rounded-md" data-color-mode={isDarkMode ? 'dark' : 'light'}>
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
                            "flex items-center gap-2 px-2 py-1 rounded-md transition-all",
                            "hover:bg-primary/10 hover:text-primary",
                            expandedCommentId === post.id && "bg-primary/5 text-primary"
                          )}
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>Comments</span>
                        </button>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
                            toast.success('Link copied to clipboard!', { position: 'top-center' });
                          }}
                          className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-primary/10 hover:text-primary transition-all"
                        >
                          <Share2 className="h-4 w-4" />
                          <span>Share</span>
                        </button>
                      </div>
                      
                      {/* Comments section */}
                      {expandedCommentId === post.id && (
                        <div className="mt-4">
                          <PostComments
                            comments={comments[post.id] || []}
                            onAddComment={handleAddComment}
                            isOpen={true}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}