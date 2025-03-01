import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Get auth data from Clerk
    const { userId } = auth();
    
    // If no authenticated user, return 401
    if (!userId) {
      return NextResponse.json(
        { message: "Authentication required to create content" },
        { status: 401 }
      );
    }

    // Parse request body
    const data = await req.json();
    
    // Verify that submitted authorId matches authenticated userId
    if (data.authorId !== userId) {
      console.warn("Author ID mismatch", { providedId: data.authorId, actualId: userId });
      // Update the authorId with the correct one from auth
      data.authorId = userId;
    }

    // Here you would typically save to your database
    // const result = await prisma.post.create({ data });
    
    // For now, just return success
    return NextResponse.json({ 
      success: true, 
      message: "Content saved successfully",
      data: { ...data, authorId: userId }
    });
  } catch (error) {
    console.error("API error saving content:", error);
    return NextResponse.json(
      { message: "Server error while saving content", error: error.message },
      { status: 500 }
    );
  }
}