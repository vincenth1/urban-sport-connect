
import { useState, useEffect } from 'react';
import { Course, SportType, BookedCourse } from '@/types';
import { useWeb3 } from '@/context/Web3Context';
import { toast } from '@/components/ui/use-toast';
import { mockCourses } from '@/data/mockCourses';
import { filterExpiredCourses } from '@/utils/courseUtils';
import { useBookCourse } from '@/hooks/useBookCourse';
import { useCreateCourse } from '@/hooks/useCreateCourse';

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [bookedCourses, setBookedCourses] = useState<BookedCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, account } = useWeb3();

  // Fetch all available courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real implementation, this would fetch courses from the blockchain & IPFS
        setCourses(mockCourses);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Failed to load courses",
          variant: "destructive",
        });
      }
    };

    fetchCourses();
  }, []);

  // Fetch booked courses for connected user
  useEffect(() => {
    if (account) {
      const fetchBookedCourses = async () => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // In a real implementation, this would fetch booked courses from the blockchain
          if (user?.bookedCourses) {
            setBookedCourses(user.bookedCourses);
          } else {
            setBookedCourses([]);
          }
        } catch (error) {
          console.error('Failed to fetch booked courses:', error);
          toast({
            title: "Error",
            description: "Failed to load your booked courses",
            variant: "destructive",
          });
        }
      };

      fetchBookedCourses();
    }
  }, [account, user]);

  // Handle booking a course
  const handleCourseBooked = (bookedCourse: BookedCourse) => {
    setBookedCourses(prev => [...prev, bookedCourse]);
  };

  // Hook for booking courses
  const { bookCourse } = useBookCourse(handleCourseBooked);

  // Handle creating a course
  const handleCourseCreated = (newCourse: Course) => {
    setCourses(prev => [...prev, newCourse]);
  };

  // Hook for creating courses
  const { createCourse } = useCreateCourse(handleCourseCreated);

  // Filter courses by type
  const filterCoursesByType = (type: SportType | 'all') => {
    if (type === 'all') {
      return courses;
    }
    return courses.filter(course => course.sportType === type);
  };

  // Get active booked courses (not expired)
  const activeBookedCourses = filterExpiredCourses(bookedCourses);

  return {
    courses,
    bookedCourses: activeBookedCourses,
    isLoading,
    bookCourse: (courseId: string) => {
      const courseToBook = courses.find(c => c.id === courseId);
      if (courseToBook) {
        bookCourse(courseToBook, account);
      }
    },
    createCourse: (newCourse: Omit<Course, 'id' | 'createdAt' | 'trainer'>) => {
      return createCourse(newCourse, account);
    },
    filterCoursesByType
  };
};
