"use client";

import React, { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import MDEditor from "@uiw/react-md-editor";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { Send, FileText, AlertCircle, Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuth } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import {
  fetchTopicsWithCourses,
  Course,
  Topic,
} from "@/services/courseService";
import { createPost } from "@/services/postService";
import { useToast } from "@/components/ui/use-toast";

// Component for displaying grouped course options
const CourseOptions = ({ topics }: { topics: Topic[] }) => {
  return (
    <>
      {topics.map((topic) => (
        <optgroup key={topic.id} label={topic.name}>
          {topic.courses.map((course) => (
            <option key={course.id} value={course.id.toString()}>
              {course.name || course.title || `Course ${course.id}`}
            </option>
          ))}
        </optgroup>
      ))}
    </>
  );
};

function ContentCreator() {
  // Theme and router
  const { theme } = useTheme();
  const router = useRouter();

  // Toast notifications
  const { toast } = useToast();

  // Authentication
  const { userId, isLoaded, isSignedIn } = useAuth();

  // All state in one reducer to avoid hook ordering issues
  const [state, setState] = React.useState({
    title: "",
    courseId: "",
    content: "**Hello world!**\n\nStart writing your content here...",
    isSubmitting: false,
    mounted: false,
    activeTab: "edit",
    formErrors: {},
    authRedirecting: false,
  });

  // Topics and courses state
  const [topics, setTopics] = useState<Topic[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [usingSampleData, setUsingSampleData] = useState(false);

  // Destructure state for easier access
  const {
    title,
    courseId,
    content,
    isSubmitting,
    mounted,
    activeTab,
    formErrors,
    authRedirecting,
  } = state;

  // Update state helper function
  const updateState = (updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  // Fetch courses when component mounts
  useEffect(() => {
    async function loadCoursesFromTopics() {
      try {
        setCoursesLoading(true);

        // Use the fetchTopicsWithCourses function from courseService
        const { topics: fetchedTopics, usingSampleData } =
          await fetchTopicsWithCourses();

        setTopics(fetchedTopics);
        setUsingSampleData(usingSampleData);
      } catch (error) {
        console.error("Error loading courses in MarkdownEditor:", error);
      } finally {
        setCoursesLoading(false);
      }
    }

    loadCoursesFromTopics();
  }, []);

  // Validate the form
  const validateForm = useCallback(() => {
    const errors = {};

    if (!title.trim()) {
      errors.title = "Title is required";
    }

    if (!courseId) {
      errors.courseId = "Please select a course";
    }

    if (
      !content.trim() ||
      content === "**Hello world!**\n\nStart writing your content here..."
    ) {
      errors.content = "Please add meaningful content to your post";
    }

    updateState({ formErrors: errors });
    return Object.keys(errors).length === 0;
  }, [title, courseId, content]);

  // Component mounted
  useEffect(() => {
    updateState({ mounted: true });
  }, []);

  // Authentication check with immediate redirection
  useEffect(() => {
    // Only check if auth has loaded
    if (isLoaded) {
      // If not signed in, redirect immediately
      if (!isSignedIn) {
        updateState({ authRedirecting: true });

        // Prepare redirect params
        const searchParams = new URLSearchParams();
        searchParams.set("authAlert", "You need to sign in to create content.");

        // Use a short timeout to allow state update before redirect
        setTimeout(() => {
          router.push(`/?${searchParams}`);
        }, 10);
      }
    }
  }, [isLoaded, isSignedIn, router]);

  // Validate form on field changes - only if user is authenticated
  useEffect(() => {
    if (isSignedIn) {
      validateForm();
    }
  }, [validateForm, isSignedIn]);

  // Generate preview from content function
  const generatePreview = (mdContent: string): string => {
    // Remove headers, code blocks and other markdown elements
    const cleanContent = mdContent
      .replace(/^#+ .*$/gm, '')         // Remove headers
      .replace(/```[\s\S]*?```/gm, '')  // Remove code blocks
      .replace(/\[.*\]\(.*\)/gm, '')    // Remove links
      .trim();
    
    // Find the first paragraph
    const firstParagraph = cleanContent.split(/\n\s*\n/)[0] || '';
    
    // If the paragraph is too long, truncate it
    if (firstParagraph.length > 150) {
      return firstParagraph.substring(0, 150).trim() + '...';
    }
    
    return firstParagraph;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    updateState({ isSubmitting: true });

    try {
      // Generate a preview from the content
      const preview = generatePreview(content);
      
      // Submit using the proper structure expected by the API
      const result = await createPost({
        course_id: parseInt(courseId),  // Convert string to number
        author_id: userId || 'guest-user', // Will be overridden by server with current user id
        title: title,
        preview_md: preview, // Use the generated preview
        content_md: content  // Full content
      });
      
      if (result.success) {
        // Show success notification
        toast({
          title: "Content submitted successfully!",
          description: "Your post has been created.",
          variant: "success"
        });
        
        // Redirect to view the new post if we have an ID, otherwise to courses page
        if (result.post?.id) {
            router.push(`/courses/${courseId}`);
        } else {
          router.push('/courses');
        }
      } else {
        // Show error notification
        toast({
          title: "Failed to submit content",
          description: result.error || "An unexpected error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error submitting content:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    } finally {
      updateState({ isSubmitting: false });
    }
  };

  // Editor color mode based on theme
  const editorColorMode = !mounted
    ? "light"
    : theme === "dark"
    ? "dark"
    : "light";

  // Show authentication redirect state
  if (authRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting to sign in...</p>
      </div>
    );
  }

  // Loading state for auth
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Prevent rendering the form completely if not signed in
  if (!isSignedIn) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>You need to be signed in to create content.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/")}>
              Return to Homepage
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Get all available courses from topics for flat display (alternative approach)
  const allCourses: Course[] = React.useMemo(() => {
    const courses: Course[] = [];
    topics.forEach((topic) => {
      topic.courses.forEach((course) => {
        courses.push(course);
      });
    });
    return courses;
  }, [topics]);

  // Only render form for authenticated users
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <span className="text-base sm:text-lg">Create New Content</span>
          </CardTitle>
        </div>
        <CardDescription>
          Share your knowledge with the community
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter a descriptive title"
              value={title}
              onChange={(e) => updateState({ title: e.target.value })}
              className={formErrors.title ? "border-red-500" : ""}
            />
            {formErrors.title && (
              <p className="text-sm text-red-500 dark:text-red-400">
                {formErrors.title}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <div className="relative">
              <select
                id="course"
                value={courseId}
                onChange={(e) => updateState({ courseId: e.target.value })}
                disabled={coursesLoading}
                className={`w-full rounded-md border px-3 py-2 text-sm appearance-none ${
                  formErrors.courseId
                    ? "border-red-500 focus:border-red-500"
                    : "border-input focus:border-primary"
                } bg-background focus:outline-none focus:ring-1 focus:ring-primary ${
                  coursesLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                }}
              >
                <option value="" disabled>
                  {coursesLoading ? "Loading courses..." : "Select a course"}
                </option>
                {topics.map((topic) => (
                  <optgroup
                    key={topic.id}
                    label={topic.name}
                    className="text-foreground"
                  >
                    {topic.courses.map((course) => (
                      <option
                        key={course.id}
                        value={course.id.toString()}
                        className="text-foreground bg-background"
                      >
                        {course.name || course.title || `Course ${course.id}`}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                {coursesLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
            {formErrors.courseId && (
              <p className="text-sm text-red-500 dark:text-red-400">
                {formErrors.courseId}
              </p>
            )}

            {usingSampleData && (
              <p className="text-xs text-amber-500 mt-1">
                Using sample course data - API unavailable
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Content</Label>
          <div className="flex border rounded-md overflow-hidden mb-4">
            <button
              type="button"
              onClick={() => updateState({ activeTab: "edit" })}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "edit"
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent hover:bg-muted"
              }`}
            >
              <svg
                className="h-3 w-3 sm:h-4 sm:w-4"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 7H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  d="m9 15 7.5-7.5M15 7h1a1 1 0 0 1 1 1v1"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              type="button"
              onClick={() => updateState({ activeTab: "preview" })}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "preview"
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent hover:bg-muted"
              }`}
            >
              <svg
                className="h-3 w-3 sm:h-4 sm:w-4"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>

          {activeTab === "edit" ? (
            <div className="flex flex-col">
              <div
                data-color-mode={editorColorMode}
                className={
                  formErrors.content
                    ? "border border-red-400 dark:border-red-600 rounded-md"
                    : ""
                }
              >
                <MDEditor
                  value={content}
                  onChange={(value) => updateState({ content: value || "" })}
                  height={400}
                  preview="edit"
                  className="border border-border rounded-md shadow-sm"
                  textareaProps={{
                    placeholder: "Write your markdown content here...",
                  }}
                />
              </div>
              {formErrors.content && (
                <p className="text-sm text-red-500 dark:text-red-400 mt-2">
                  {formErrors.content}
                </p>
              )}
            </div>
          ) : (
            <div
              className="border border-border rounded-md shadow-sm bg-background p-4 sm:p-6 min-h-[400px] overflow-auto"
              data-color-mode={editorColorMode}
            >
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
          disabled={
            isSubmitting || Object.keys(formErrors).length > 0 || coursesLoading
          }
          className="gap-2 w-full sm:w-2/3 md:w-1/2"
        >
          {isSubmitting ? (
            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
          ) : (
            <Send className="h-3 w-3 sm:h-4 sm:w-4" />
          )}
          <span className="text-sm sm:text-base">
            {isSubmitting ? "Submitting..." : "Submit Content"}
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ContentCreator;