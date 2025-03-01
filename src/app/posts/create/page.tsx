'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MDEditor from '@uiw/react-md-editor';
import { saveContent } from '@/services/contentService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@clerk/nextjs';
import { useTheme } from 'next-themes';

// Sample course data - replace with your actual data
const COURSES = [
  { id: 1, title: 'Introduction to JavaScript' },
  { id: 2, title: 'Python Fundamentals' },
  { id: 3, title: 'React Advanced' },
  { id: 4, title: 'Machine Learning Basics' },
  { id: 5, title: 'Data Visualization' },
  { id: 6, title: 'Statistics 101' },
  { id: 7, title: 'UI/UX Principles' },
  { id: 8, title: 'Design Systems' },
];

export default function MarkdownEditor() {
  // Form state
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [content, setContent] = useState<string | undefined>("**Hello world!**\n\nStart writing your content here...");
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    courseId?: string;
    content?: string;
  }>({});
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  
  // Hooks
  const { theme } = useTheme();
  const router = useRouter();
  const { userId, isLoaded, isSignedIn } = useAuth();

// Check authentication status when the component loads
useEffect(() => {
  if (isLoaded && !isSignedIn) {
    router.push('/?authAlert=You need to sign in to create content.');
  }
}, [isLoaded, isSignedIn, router]);

// Show loading state while authentication is being checked
if (!isLoaded || !isSignedIn) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

  // Mark component as mounted to avoid hydration mismatch with theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Validate form when any field changes
  useEffect(() => {
    validateForm();
  }, [title, courseId, content]);

  // Validate the form fields
  const validateForm = () => {
    const errors: {
      title?: string;
      courseId?: string;
      content?: string;
    } = {};
    
    if (!title.trim()) {
      errors.title = "Title is required";
    } else if (title.length > 100) {
      errors.title = "Title should be less than 100 characters";
    }
    
    if (!courseId) {
      errors.courseId = "Please select a course";
    }
    
    if (!content?.trim()) {
      errors.content = "Content is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    // Final validation before submission
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("==== MARKDOWN EDITOR: SUBMITTING CONTENT ====");
      console.log("Title:", title);
      console.log("Course ID:", courseId);
      console.log("Content length:", content?.length);
      console.log("Author ID:", userId);
      
      // Save content to database with additional fields
      const postData = {
        title,
        courseId: Number(courseId),
        content,
        authorId: userId,
      };
      
      console.log("==== MARKDOWN EDITOR: CALLING saveContent() ====");
      const result = await saveContent(postData);
      console.log("==== MARKDOWN EDITOR: saveContent() RETURNED ====", result);
      
      // Set success message in localStorage to show on the home page
      localStorage.setItem('alertMessage', 'Content submitted successfully');
      
      // Redirect to home page
      console.log("==== MARKDOWN EDITOR: REDIRECTING TO HOME PAGE ====");
      router.push('/');
    } catch (error) {
      console.error("==== MARKDOWN EDITOR: ERROR ====", error);
      alert("Failed to submit content. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine editor color mode based on theme
  const editorColorMode = !mounted ? 'light' : theme === 'dark' ? 'dark' : 'light';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <span className="text-base sm:text-lg">Create New Content</span>
          </CardTitle>
        </div>
        <CardDescription>Share your knowledge with the community</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              placeholder="Enter a descriptive title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={formErrors.title ? "border-red-500" : ""}
            />
            {formErrors.title && (
              <p className="text-sm text-red-500 dark:text-red-400">{formErrors.title}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <div className="relative">
              <select
                id="course"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className={`w-full rounded-md border px-3 py-2 text-sm ${
                  formErrors.courseId 
                    ? "border-red-500 focus:border-red-500" 
                    : "border-input focus:border-primary"
                } bg-transparent focus:outline-none focus:ring-1 focus:ring-primary`}
              >
                <option value="" disabled>Select a course</option>
                {COURSES.map(course => (
                  <option key={course.id} value={course.id.toString()}>
                    {course.title}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {formErrors.courseId && (
              <p className="text-sm text-red-500 dark:text-red-400">{formErrors.courseId}</p>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Content</Label>
          
          <div className="flex border rounded-md overflow-hidden mb-4">
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'edit' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-transparent hover:bg-muted'
              }`}
            >
              <svg className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 7H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                <path d="m9 15 7.5-7.5M15 7h1a1 1 0 0 1 1 1v1" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
              </svg>
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'preview' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-transparent hover:bg-muted'
              }`}
            >
              <svg className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>
          
          {activeTab === 'edit' ? (
            <div data-color-mode={editorColorMode} className={formErrors.content ? "border border-red-500 rounded-md" : ""}>
              <MDEditor
                value={content}
                onChange={setContent}
                height={400}
                preview="edit"
                className="border border-border rounded-md shadow-sm"
                textareaProps={{
                  placeholder: "Write your markdown content here...",
                }}
              />
              {formErrors.content && (
                <p className="text-sm text-red-500 dark:text-red-400 mt-2">{formErrors.content}</p>
              )}
            </div>
          ) : (
            <div className="border border-border rounded-md shadow-sm bg-background p-4 sm:p-6 min-h-[400px] overflow-auto" 
                 data-color-mode={editorColorMode}>
              <MDEditor.Markdown 
                source={content} 
                className="prose dark:prose-invert max-w-none prose-sm sm:prose-base"
              />
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || Object.keys(formErrors).length > 0}
          className="gap-2 w-full sm:w-2/3 md:w-1/2"
        >
          <Send className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="text-sm sm:text-base">
            {isSubmitting ? "Submitting..." : "Submit Content"}
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
}