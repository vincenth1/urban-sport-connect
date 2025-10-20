
import React, { useState } from 'react';
import CourseCard from './CourseCard';
import { Course, SportType, BookedCourse } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

interface CourseGridProps {
  courses: Course[] | BookedCourse[];
  isLoading?: boolean;
  isBooked?: boolean;
  showBookButton?: boolean;
  emptyMessage?: string;
  showFilters?: boolean;
  onBook?: (courseId: string) => void;
  onUnsubscribe?: (courseId: string) => void;
}

const CourseGrid = ({
  courses,
  isLoading = false,
  isBooked = false,
  showBookButton = true,
  emptyMessage = "No courses found",
  showFilters = true,
  onBook,
  onUnsubscribe
}: CourseGridProps) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  const sportTypes = ['all', ...Object.values(SportType)];
  
  const filteredCourses = activeFilter === 'all'
    ? courses
    : courses.filter(course => course.sportType === activeFilter);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showFilters && (
        <Tabs defaultValue="all" value={activeFilter} onValueChange={setActiveFilter} className="w-full">
          <TabsList className="w-full max-w-full flex overflow-x-auto pb-px custom-scrollbar">
            {sportTypes.map((type) => (
              <TabsTrigger 
                key={type} 
                value={type}
                className="flex-shrink-0"
              >
                {type === 'all' ? 'All Courses' : type}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            isBooked={isBooked}
            showBookButton={showBookButton}
            onBook={onBook}
            onUnsubscribe={onUnsubscribe}
          />
        ))}
      </div>
    </div>
  );
};

export default CourseGrid;
