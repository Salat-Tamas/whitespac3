'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { BookOpen, PlusCircle, Search, Loader2, AlertTriangle } from 'lucide-react';
import { Input } from './ui/input';
import Link from 'next/link';
import { CourseLink } from './CourseLink';
import { CreateCourseModal } from './CreateCourseModal';
import { useAuth } from '@clerk/nextjs';

// GET request to fetch trending now posts with likes
// GET request to fetch favorite courses, courses

// When user clicks a course, they are redirected to the course page, where they can select
// to view the latest, the trending posts in that course or random posts

// A post has a preview section (this has: `title`, `author` - in - `course name`, `description`).
// On click, the post appears in a new tab, with the full content, comments? 

import { fetchTopicsWithCourses } from '@/services/courseService';
import { Course, Topic } from '@/types/course';
import toast from 'react-hot-toast';

export function CoursesSection() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [apiAttempted, setApiAttempted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { userId } = useAuth();
  const [favoritesList, setFavoritesList] = useState<Course[]>([]);


  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoading(true);
        setApiAttempted(true);
        
        const { topics: fetchedTopics, error: fetchError, usingSampleData: usingSample } = 
          await fetchTopicsWithCourses();
        
        const normalizedTopics = fetchedTopics.map(topic => ({
          ...topic,
          name: topic.name || '',
          courses: topic.courses.map(course => ({
            ...course,
            name: course.name || '',
            description: course.description || '',
            isFavorite: course.is_favorite
          }))
        }));

        // Extract favorite courses
        const favorites = normalizedTopics
          .flatMap(topic => topic.courses)
          .filter(course => course.is_favorite);
        
        setTopics(normalizedTopics);
        setFavoritesList(favorites);
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

  const handleCreateCourse = async (course: { name: string; description: string; topic_id: number }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/create_course`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'csrf-token': process.env.NEXT_PUBLIC_CSRF_TOKEN || '',
        },
        body: JSON.stringify(course),
      });

      if (!response.ok) {
        throw new Error('Failed to create course');
      }

      const newCourse = await response.json();
      
      // Update the topics state with the new course
      setTopics(prevTopics => 
        prevTopics.map(topic => 
          topic.id === course.topic_id
            ? { ...topic, courses: [...topic.courses, newCourse] }
            : topic
        )
      );
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course');
    }
  };

const handleToggleFavorite = async (courseId: number) => {
    try {
        // Find the current course to check its favorite status
        const currentCourse = topics.flatMap(topic => topic.courses).find(course => course.id === courseId);
        
        const url = currentCourse?.is_favorite 
            ? `${process.env.NEXT_PUBLIC_FASTAPI_URL}/remove_favorite_course?course_id=${courseId}`
            : `${process.env.NEXT_PUBLIC_FASTAPI_URL}/add_favorite_course?course_id=${courseId}`;

        const response = await fetch(url, {
            method: currentCourse?.is_favorite ? 'DELETE' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'csrf-token': process.env.NEXT_PUBLIC_CSRF_TOKEN || '',
                'user-id': userId || ''
            },
            mode: 'cors',
        });

        console.log('Request:', {
            url,
            method: currentCourse?.is_favorite ? 'DELETE' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'csrf-token': process.env.NEXT_PUBLIC_CSRF_TOKEN || '',
                'user-id': userId || ''
            }
        });
        console.log('Response:', response);

        if (response.ok) {
            // Find the course that was toggled
            const toggledCourse = topics
              .flatMap(topic => topic.courses)
              .find(course => course.id === courseId);

            if (toggledCourse) {
              // Update topics state
              setTopics(prevTopics => 
                prevTopics.map(topic => ({
                  ...topic,
                  courses: topic.courses.map(course => 
                    course.id === courseId 
                      ? { ...course, is_favorite: !course.is_favorite }
                      : course
                  )
                }))
              );

              // Update favorites list
              setFavoritesList(prev => {
                if (toggledCourse.is_favorite) {
                  // Remove from favorites
                  return prev.filter(course => course.id !== courseId);
                } else {
                  // Add to favorites
                  return [...prev, { ...toggledCourse, is_favorite: true }];
                }
              });
            }
            
            toast.success('Course favorite status updated!', { position: 'top-center' });
        } else {
            throw new Error('Failed to update favorite status');
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        toast.error('Failed to update favorite status', { position: 'top-center' });
    }
};

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>My Courses</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => setIsModalOpen(true)}
          >
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
          <div className="space-y-8">
            {/* Favorites Section */}
            {favoritesList.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-yellow-500 dark:text-yellow-400 mb-2">
                  Favorites
                </h3>
                <div className="space-y-1 mb-6">
                  {favoritesList.map((course) => (
                    <CourseLink
                      key={course.id}
                      href={`/courses/${course.id}`}
                      title={course.name}
                      description={course.description}
                      isFavorite={true}
                      onToggleFavorite={() => handleToggleFavorite(course.id)}
                    />
                  ))}
                </div>
                <div className="border-t border-border my-4" />
              </div>
            )}

            {/* Regular Topics Section */}
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
                          isFavorite={course.is_favorite}
                          onToggleFavorite={() => handleToggleFavorite(course.id)}
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
          </div>
        )}
      </CardContent>

      <CreateCourseModal 
        open={isModalOpen}
        setOpen={setIsModalOpen}
        onCourseCreate={handleCreateCourse}
        topics={topics}
      />
    </Card>
  );
}

export default CoursesSection;