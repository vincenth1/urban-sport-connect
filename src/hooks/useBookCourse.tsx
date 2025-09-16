
import { useState } from 'react';
import { Course, BookedCourse } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { rentItemForWindow } from '@/utils/contracts';
import { useWeb3 } from '@/context/Web3Context';

export const useBookCourse = (onCourseBooked: (course: BookedCourse) => void) => {
  const [isBooking, setIsBooking] = useState(false);
  const { appendBookedCourse } = useWeb3();

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
      toast({ title: 'Processing', description: 'Confirm the transaction in MetaMask...' });
      // Use course.timeEnd if available; otherwise fallback to a short window
      const endMs = course.timeEnd ? Date.parse(course.timeEnd) : (Date.now() + 5 * 60 * 1000);
      const expiresMs = await rentItemForWindow(course.id, Number(course.tokenId || '1'), course.price, endMs);
      const now = Date.now();
      const bookedCourse: BookedCourse = {
        ...course,
        bookedAt: now,
        expiresAt: expiresMs
      };
      onCourseBooked(bookedCourse);
      appendBookedCourse?.(bookedCourse);
      toast({ title: 'Booking Successful', description: `You've successfully booked ${course.title}` });
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
