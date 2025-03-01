export async function saveContent(data: {
  title: string;
  courseId: number;
  content: string | undefined;
  authorId: string | null | undefined;
}) {
  // Enhanced validation with better error messages
  if (!data.title) {
    throw new Error('Title is required');
  }
  
  if (!data.courseId) {
    throw new Error('Course selection is required');
  }
  
  if (!data.content) {
    throw new Error('Content cannot be empty');
  }
  
  if (!data.authorId) {
    throw new Error('Authentication required: No user ID found');
  }

  try {
    // Add auth headers and explicitly include authorId
    const response = await fetch('/api/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: data.title,
        courseId: data.courseId,
        content: data.content,
        authorId: data.authorId,
        createdAt: new Date().toISOString(),
      }),
      // This ensures credentials like cookies are sent with the request
      credentials: 'same-origin'
    });

    if (!response.ok) {
      // Try to get detailed error message from response
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to save content: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving content:', error);
    throw error;
  }
}