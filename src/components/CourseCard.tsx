
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Course, BookedCourse } from '@/types';
import { useWallet } from '@/hooks/useWallet';
import { useCourses } from '@/hooks/useCourses';
import { getItemNft } from '@/utils/contracts';
import { formatDistance } from 'date-fns';
import { Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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

  const [capacityInfo, setCapacityInfo] = React.useState<{ ok: boolean; reason?: string }>({ ok: true });
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const end = (course as any).timeEnd as string | undefined;
        if (!end) { if (mounted) setCapacityInfo({ ok: false, reason: 'Course is not scheduled' }); return; }
        const endMs = Date.parse(end);
        if (Number.isNaN(endMs) || endMs <= Date.now()) { if (mounted) setCapacityInfo({ ok: false, reason: 'Course has ended' }); return; }
        const item = await getItemNft(course.id);
        const [active, cap] = await Promise.all([
          item.activeRenterCount(Number(course.tokenId || '1')),
          item.capacity(Number(course.tokenId || '1')),
        ]);
        if (!mounted) return;
        if (Number(active) >= Number(cap)) setCapacityInfo({ ok: false, reason: 'Capacity reached' });
        else setCapacityInfo({ ok: true });
      } catch {
        if (mounted) setCapacityInfo({ ok: true });
      }
    })();
    return () => { mounted = false; };
  }, [course.id, course.tokenId, (course as any).timeEnd]);

  const canBook = capacityInfo.ok;
  
  const getTimeRemaining = (expiresAt: number) => {
    const now = Date.now();
    if (now > expiresAt) return 'Expired';
    const totalMs = expiresAt - now;
    const seconds = Math.floor((totalMs / 1000) % 60);
    const minutes = Math.floor((totalMs / 1000 / 60) % 60);
    const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
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
            {course.timeStart && course.timeEnd
              ? `${new Date(course.timeStart).toLocaleString()} - ${new Date(course.timeEnd).toLocaleString()}`
              : ((course as any).time ? new Date((course as any).time).toLocaleString() : ((course as any).duration ? `${(course as any).duration} days` : 'Time not specified'))}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{course.location}</span>
          </span>
        </div>

        {bookedCourse && course.timeStart && course.timeEnd && (
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Course Schedule:</strong> {new Date(course.timeStart).toLocaleString()} - {new Date(course.timeEnd).toLocaleString()}
            </div>
          </div>
        )}
        
        {bookedCourse && (
          <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-md">
            <Countdown expiresAt={bookedCourse.expiresAt} />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-4 py-3 border-t">
        {isBooked ? (
          <div className="w-full">
            <span className="text-sm text-primary font-medium">Already booked</span>
          </div>
        ) : (
          showBookButton && (() => {
            const disabled = !isConnected || !canBook;
            const tooltipText = !isConnected
              ? 'Connect your wallet to book this course'
              : (!capacityInfo.ok ? (capacityInfo.reason || 'Unavailable') : '');
            const button = (
              <Button 
                className="w-full"
                variant="default"
                onClick={handleBook}
                disabled={disabled}
              >
                {canBook ? 'Book Course' : 'Unavailable'}
              </Button>
            );
            return disabled ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="w-full">{button}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <span>{tooltipText}</span>
                </TooltipContent>
              </Tooltip>
            ) : button;
          })()
        )}
      </CardFooter>
    </Card>
  );
};

const Countdown = ({ expiresAt }: { expiresAt: number }) => {
  const [, force] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => force((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const now = Date.now();
  const remaining = Math.max(0, expiresAt - now);
  const seconds = Math.floor((remaining / 1000) % 60);
  const minutes = Math.floor((remaining / 1000 / 60) % 60);
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));

  let text = 'Expired';
  if (remaining > 0) {
    if (days > 0) {
      text = `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      text = `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      text = `${minutes}m ${seconds}s`;
    } else {
      text = `${seconds}s`;
    }
  }

  return (
    <div className="text-sm">
      <div className="flex justify-between items-center">
        <span className="text-green-700 dark:text-green-300 font-medium">Course Access:</span>
        <span className={`font-bold ${remaining <= 0 ? 'text-red-600' : 'text-green-600'}`}>
          {text}
        </span>
      </div>
    </div>
  );
};

export default CourseCard;
