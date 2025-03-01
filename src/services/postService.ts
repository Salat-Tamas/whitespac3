'use server'

import { currentUser } from '@clerk/nextjs/server';

// Define types for posts and related data
export interface Post {
  id: string;
  course_id: number;
  author_id: string;
  title: string;
  preview_md: string;
  content_md: string;
  created_at: string;
  like_count: number;
  liked_by_user: boolean;
}

// Sample posts data (fallback for when API is unavailable)
const SAMPLE_POSTS: Post[] = [
  {
    id: "1",
    course_id: 101,
    author_id: "user_2YfK9gkEL7H8JD1g3cGKH4VlZFd",
    title: "Introduction to JavaScript Arrays",
    preview_md: "Arrays are fundamental data structures in JavaScript. Let's explore how they work and what you can do with them.",
    content_md: "# JavaScript Arrays\n\nArrays are ordered collections of values that you can access by index. They're incredibly versatile and offer many built-in methods for common operations.\n\n## Creating Arrays\n\n```javascript\nconst fruits = ['apple', 'banana', 'orange'];\nconst numbers = [1, 2, 3, 4, 5];\nconst mixed = [42, 'hello', true, null];\n```\n\n## Array Methods\n\nJavaScript arrays come with powerful built-in methods:\n\n- `push()` - Add items to the end\n- `pop()` - Remove the last item\n- `shift()` - Remove the first item\n- `unshift()` - Add items to the beginning\n- `splice()` - Add or remove items at any position\n\n## Array Iteration\n\nModern JavaScript offers many ways to iterate through arrays:\n\n```javascript\n// forEach\nfruits.forEach(fruit => console.log(fruit));\n\n// map\nconst upperFruits = fruits.map(fruit => fruit.toUpperCase());\n\n// filter\nconst longFruits = fruits.filter(fruit => fruit.length > 5);\n```",
    created_at: "2025-03-01T09:30:00.000Z",
    like_count: 42,
    liked_by_user: false
  },
  {
    id: "2",
    course_id: 102,
    author_id: "user_2MhKXj8FdP91RdG28kJpQ5VnZAc",
    title: "Python List Comprehensions",
    preview_md: "List comprehensions are a powerful feature in Python that allow you to create lists with a single line of code.",
    content_md: "# Python List Comprehensions\n\nList comprehensions provide a concise way to create lists based on existing lists or other iterables.\n\n## Basic Syntax\n\n```python\n# Basic syntax\n[expression for item in iterable]\n\n# With condition\n[expression for item in iterable if condition]\n```\n\n## Examples\n\n```python\n# Square numbers from 0 to 9\nsquares = [x**2 for x in range(10)]\n\n# Even numbers only\nevens = [x for x in range(20) if x % 2 == 0]\n\n# Nested list comprehension\nmatrix = [[j for j in range(3)] for i in range(3)]\n```\n\nList comprehensions are not only more concise but often faster than equivalent loops.",
    created_at: "2025-02-28T14:15:00.000Z",
    like_count: 37,
    liked_by_user: true
  },
  {
    id: "3",
    course_id: 301,
    author_id: "user_1ZjN7vkMP3G2QF8h4bLrJ9DnXPe",
    title: "CSS Grid vs Flexbox",
    preview_md: "Understanding when to use CSS Grid and when to use Flexbox is essential for modern web development.",
    content_md: "# CSS Grid vs Flexbox\n\nBoth CSS Grid and Flexbox are powerful layout systems, but they serve different purposes and work best in different scenarios.\n\n## Flexbox\n\nFlexbox is designed for one-dimensional layouts - either a row OR a column:\n\n```css\n.container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n```\n\n## Grid\n\nCSS Grid is designed for two-dimensional layouts - rows AND columns simultaneously:\n\n```css\n.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  grid-gap: 20px;\n}\n```\n\n## When to Use Each\n\n- Use **Flexbox** when:\n  - You need to align items within a container\n  - You're working with a single row or column\n  - You need to distribute space among items\n\n- Use **Grid** when:\n  - You need to create a full page layout\n  - You have both rows and columns to manage\n  - You need precise control over placement",
    created_at: "2025-02-25T10:45:00.000Z",
    like_count: 28,
    liked_by_user: false
  }
];

/**
 * Fetches posts from the API with sorting and limit options
 * Falls back to sample data if the API is unavailable
 */
export async function fetchPosts({
  sortByLikes = false,
  limit = 10
}: {
  sortByLikes?: boolean;
  limit?: number;
} = {}): Promise<{
  posts: Post[];
  error: string | null;
  usingSampleData: boolean;
}> {
  try {
    // Use environment variable or fallback to hardcoded URL
    const apiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://fokakefir.go.ro';
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add CSRF token if available
    const csrfToken = process.env.NEXT_PUBLIC_CSRF_TOKEN || 'default-csrf-token';
    headers['csrf-token'] = csrfToken;
    
    // Get authenticated user
    const user = await currentUser();
    headers['user-id'] = user?.id ?? '';
    
    // Set up request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
    
    // Prepare URL with query parameters
    const queryParams = new URLSearchParams();
    if (sortByLikes) {
      queryParams.append('sort_by_likes', 'true');
    }
    if (limit) {
      queryParams.append('limit', limit.toString());
    }
    
    const url = `${apiUrl}/posts${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    console.log(`Attempting to fetch posts from: ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        // mode: 'cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data: Post[] = await response.json();
      // console.log('API posts data received successfully:', data);
      
      return {
        posts: data,
        error: null,
        usingSampleData: false
      };
    } catch (fetchError: any) {
      console.warn(`API request failed: ${fetchError.message}`);
      
      // Log specific error types for better debugging
      if (fetchError.name === 'AbortError') {
        console.log('Request timed out - using sample post data');
      } else if (fetchError.message.includes('Failed to fetch')) {
        console.log('Network error - using sample post data');
      } else {
        console.log('Other fetch error - using sample post data');
      }
      
      // Return sample data as fallback
      const sampleData = [...SAMPLE_POSTS];
      if (sortByLikes) {
        sampleData.sort((a, b) => b.like_count - a.like_count);
      }
      
      return {
        posts: sampleData.slice(0, limit),
        error: null,
        usingSampleData: true
      };
    }
  } catch (err) {
    console.error('Error in fetch operation:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    
    // Return sample data on any error
    return {
      posts: SAMPLE_POSTS.slice(0, limit),
      error: errorMessage,
      usingSampleData: true
    };
  }
}

/**
 * Fetch a single post by ID
 */
export async function getPostById(postId: string): Promise<{
  post: Post | null;
  error: string | null;
  usingSampleData: boolean;
}> {
  try {
    // Use environment variable or fallback to hardcoded URL
    const apiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://fokakefir.go.ro';
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add CSRF token if available
    const csrfToken = process.env.NEXT_PUBLIC_CSRF_TOKEN || 'default-csrf-token';
    headers['csrf-token'] = csrfToken;
    
    // Get authenticated user
    const user = await currentUser();
    headers['user-id'] = user?.id ?? '';
    
    // Set up request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    try {
      console.log(`Attempting to fetch post with ID: ${postId}`);
      
      const response = await fetch(`${apiUrl}/posts/${postId}`, {
        method: 'GET',
        headers,
        // mode: 'cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      // console.log('API post data received successfully:', data);
      
      return {
        post: data,
        error: null,
        usingSampleData: false
      };
    } catch (fetchError) {
      console.warn(`API request failed: ${fetchError}`);
      
      // Find sample post with matching ID
      const samplePost = SAMPLE_POSTS.find(post => post.id === postId);
      
      return {
        post: samplePost || null,
        error: samplePost ? null : 'Post not found',
        usingSampleData: true
      };
    }
  } catch (err) {
    console.error('Error fetching post by ID:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    
    // Try to find post in sample data
    const samplePost = SAMPLE_POSTS.find(post => post.id === postId);
    
    return {
      post: samplePost || null,
      error: errorMessage,
      usingSampleData: true
    };
  }
}

/**
 * Create a new post
 */
export async function createPost(postData: Omit<Post, 'id' | 'created_at' | 'like_count' | 'liked_by_user'>): Promise<{
    success: boolean;
    post?: Post;
    error?: string;
  }> {
    try {
      // Use environment variable or fallback to hardcoded URL
      const apiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://fokakefir.go.ro';
      
      // Prepare headers - only needs csrf-token
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add CSRF token
      const csrfToken = process.env.NEXT_PUBLIC_CSRF_TOKEN || 'default-csrf-token';
      headers['csrf-token'] = csrfToken;
      
      // Get authenticated user for author_id
      const user = await currentUser();
      
      if (!user || !user.id) {
        return {
          success: false,
          error: 'Authentication required to create a post'
        };
      }
      
      console.log('Creating post with data:', { 
        ...postData,
        author_id: user.id 
      });
      
      try {
        // Fix: Use the correct endpoint '/create_post' instead of '/posts'
        const response = await fetch(`${apiUrl}/create_post`, {
          method: 'POST',
          headers, // Only contains csrf-token, not user-id
          // mode: 'cors',
          body: JSON.stringify({
            course_id: postData.course_id,
            author_id: user.id, // Use the authenticated user ID
            title: postData.title,
            preview_md: postData.preview_md,
            content_md: postData.content_md
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error (${response.status}): ${errorText}`);
        }
        
        const createdPost = await response.json();
        console.log('Post created successfully:', createdPost);
        
        return {
          success: true,
          post: createdPost
        };
      } catch (fetchError) {
        console.error('Error creating post:', fetchError);
        
        // For development purposes, simulate a successful response
        if (process.env.NODE_ENV === 'development') {
          console.log('Development mode: Simulating successful post creation');
          
          const mockPost: Post = {
            id: `temp-${Date.now()}`,
            course_id: postData.course_id,
            author_id: user.id,
            title: postData.title,
            preview_md: postData.preview_md,
            content_md: postData.content_md,
            created_at: new Date().toISOString(),
            like_count: 0,
            liked_by_user: false
          };
          
          // Add to sample data for development convenience
          SAMPLE_POSTS.unshift(mockPost);
          
          return {
            success: true,
            post: mockPost,
            error: 'Using mock data - API unavailable'
          };
        }
        
        return {
          success: false,
          error: `Failed to create post: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`
        };
      }
    } catch (err) {
      console.error('Unexpected error in createPost:', err);
      
      return {
        success: false,
        error: `Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`
      };
    }
  }

/**
 * Toggle like status for a post
 */
export async function togglePostLike(postId: string, userId: string, isCurrentlyLiked: boolean, currentLikeCount: number) {
  try {
    const url = isCurrentlyLiked
      ? `${process.env.NEXT_PUBLIC_FASTAPI_URL}/remove_like?post_id=${postId}`
      : `${process.env.NEXT_PUBLIC_FASTAPI_URL}/like_post?post_id=${postId}`;

    const response = await fetch(url, {
      method: isCurrentlyLiked ? 'DELETE' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'csrf-token': process.env.NEXT_PUBLIC_CSRF_TOKEN || '',
        'user-id': userId
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to ${isCurrentlyLiked ? 'unlike' : 'like'} post`);
    }

    const data = await response.json();
    return {
      success: true,
      liked: !isCurrentlyLiked,
      // Use server response or calculate new count
      likeCount: data.like_count ?? (isCurrentlyLiked ? currentLikeCount - 1 : currentLikeCount + 1)
    };
  } catch (error) {
    console.error('Error toggling post like:', error);
    throw error;
  }
}