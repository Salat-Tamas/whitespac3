import { auth, currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('Sign in/up callback');
  
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_URL));
    }

    const userData = {
      id: userId,
      imageUrl: user.imageUrl,
      userName: ((user.firstName ?? '') + (user.lastName ?? '')).trim() ||
        user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'user',
      email: user.emailAddresses[0]?.emailAddress,
      name: ((user.firstName ?? '') + (user.lastName ?? '')).trim() ||
        user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'user'
    };
    console.log('Sending user data:', userData);
    console.log('URL: ' + `${process.env.NEXT_PUBLIC_FASTAPI_URL}/create_user`);
    console.log('Lofasz ' + process.env.NEXT_PUBLIC_CSRF_TOKEN)

    const response = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/create_user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'csrf-token': process.env.NEXT_PUBLIC_CSRF_TOKEN || 'lofasz',
      },
      body: JSON.stringify(userData),
    });
    console.log('Response:', response);

  } catch (error) {
    console.error('Error in signin callback:', error);
    }
    finally {
    revalidatePath('/');
    const response = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_URL));
    return response; // Return the response object instead of creating a new redirect
  }
  
}
