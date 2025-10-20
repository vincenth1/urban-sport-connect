import { useState } from 'react';
import { Course } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { unrentItem } from '@/utils/contracts';
import { useWeb3 } from '@/context/Web3Context';

export const useUnsubscribeCourse = (onCourseUnsubscribed: (courseId: string) => void) => {
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const { removeBookedCourse } = useWeb3();

  const unsubscribeCourse = async (course: Course, account: string | null) => {
    if (!account) {
      toast({
        title: "Not Connected",
        description: "Please connect your wallet to unsubscribe from a course",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUnsubscribing(true);
      toast({ title: 'Processing', description: 'Confirm the transaction in MetaMask...' });

      await unrentItem(course.id, Number(course.tokenId || '1'));

      onCourseUnsubscribed(course.id);
      removeBookedCourse?.(course.id);

      toast({ title: 'Unsubscribed Successfully', description: `You've successfully unsubscribed from ${course.title}` });
    } catch (error) {
      console.error('Failed to unsubscribe from course:', error);
      toast({
        title: "Unsubscribe Failed",
        description: "Failed to unsubscribe from the course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUnsubscribing(false);
    }
  };

  return {
    unsubscribeCourse,
    isUnsubscribing
  };
};