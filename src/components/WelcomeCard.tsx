import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from './ui/button';


function WelcomeCard() {
  return (
    <Card>
          <CardHeader>
            <CardTitle>Welcome to <p className="font-bold font-mono inline text-lg pl-2">The Knowledge Vault</p></CardTitle>
            <CardDescription>Your educational journey begins here</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Explore courses, connect with fellow learners, and track your progress all in one place. 
              Use the AI Assistant to get help with your studies.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/posts/create">
              <Button>Create a Post</Button>
            </Link>
          </CardFooter>
        </Card>
  )
}

export default WelcomeCard
