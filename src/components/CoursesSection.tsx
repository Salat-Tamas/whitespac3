'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { BookOpen, PlusCircle, Search, Loader2, AlertTriangle } from 'lucide-react';
import { Input } from './ui/input';
import Link from 'next/link';
import { CourseLink } from './CourseLink';
import { fetchTopicsWithCourses, Topic } from '@/services/courseService';

export function CoursesSection() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [apiAttempted, setApiAttempted] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoading(true);
        setApiAttempted(true);
        
        const { topics: fetchedTopics, error: fetchError, usingSampleData: usingSample } = 
          await fetchTopicsWithCourses();
        
        setTopics(fetchedTopics);
        setError(fetchError);
        setUsingSampleData(usingSample);
      } catch (err) {
        console.error('Unexpected error in CoursesSection:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, []);

  // Filter courses based on search query
  const filteredTopics = topics.map(topic => ({
    ...topic,
    courses: topic.courses.filter(course => 
      course.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(topic => topic.courses.length > 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>My Courses</CardTitle>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Continue where you left off
          {usingSampleData && apiAttempted && (
            <span className="ml-2 text-xs text-amber-500 font-medium">
              (Using sample data - API unavailable)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-1">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search courses..." 
            className="pl-8" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardContent>
      
      {usingSampleData && apiAttempted && (
        <CardContent className="pt-0 pb-1">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 
                        dark:border-amber-800 text-amber-800 dark:text-amber-200 
                        rounded-md p-3 text-sm flex items-start">
            <AlertTriangle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              Unable to connect to <code className="bg-amber-100 dark:bg-amber-900/40 px-1 
                                                 py-0.5 rounded">fokakefir.go.ro</code>. 
              Displaying sample course data for development purposes.
            </div>
          </div>
        </CardContent>
      )}
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Loading courses...</span>
          </div>
        ) : error && !usingSampleData ? (
          <div className="py-6 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTopics.length === 0 && searchQuery ? (
              <p className="text-center py-4 text-sm text-muted-foreground">
                No courses match your search
              </p>
            ) : (
              filteredTopics.map((topic) => (
                <div key={topic.id} className="mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    {topic.name}
                  </h3>
                  <div className="space-y-1">
                    {topic.courses.map((course) => (
                      <CourseLink
                        key={course.id}
                        href={`/courses/${course.id}`}
                        title={course.name || ''}
                        description={course.description || "No description available"}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}

            {topics.length > 0 && (
              <Link href="/courses" className="flex items-center justify-center mt-6 text-sm text-primary hover:underline">
                <BookOpen className="h-4 w-4 mr-1" />
                View all courses
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CoursesSection;