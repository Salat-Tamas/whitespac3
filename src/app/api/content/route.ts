import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log("==== API ROUTE: POST /api/content CALLED ====");
  
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
    
    // Here you would normally save to a database
    console.log("==== API ROUTE: CONTENT VALIDATED ====");
    
    // Return a success response
    console.log("==== API ROUTE: RETURNING SUCCESS RESPONSE ====");
    
    return NextResponse.json({ 
      success: true,
      message: "Content saved successfully",
      contentPreview: content.substring(0, 50) + (content.length > 50 ? '...' : '')
    });
  } catch (error) {
    console.error("==== API ROUTE: ERROR PROCESSING REQUEST ====", error);
    return NextResponse.json(
      { error: "Failed to save content" },
      { status: 500 }
    );
  }
}