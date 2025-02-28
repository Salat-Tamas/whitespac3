import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Send } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

function AiSection() {
    const [showFullChat, setShowFullChat] = useState(false);
    const [chatMessage, setChatMessage] = useState('');


  return (
    <Card className="h-[calc(100vh-8rem)] flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                AI Assistant
              </CardTitle>
            </div>
            <CardDescription>Get help with your studies</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow overflow-auto">
            <div className="space-y-4">
              <div className="flex">
                <div className="bg-primary h-8 w-8 rounded-full flex items-center justify-center text-primary-foreground font-bold mr-2">
                  AI
                </div>
                <div className="bg-muted p-3 rounded-lg rounded-tl-none max-w-[80%]">
                  <p className="text-sm">Hello! How can I help with your learning today?</p>
                </div>
              </div>
              
              {showFullChat && (
                <>
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground p-3 rounded-lg rounded-tr-none max-w-[80%]">
                      <p className="text-sm">I'm struggling with React Hooks. Can you explain useEffect?</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="bg-primary h-8 w-8 rounded-full flex items-center justify-center text-primary-foreground font-bold mr-2">
                      AI
                    </div>
                    <div className="bg-muted p-3 rounded-lg rounded-tl-none max-w-[80%]">
                      <p className="text-sm">
                        The useEffect hook lets you perform side effects in function components. 
                        It serves a similar purpose to componentDidMount, componentDidUpdate, and componentWillUnmount in class components.
                      </p>
                      <p className="text-sm mt-2">
                        Basic syntax:
                      </p>
                      <pre className="bg-background p-2 rounded text-xs mt-1 overflow-x-auto">
                        {`useEffect(() => {
  // Side effect code
  return () => {
    // Cleanup function (optional)
  };
}, [dependencies]);`}
                      </pre>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-3">
            <div className="flex w-full gap-2">
              <Input 
                placeholder="Ask anything..." 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-grow"
              />
              <Button size="icon" onClick={() => setShowFullChat(true)}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
  )
}

export default AiSection
