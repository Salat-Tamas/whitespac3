import { NextResponse } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

// This is the correct way to export the middleware
export default clerkMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: [
    "/",
    "/courses", 
    "/courses/:path*", 
    "/posts/:id", 
    "/api/webhook"
  ],
  
  // Handle custom redirect for post creation page
  afterAuth(auth, req) {
    // Get the pathname from the URL
    const url = new URL(req.url);
    
    // If user is trying to access post creation but isn't authenticated
    if (url.pathname === '/posts/create' && !auth.userId) {
      // Create search params with an auth alert message
      const searchParams = new URLSearchParams(url.searchParams);
      searchParams.set('authAlert', 'You need to sign in to create content.');
      
      // Redirect to home page with the alert parameter
      return NextResponse.redirect(
        new URL(`/?${searchParams}`, req.url)
      );
    }
    
    // For all other routes, use Clerk's default handling
    return NextResponse.next();
  },
});

// This matcher configuration is essential - it must match ALL routes
// where Clerk's auth() function is used, including the home page
export const config = {
  matcher: [
    // Match ALL pages where the auth() function might be used
    "/((?!.+\\.[\\w]+$|_next).*)", 
    "/",
    // You can add more specific routes too
    "/posts/create"
  ],
};