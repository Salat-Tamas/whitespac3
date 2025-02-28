import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { BookOpen, PlusCircle, Search } from 'lucide-react';
import { Input } from './ui/input';
import Link from 'next/link';
import { CourseLink } from './CourseLink';

const COURSES_DATA = {
  programming: [
    {
      title: 'Introduction to JavaScript',
      description: 'Learn the fundamentals of JavaScript programming, including variables, functions, and DOM manipulation.',
      id: 1
    },
    {
      title: 'Python Fundamentals',
      description: 'Master Python basics, data structures, and essential programming concepts.',
      id: 2
    },
    {
      title: 'React Advanced',
      description: 'Deep dive into React hooks, context, and advanced state management.',
      id: 3
    }
  ],
  dataScience: [
    {
      title: 'Machine Learning Basics',
      description: 'Introduction to machine learning algorithms and their practical applications.',
      id: 4
    },
    {
      title: 'Data Visualization',
      description: 'Learn to create impactful visualizations using modern tools and libraries.',
      id: 5
    },
    {
      title: 'Statistics 101',
      description: 'Essential statistical concepts for data analysis and interpretation.',
      id: 6
    }
  ],
  design: [
    {
      title: 'UI/UX Principles',
      description: 'Master the fundamentals of user interface and experience design.',
      id: 7
    },
    {
      title: 'Design Systems',
      description: 'Learn to create and maintain scalable design systems.',
      id: 8
    }
  ]
};

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
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Programming</h3>
                        <div className="space-y-1">
                            {COURSES_DATA.programming.map((course) => (
                                <CourseLink
                                    key={course.id}
                                    href={`/courses/${course.id}`}
                                    title={course.title}
                                    description={course.description}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Data Science</h3>
                        <div className="space-y-1">
                            {COURSES_DATA.dataScience.map((course) => (
                                <CourseLink
                                    key={course.id}
                                    href={`/courses/${course.id}`}
                                    title={course.title}
                                    description={course.description}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Design</h3>
                        <div className="space-y-1">
                            {COURSES_DATA.design.map((course) => (
                                <CourseLink
                                    key={course.id}
                                    href={`/courses/${course.id}`}
                                    title={course.title}
                                    description={course.description}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <Link href="/courses" className="flex items-center justify-center mt-6 text-sm text-primary hover:underline">
                    View all courses
                </Link>
            </CardContent>
        </Card>
    );
}

export default CoursesSection
