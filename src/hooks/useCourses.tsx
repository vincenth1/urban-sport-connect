
import { useState, useEffect } from 'react';
import { Course, SportType, BookedCourse, User } from '@/types';
import { useWeb3 } from '@/context/Web3Context';
import { toast } from '@/components/ui/use-toast';

// Mock data - in a real implementation, this would fetch from IPFS and interact with smart contracts
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Advanced Yoga Sessions',
    description: 'A 7-day intensive yoga program focused on advanced poses and meditation techniques.',
    price: '0.05 ETH',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1000',
    duration: 7,
    sportType: SportType.YOGA,
    trainer: '0xAbC...123',
    location: 'Central Park, New York',
    createdAt: Date.now()
  },
  {
    id: '2',
    title: 'Urban Running Experience',
    description: 'Explore the city while improving your endurance and running technique.',
    price: '0.03 ETH',
    image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?q=80&w=1000',
    duration: 5,
    sportType: SportType.RUNNING,
    trainer: '0xDeF...456',
    location: 'Downtown District',
    createdAt: Date.now()
  },
  {
    id: '3',
    title: 'Basketball Skills Workshop',
    description: 'Learn advanced basketball techniques from professional coaches.',
    price: '0.07 ETH',
    image: 'https://images.unsplash.com/photo-1546519638-68e109acd27d?q=80&w=1000',
    duration: 3,
    sportType: SportType.BASKETBALL,
    trainer: '0xGhI...789',
    location: 'Sports Complex',
    createdAt: Date.now()
  },
  {
    id: '4',
    title: 'Swimming Masterclass',
    description: 'Perfect your swimming technique with personalized coaching.',
    price: '0.04 ETH',
    image: 'https://images.unsplash.com/photo-1560090995-01632a28895b?q=80&w=1000',
    duration: 10,
    sportType: SportType.SWIMMING,
    trainer: '0xJkL...012',
    location: 'Aquatics Center',
    createdAt: Date.now()
  }
];

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

  // Book a course
  const bookCourse = async (courseId: string) => {
    if (!account) {
      toast({
        title: "Not Connected",
        description: "Please connect your wallet to book a course",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simulate blockchain transaction
      toast({
        title: "Processing",
        description: "Your booking is being processed...",
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const courseToBook = courses.find(c => c.id === courseId);
      
      if (!courseToBook) {
        throw new Error('Course not found');
      }
      
      const now = Date.now();
      const expirationTime = now + (courseToBook.duration * 24 * 60 * 60 * 1000); // Convert days to milliseconds
      
      const bookedCourse: BookedCourse = {
        ...courseToBook,
        bookedAt: now,
        expiresAt: expirationTime
      };
      
      setBookedCourses(prev => [...prev, bookedCourse]);
      
      toast({
        title: "Booking Successful",
        description: `You've successfully booked ${courseToBook.title}`,
      });
    } catch (error) {
      console.error('Failed to book course:', error);
      toast({
        title: "Booking Failed",
        description: "Failed to book the course. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Create a new course (for trainers)
  const createCourse = async (newCourse: Omit<Course, 'id' | 'createdAt' | 'trainer'>) => {
    if (!account) {
      toast({
        title: "Not Connected",
        description: "Please connect your wallet to create a course",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simulate blockchain transaction
      toast({
        title: "Processing",
        description: "Your course is being created...",
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const course: Course = {
        ...newCourse,
        id: Date.now().toString(),
        trainer: account,
        createdAt: Date.now()
      };
      
      setCourses(prev => [...prev, course]);
      
      toast({
        title: "Course Created",
        description: `${newCourse.title} has been created successfully`,
      });
      
      return course;
    } catch (error) {
      console.error('Failed to create course:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create the course. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Check if a course is expired
  const isCourseExpired = (course: BookedCourse) => {
    return Date.now() > course.expiresAt;
  };

  // Filter out expired courses
  const activeBookedCourses = bookedCourses.filter(course => !isCourseExpired(course));

  // Filter courses by type
  const filterCoursesByType = (type: SportType | 'all') => {
    if (type === 'all') {
      return courses;
    }
    return courses.filter(course => course.sportType === type);
  };

  return {
    courses,
    bookedCourses: activeBookedCourses,
    isLoading,
    bookCourse,
    createCourse,
    filterCoursesByType
  };
};
