import Link from 'next/link'
import DesktopNavbar from './DesktopNavbar'
import MobileNavbar from './MobileNavbar'
import { currentUser } from '@clerk/nextjs/server';
import { getCsrfToken } from '@/utils/csrf';

async function Navbar() {
    const user = await currentUser();
    const { id, imageUrl, username, emailAddresses } = user || {};
    const email = emailAddresses ? emailAddresses[0].emailAddress : '';

    if (user) {
      const sendUserData = async () => {
        try {
          const csrfToken = await getCsrfToken();
          // TO-DO: Replace api url
          const response = await fetch(`${process.env.FASTAPI_URL}/create_user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': csrfToken,
            },
            body: JSON.stringify({
              clerk_id: id,
              image_url: imageUrl,
              username: username,
              email: email
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to sync user data');
          }
        } catch (error) {
          console.error('Error syncing user data:', error);
        }
      };

      if (id) {
        sendUserData();
      }
    }
  
  return (
    <nav className="sticky top-0 w-full border-b bg-background/95 backdrop-blur 
    supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary font-mono tracking-wider">
              The Knowledge Library
            </Link>
          </div>

          <DesktopNavbar />
          <MobileNavbar />
        </div>
      </div>
    </nav>
  )
}

export default Navbar
