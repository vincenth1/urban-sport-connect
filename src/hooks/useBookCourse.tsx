
import { useState } from 'react';
import { Course, BookedCourse } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { calculateExpirationTime } from '@/utils/courseUtils';

export const useBookCourse = (onCourseBooked: (course: BookedCourse) => void) => {
  const [isBooking, setIsBooking] = useState(false);

  const bookCourse = async (course: Course, account: string | null) => {
    if (!account) {
      toast({
        title: "Not Connected",
        description: "Please connect your wallet to book a course",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsBooking(true);
      // Simulate blockchain transaction
      toast({
        title: "Processing",
        description: "Your booking is being processed...",
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (!course) {
        throw new Error('Course not found');
      }
      
      const now = Date.now();
      const expirationTime = calculateExpirationTime(course.duration);
      
      const bookedCourse: BookedCourse = {
        ...course,
        bookedAt: now,
        expiresAt: expirationTime
      };
      
      onCourseBooked(bookedCourse);
      
      toast({
        title: "Booking Successful",
        description: `You've successfully booked ${course.title}`,
      });
    } catch (error) {
      console.error('Failed to book course:', error);
      toast({
        title: "Booking Failed",
        description: "Failed to book the course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  return {
    bookCourse,
    isBooking
  };
};
