import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { BookOpen, PlusCircle, Search } from 'lucide-react';
import { Input } from './ui/input';
import Link from 'next/link';


export function CoursesSection() {
  return (
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
  )
}

export default CoursesSection
