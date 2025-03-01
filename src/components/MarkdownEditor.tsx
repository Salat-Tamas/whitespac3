'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MDEditor from '@uiw/react-md-editor';
import { saveContent } from '@/services/contentService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, FileText, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from 'next-themes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@clerk/nextjs';

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
    auth?: string;
  }>({});
  const [mounted, setMounted] = useState(false);
  
  // Hooks
  const { theme } = useTheme();
  const router = useRouter();
  const { isLoaded, userId, isSignedIn } = useAuth();

  // Mark component as mounted to avoid hydration mismatch with theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Validate form when any field changes
  useEffect(() => {
    if (isLoaded) {
      validateForm();
    }
  }, [title, courseId, content, isLoaded, isSignedIn]);

  // Validate the form fields
  const validateForm = () => {
    const errors: {
      title?: string;
      courseId?: string;
      content?: string;
      auth?: string;
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
    
    if (isLoaded && !isSignedIn) {
      errors.auth = "You must be signed in to create content";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!isLoaded) return;
    
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

  // Show loading state or auth check before fully rendering
  if (!isLoaded) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
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
          {!isSignedIn && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Authentication Required</h3>
                  <p className="text-sm mt-1">
                    You must be signed in to create content. Please sign in and try again.
                  </p>
                </div>
              </div>
            </div>
          )}
          
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
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger 
                  id="course" 
                  className={formErrors.courseId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {COURSES.map(course => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.courseId && (
                <p className="text-sm text-red-500 dark:text-red-400">{formErrors.courseId}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Content</Label>
            <Tabs defaultValue="edit" className="w-full">
              <TabsList className="mb-4 grid grid-cols-2 sm:w-auto">
                <TabsTrigger value="edit" className="flex items-center gap-2">
                  <svg className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 7H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                    <path d="m9 15 7.5-7.5M15 7h1a1 1 0 0 1 1 1v1" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                  </svg>
                  <span className="hidden sm:inline">Edit</span>
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <svg className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="hidden sm:inline">Preview</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="edit">
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
                </div>
                {formErrors.content && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-2">{formErrors.content}</p>
                )}
              </TabsContent>
              
              <TabsContent value="preview">
                <div className="border border-border rounded-md shadow-sm bg-background p-4 sm:p-6 min-h-[400px] overflow-auto" 
                     data-color-mode={editorColorMode}>
                  <MDEditor.Markdown 
                    source={content} 
                    className="prose dark:prose-invert max-w-none prose-sm sm:prose-base"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-4 flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !isSignedIn || Object.keys(formErrors).length > 0}
            className="gap-2 w-full sm:w-2/3 md:w-1/2"
          >
            <Send className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-sm sm:text-base">
              {isSubmitting ? "Submitting..." : "Submit Content"}
            </span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}