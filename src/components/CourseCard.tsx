
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Course, BookedCourse } from '@/types';
import { useWallet } from '@/hooks/useWallet';
import { useCourses } from '@/hooks/useCourses';
import { formatDistance } from 'date-fns';
import { Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CourseCardProps {
  course: Course | BookedCourse;
  isBooked?: boolean;
  showBookButton?: boolean;
  onBook?: (courseId: string) => void;
}

const CourseCard = ({ 
  course, 
  isBooked = false, 
  showBookButton = true,
  onBook
}: CourseCardProps) => {
  const { isConnected } = useWallet();
  const { bookCourse } = useCourses();
  
  // Check if the course is a booked course with expiration
  const bookedCourse = isBooked ? course as BookedCourse : null;
  
  const handleBook = () => {
    if (isConnected) {
      if (onBook) {
        onBook(course.id);
      } else {
        bookCourse(course.id);
      }
    }
  };
  
  const getTimeRemaining = (expiresAt: number) => {
    const now = Date.now();
    if (now > expiresAt) return 'Expired';
    
    return formatDistance(new Date(expiresAt), new Date(), { addSuffix: true });
  };

  return (
    <Card className="hover-card-animation h-full overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={course.image} 
          alt={course.title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        <Badge className="absolute top-3 right-3 bg-primary">
          {course.sportType}
        </Badge>
        <div className="absolute bottom-3 left-3">
          <Badge variant="outline" className="bg-black/50 text-white border-transparent backdrop-blur-sm">
            {course.price}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg truncate">{course.title}</h3>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
        
        <div className="flex items-center text-xs text-muted-foreground gap-3">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {course.time ? new Date(course.time).toLocaleString() : `${course.duration} days`}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{course.location}</span>
          </span>
        </div>
        
        {bookedCourse && (
          <div className="mt-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Expires:</span>
              <span className="font-medium">
                {getTimeRemaining(bookedCourse.expiresAt)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-4 py-3 border-t">
        {isBooked ? (
          <div className="w-full">
            <span className="text-sm text-primary font-medium">Already booked</span>
          </div>
        ) : (
          showBookButton && (
            <Button 
              className="w-full"
              variant="default"
              onClick={handleBook}
              disabled={!isConnected}
            >
              Book Course
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
