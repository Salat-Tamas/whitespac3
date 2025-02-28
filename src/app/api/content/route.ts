import { NextResponse } from 'next/server';

// Configure your FastAPI endpoint
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  console.log("==== API ROUTE: POST /create_post CALLED ====");
  
  try {
    const data = await request.json();
    console.log("==== API ROUTE: REQUEST DATA RECEIVED ====");
    
    const { content } = data;
    console.log(`Content received with length: ${content?.length || 0}`);
    console.log(`Content preview: ${content?.substring(0, 50) || 'EMPTY'}...`);
    
    if (!content) {
      console.log("==== API ROUTE: NO CONTENT PROVIDED ====");
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }
    
    // Forward the request to FastAPI backend
    console.log("==== API ROUTE: FORWARDING TO FASTAPI BACKEND ====");
    console.log(`Sending request to: ${FASTAPI_URL}/api/content`);
    
    const fastApiResponse = await fetch(`${FASTAPI_URL}/api/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any authentication headers if needed
        // 'Authorization': `Bearer ${process.env.API_TOKEN}`
      },
      body: JSON.stringify({
        content,
        // Add any additional fields needed by your FastAPI endpoint
        timestamp: new Date().toISOString(),
        source: 'web-app',
      }),
    });
    
    // Check if the FastAPI request was successful
    if (!fastApiResponse.ok) {
      const errorData = await fastApiResponse.json().catch(() => ({}));
      console.error("==== API ROUTE: FASTAPI ERROR ====", {
        status: fastApiResponse.status,
        statusText: fastApiResponse.statusText,
        error: errorData
      });
      
      return NextResponse.json(
        { error: `FastAPI error: ${fastApiResponse.statusText}` },
        { status: fastApiResponse.status }
      );
    }
    
    // Parse the successful response from FastAPI
    const result = await fastApiResponse.json();
    console.log("==== API ROUTE: FASTAPI RESPONSE RECEIVED ====", result);
    
    // Return a success response
    console.log("==== API ROUTE: RETURNING SUCCESS RESPONSE ====");
    
    return NextResponse.json({ 
      success: true,
      message: "Content saved successfully",
      contentPreview: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
      // Forward any additional data from the FastAPI response
      ...result
    });
  } catch (error) {
    console.error("==== API ROUTE: ERROR PROCESSING REQUEST ====", error);
    return NextResponse.json(
      { error: "Failed to save content" },
      { status: 500 }
    );
  }
}