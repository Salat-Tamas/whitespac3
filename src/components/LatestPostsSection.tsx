import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Clock } from 'lucide-react';

function LatestPostsSection() {
  return (
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
  )
}

export default LatestPostsSection
