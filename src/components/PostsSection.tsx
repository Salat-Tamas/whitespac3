import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';

function PostsSection() {
  return (
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
  )
}

export default PostsSection
