'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BookOpen, MessageSquare, TrendingUp, Clock, Send, PlusCircle, Search } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';

export default function HomePage() {
  const [chatMessage, setChatMessage] = useState('');
  const [showFullChat, setShowFullChat] = useState(false);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column - Course Listings */}
      <div className="lg:col-span-3 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>My Courses</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>Continue where you left off</CardDescription>
          </CardHeader>
          <CardContent className="pb-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search courses..." className="pl-8" />
            </div>
          </CardContent>
          <CardContent>
            <div className="space-y-4">
              {/* Course categories - adjust styling based on your theme */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Programming</h3>
                <div className="space-y-1">
                  {['Introduction to JavaScript', 'Python Fundamentals', 'React Advanced'].map((course, i) => (
                    <Link 
                      href={`/courses/${i+1}`} 
                      key={i}
                      className="flex items-center p-2 rounded-md hover:bg-accent text-sm transition-colors"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span>{course}</span>
                    </Link>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Data Science</h3>
                <div className="space-y-1">
                  {['Machine Learning Basics', 'Data Visualization', 'Statistics 101'].map((course, i) => (
                    <Link 
                      href={`/courses/${i+4}`} 
                      key={i}
                      className="flex items-center p-2 rounded-md hover:bg-accent text-sm transition-colors"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span>{course}</span>
                    </Link>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Design</h3>
                <div className="space-y-1">
                  {['UI/UX Principles', 'Design Systems'].map((course, i) => (
                    <Link 
                      href={`/courses/${i+7}`} 
                      key={i}
                      className="flex items-center p-2 rounded-md hover:bg-accent text-sm transition-colors"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span>{course}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            
            <Link href="/courses" className="flex items-center justify-center mt-6 text-sm text-primary hover:underline">
              View all courses
            </Link>
          </CardContent>
        </Card>
      </div>
      
      {/* Middle Column - Content Feed */}
      <div className="lg:col-span-6 space-y-6">
        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Whitespac3 Learning</CardTitle>
            <CardDescription>Your educational journey begins here</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Explore courses, connect with fellow learners, and track your progress all in one place. 
              Use the AI Assistant to get help with your studies.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/create">
              <Button>Create Content</Button>
            </Link>
          </CardFooter>
        </Card>
        
        {/* Trending Now Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Trending Now
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "Understanding React Hooks",
                  content: "**React Hooks** are a game-changer for functional components...",
                  author: "Jane Smith",
                  course: "React Advanced",
                  likes: 42
                },
                {
                  title: "Python vs JavaScript: When to use each",
                  content: "Comparing two popular languages and their use cases...",
                  author: "Alex Johnson",
                  course: "Programming Fundamentals",
                  likes: 38
                }
              ].map((post, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-base">{post.title}</CardTitle>
                        <CardDescription>{post.author} in {post.course}</CardDescription>
                      </div>
                      <div className="flex items-center text-muted-foreground text-sm">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {post.likes}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="max-h-24 overflow-hidden" data-color-mode="light">
                      <MDEditor.Markdown source={post.content} />
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Link href={`/posts/${i+1}`} className="text-primary text-sm hover:underline">
                      Read more
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Latest Content */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Latest Content
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "Introduction to Data Visualization",
                  content: "Learn how to create compelling visualizations with Python and Matplotlib...",
                  author: "Sam Wilson",
                  course: "Data Visualization",
                  time: "2 hours ago"
                },
                {
                  title: "Building Your First React Component",
                  content: "Step-by-step guide to creating reusable React components...",
                  author: "Emily Chen",
                  course: "React Advanced",
                  time: "1 day ago"
                }
              ].map((post, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-base">{post.title}</CardTitle>
                        <CardDescription>{post.author} in {post.course}</CardDescription>
                      </div>
                      <div className="flex items-center text-muted-foreground text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        {post.time}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="line-clamp-2 text-muted-foreground">{post.content}</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Link href={`/posts/${i+3}`} className="text-primary text-sm hover:underline">
                      Read more
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/posts" className="text-sm text-primary hover:underline">
              View all posts
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      {/* Right Column - AI Assistant */}
      <div className="lg:col-span-3 space-y-6">
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
      </div>
    </div>
  );
}