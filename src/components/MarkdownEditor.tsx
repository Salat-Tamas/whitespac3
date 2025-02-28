'use client';

import MDEditor from '@uiw/react-md-editor';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveContent } from '@/services/contentService';

export default function MarkdownEditor() {
  const [value, setValue] = useState<string | undefined>("**Hello world!!!**");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isContentEmpty, setIsContentEmpty] = useState(false);
  const router = useRouter();

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

  return (
    <div className="w-full max-w-4xl mx-auto" data-color-mode="light">
      <div className="mb-4 w-full flex">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || isContentEmpty}
          className="w-full px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {isSubmitting ? "Submitting..." : "Submit Content"}
        </button>
      </div>
      <MDEditor
        value={value}
        onChange={setValue}
        height={400}
        className="shadow-lg rounded-lg"
      />
      <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
        <MDEditor.Markdown source={value} />
      </div>
    </div>
  );
}