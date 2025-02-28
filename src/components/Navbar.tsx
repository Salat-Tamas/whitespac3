import Link from 'next/link'
import DesktopNavbar from './DesktopNavbar'
import MobileNavbar from './MobileNavbar'
import { currentUser } from '@clerk/nextjs/server';

async function Navbar() {
    const user = await currentUser();
    const { id, imageUrl, username, emailAddresses, firstName, lastName } = user || {};
    const email = emailAddresses ? emailAddresses[0].emailAddress : '';
    const defaultName = email ? email.split('@')[0] : '';

    if (user) {
      const sendUserData = async () => {
        try {
          console.log('Syncing user data...');
          
          const apiUrl = process.env.FASTAPI_URL;
          const secretKey = process.env.SECRET_KEY || '';

          if (!apiUrl) {
            throw new Error('FASTAPI_URL is not configured');
          }

            const response = await fetch(`${apiUrl}/create_user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'csrf-token': secretKey,
            },
            body: JSON.stringify({
              id: id,
              imageUrl: imageUrl,
              userName: username ?? 'userName',
              email: email,
              name: ((firstName ?? '') + (lastName ?? '')).trim() || defaultName
            }),
            });

          if(response.status === 400){
            console.error("User already exists");
          }
          // console.log(response.status);
          // console.log({
          //   id: id,
          //   imageUrl: imageUrl,
          //   userName: username,
          //   email: email,
          //   name: ((firstName ?? '') + (lastName ?? '')).trim() || defaultName
          // });

          if (!response.ok) {
            console.log('response: ' + JSON.stringify(response));
            // throw new Error('Failed to sync user data');
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
              The Knowledge Vault
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
