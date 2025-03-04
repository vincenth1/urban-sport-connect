
import { useState } from 'react';
import { Course } from '@/types';
import { toast } from '@/components/ui/use-toast';

export const useCreateCourse = (onCourseCreated: (course: Course) => void) => {
  const [isCreating, setIsCreating] = useState(false);

  const createCourse = async (
    newCourse: Omit<Course, 'id' | 'createdAt' | 'trainer'>, 
    account: string | null
  ) => {
    if (!account) {
      toast({
        title: "Not Connected",
        description: "Please connect your wallet to create a course",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsCreating(true);
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
      
      onCourseCreated(course);
      
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
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createCourse,
    isCreating
  };
};
