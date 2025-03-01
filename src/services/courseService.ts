'use server'

import { currentUser } from '@clerk/nextjs/server';

// Define types
export interface Course {
    is_favorite: boolean;
    id: number;
    name?: string;
    description?: string;
}
  
  export interface Topic {
    id: number;
    name: string;
    courses: Course[];
  }
  
  // Sample courses data (replace with API call in production)
  const COURSES: Course[] = [
    { id: 1, name: 'Introduction to JavaScript', is_favorite: false },
    { id: 2, name: 'Python Fundamentals', is_favorite: true },
    { id: 3, name: 'React Advanced', is_favorite: false },
    { id: 4, name: 'Machine Learning Basics', is_favorite: true },
    { id: 5, name: 'Data Visualization', is_favorite: false },
    { id: 6, name: 'Statistics 101', is_favorite: false },
    { id: 7, name: 'UI/UX Principles', is_favorite: true },
    { id: 8, name: 'Design Systems', is_favorite: false }
  ];
  
  // Sample data for topics with courses
  const SAMPLE_TOPICS: Topic[] = [
    {
      id: 1,
      name: "Programming",
      courses: [
        { id: 101, name: "JavaScript Basics", description: "Learn the fundamentals of JavaScript", is_favorite: false },
        { id: 102, name: "Python for Beginners", description: "Introduction to Python programming", is_favorite: false},
        { id: 103, name: "Java Essential Training", description: "Master core Java concepts and syntax", is_favorite: false }
      ]
    },
    {
      id: 2,
      name: "Data Science",
      courses: [
        { id: 201, name: "Statistics 101", description: "Introduction to statistical analysis", is_favorite: false },
        { id: 202, name: "Machine Learning Fundamentals", description: "Learn basic ML concepts and applications", is_favorite: false },
        { id: 203, name: "Data Visualization", description: "Create compelling visual representations of data", is_favorite: false }
      ]
    },
    {
      id: 3,
      name: "Web Development",
      courses: [
        { id: 301, name: "HTML & CSS Basics", description: "Build the structure and style of websites", is_favorite: false },
        { id: 302, name: "React Framework", description: "Create interactive UIs with React", is_favorite: false },
        { id: 303, name: "Backend with Node.js", description: "Server-side JavaScript development", is_favorite: false }
      ]
    }
  ];
  
  /**
   * Fetches topics with their courses from the API, with fallback to sample data
   */
  export async function fetchTopicsWithCourses(): Promise<{
    topics: Topic[];
    error: string | null;
    usingSampleData: boolean;
  }> {
    try {
      // Use environment variable or fallback to hardcoded URL
      const apiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://fokakefir.go.ro';
      
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',};
      
      // Add CSRF token if available
      const csrfToken = process.env.NEXT_PUBLIC_CSRF_TOKEN || 'default-csrf-token';
      headers['csrf-token'] = csrfToken;
      const user = await currentUser();
      headers['user-id'] = user?.id ?? '';
      // console.log(user);
      
      // Set up request timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
      
      try {
        console.log(`Attempting to fetch from: ${apiUrl}/topics_with_courses`);
        
        const response = await fetch(`${apiUrl}/topics_with_courses`, {
          method: 'GET',
          headers,
          mode: 'cors',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const data: Topic[] = await response.json();
        console.log('API data received successfully:', data);
        
        return {
          topics: data,
          error: null,
          usingSampleData: false
        };
      } catch (fetchError: any) {
        console.warn(`API request failed: ${fetchError.message}`);
        
        // Log specific error types
        if (fetchError.name === 'AbortError') {
          console.log('Request timed out - using sample data');
        } else if (fetchError.message.includes('Failed to fetch')) {
          console.log('Network error - using sample data');
        } else {
          console.log('Other fetch error - using sample data');
        }
        
        // Fall back to sample data
        return {
          topics: SAMPLE_TOPICS,
          error: null,
          usingSampleData: true
        };
      }
    } catch (err) {
      console.error('Error in fetch operation:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      
      // Always fall back to sample data on any error
      return {
        topics: SAMPLE_TOPICS,
        error: errorMessage,
        usingSampleData: true
      };
    }
  }
  
  // Function to get all basic courses
  export async function getCourses(): Promise<Course[]> {
    // In a real app, this would be an API call:
    // const response = await fetch('/api/courses');
    // return response.json();
  
    // For now, just return the static data with a delay to simulate API call
    return new Promise((resolve) => {
      setTimeout(() => resolve(COURSES), 500);
    });
  }
  
  // Function to get a single course by ID
  export async function getCourseById(id: number): Promise<Course | undefined> {
    // In a real app, this would be an API call:
    // const response = await fetch(`/api/courses/${id}`);
    // return response.json();
  
    // For now, just filter the static data
    return new Promise((resolve) => {
      setTimeout(() => {
        const course = COURSES.find(c => c.id === id);
        resolve(course);
      }, 200);
    });
  }