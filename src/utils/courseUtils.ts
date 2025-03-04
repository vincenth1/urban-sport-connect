
import { BookedCourse } from '@/types';

// Check if a course is expired
export const isCourseExpired = (course: BookedCourse): boolean => {
  return Date.now() > course.expiresAt;
};

// Filter out expired courses
export const filterExpiredCourses = (bookedCourses: BookedCourse[]): BookedCourse[] => {
  return bookedCourses.filter(course => !isCourseExpired(course));
};

// Calculate expiration time based on course duration
export const calculateExpirationTime = (courseDuration: number): number => {
  const now = Date.now();
  return now + (courseDuration * 24 * 60 * 60 * 1000); // Convert days to milliseconds
};
