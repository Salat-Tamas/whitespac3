import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
    console.log('Signin callback');
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_URL));
    }

    const response = await fetch(`${process.env.FASTAPI_URL}/create_user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'csrf-token': process.env.SECRET_KEY || '',
      },
      body: JSON.stringify({
        id: userId,
        imageUrl: user.imageUrl,
        userName: user.username ?? 'userName',
        email: user.emailAddresses[0]?.emailAddress,
        name: ((user.firstName ?? '') + (user.lastName ?? '')).trim() || 
              user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'user'
      }),
    });
    console.log('Response:', response);

    if (!response.ok && response.status !== 400) {
      console.error('Failed to create user');
    }

    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_URL));
  } catch (error) {
    console.error('Error in signin callback:', error);
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_URL));
  }
}
