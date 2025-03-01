'use server'

export async function getCoursesWithTopics() {
    try {
        console.log('Courses...');
        const secretKey = process.env.NEXT_PUBLIC_CSRF_TOKEN || '';
        const courses = await fetch(process.env.NEXT_PUBLIC_FASTAPI_URL + '/topics_with_courses', {
            headers: {
                'csrf-token': secretKey
            },
            cache: 'no-store'  // This ensures fresh data on each request
        });
        
        if (!courses.ok) {
            throw new Error('Failed to fetch courses');
        }

        const data = await courses.json();
        console.log('Courses data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching courses:', error);
        throw error;
    }
}