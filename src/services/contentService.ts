export async function saveContent(content: string) {
  // More visible logging with clear markers
  console.log("==== CONTENT SERVICE: SAVE CONTENT CALLED ====");
  console.log(`Content length: ${content.length}`);
  console.log(`Content preview: ${content.substring(0, 50)}...`);
  
  try {
    // Log before fetch
    console.log("==== CONTENT SERVICE: SENDING FETCH REQUEST ====");
    
    const response = await fetch('/api/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    // Log after fetch
    console.log("==== CONTENT SERVICE: FETCH RESPONSE RECEIVED ====");
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      throw new Error(`Failed to save content: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("==== CONTENT SERVICE: RESPONSE DATA ====");
    console.log(result);
    
    return result;
  } catch (error) {
    console.error("==== CONTENT SERVICE: ERROR ====");
    console.error(error);
    throw error;
  }
}