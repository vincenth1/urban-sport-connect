
import React from 'react';
import { useCourses } from '@/hooks/useCourses';
import { useWallet } from '@/hooks/useWallet';
import CourseGrid from '@/components/CourseGrid';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Courses = () => {
  const { courses, isLoading } = useCourses();
  const { isConnected, isTrainer } = useWallet();
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Available Courses</h1>
        
        {isConnected && isTrainer && (
          <Button 
            onClick={() => navigate('/create-course')}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Create Course
          </Button>
        )}
      </div>
      
      <CourseGrid 
        courses={courses} 
        isLoading={isLoading}
        showBookButton={isConnected}
        emptyMessage="No courses available. Be the first to create one!"
      />
    </div>
  );
};

export default Courses;
