
import React from 'react';
import { useCourses } from '@/hooks/useCourses';
import { useWallet } from '@/hooks/useWallet';
import CourseGrid from '@/components/CourseGrid';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Courses = () => {
  const { courses, isLoading, bookCourse } = useCourses();
  const { isConnected, isTrainer } = useWallet();
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8 mt-20">
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
          onBook={(id) => bookCourse(id)}
          emptyMessage="No courses available. Be the first to create one!"
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default Courses;
