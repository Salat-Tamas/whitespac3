export async function getCsrfToken() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_CSRF_TOKEN}`, {
      credentials: 'include', // Important for cookies
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }
    
    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
}
