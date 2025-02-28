'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MDEditor from '@uiw/react-md-editor';
import { saveContent } from '@/services/contentService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, FileText, Moon, Sun } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from 'next-themes';

export default function MarkdownEditor() {
  const [value, setValue] = useState<string | undefined>("**Hello world!**\n\nStart writing your content here...");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isContentEmpty, setIsContentEmpty] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();

  // Mark component as mounted to avoid hydration mismatch with theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if content is empty whenever value changes
  useEffect(() => {
    setIsContentEmpty(!value?.trim());
  }, [value]);

  const handleSubmit = async () => {
    if (!value?.trim()) {
      alert("Please add some content before submitting");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("==== MARKDOWN EDITOR: SUBMITTING CONTENT ====");
      console.log("Submitting content with length:", value.length);
      console.log("Content preview:", value.substring(0, 100) + (value.length > 100 ? '...' : ''));
      
      // Save content to database
      console.log("==== MARKDOWN EDITOR: CALLING saveContent() ====");
      const result = await saveContent(value);
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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span className="text-base sm:text-lg">Markdown Editor</span>
            </CardTitle>
          </div>
          <CardDescription>Create and format your content</CardDescription>
        </CardHeader>
        
        <CardContent>
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
              <div data-color-mode={editorColorMode}>
                <MDEditor
                  value={value}
                  onChange={setValue}
                  height={400}
                  preview="edit"
                  className="border border-border rounded-md shadow-sm"
                  textareaProps={{
                    placeholder: "Write your markdown content here...",
                  }}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="preview">
              <div className="border border-border rounded-md shadow-sm bg-background p-4 sm:p-6 min-h-[400px] overflow-auto" 
                   data-color-mode={editorColorMode}>
                <MDEditor.Markdown 
                  source={value} 
                  className="prose dark:prose-invert max-w-none prose-sm sm:prose-base"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="border-t pt-4 flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isContentEmpty}
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