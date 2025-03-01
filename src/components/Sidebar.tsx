import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { Button } from './ui/button';

async function Sidebar() {
  // const user = await currentUser();
    return (
        <div className="sticky top-20">
          <Card>
           Classes
          </Card>
        </div>
      );

}