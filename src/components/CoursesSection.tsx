'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { PlusCircle, Search } from 'lucide-react';
import { Input } from './ui/input';
import Link from 'next/link';
import { CourseLink } from './CourseLink';
import { CreateCourseModal } from './CreateCourseModal';
import { useEffect, useState } from 'react';
import { getCoursesWithTopics } from '@/app/actions/courses';
import { Topic } from '@/types/course';

// GET request to fetch trending now posts with likes
// GET request to fetch favorite courses, courses

// When user clicks a course, they are redirected to the course page, where they can select
// to view the latest, the trending posts in that course or random posts

// A post has a preview section (this has: `title`, `author` - in - `course name`, `description`).
// On click, the post appears in a new tab, with the full content, comments? 


export function CoursesSection() {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [favorites, setFavorites] = useState<number[]>([]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const coursesData = await getCoursesWithTopics();
                setTopics(coursesData);
            } catch (error) {
                console.error('Error in fetchCourses:', error);
            }
        };

        fetchCourses();
    }, []);

    const handleCreateCourse = async (course: { name: string; description: string; topic_id: number }) => {
        try {
            console.log('Creating course:', course);
            console.log(process.env.NEXT_PUBLIC_FASTAPI_URL);
            const response = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/create_course`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'csrf-token': process.env.NEXT_PUBLIC_CSRF_TOKEN || '',
                },
                body: JSON.stringify(course),
            });
            console.log('Response:', response);
            if (!response.ok) {
                throw new Error('Failed to create course');
            }

            const newCourse = await response.json();
            
            // Update the topics state with the new course
            setTopics(prevTopics => 
                prevTopics.map(topic => 
                    topic.id === course.topic_id
                        ? { 
                            ...topic, 
                            courses: [...topic.courses, newCourse]
                          }
                        : topic
                )
            );

        } catch (error) {
            console.error('Error creating course:', error);
            alert('Failed to create course');
        }
    };

    const handleToggleFavorite = (courseId: number) => {
        setFavorites(prev => {
            if (prev.includes(courseId)) {
                return prev.filter(id => id !== courseId);
            }
            return [...prev, courseId];
        });
        // TODO: Add API call to sync favorites
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
                    {topics.map((topic) => (
                        <div key={topic.id}>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">
                                {topic.name}
                            </h3>
                            <div className="space-y-1">
                                {topic.courses.map((course) => (
                                    <CourseLink
                                        key={course.id}
                                        href={`/courses/${course.id}`}
                                        title={course.name}
                                        description={course.description}
                                        isFavorite={favorites.includes(course.id)}
                                        onToggleFavorite={() => handleToggleFavorite(course.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <Link href="/courses" className="flex items-center justify-center mt-6 text-sm text-primary hover:underline">
                    View all courses
                </Link>
            </CardContent>
            <CreateCourseModal 
                open={isModalOpen}
                setOpen={setIsModalOpen}
                onCourseCreate={handleCreateCourse}  // Passed here as a prop
                topics={topics}
            />
        </Card>
    );
}

export default CoursesSection
