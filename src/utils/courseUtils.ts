
import { BookedCourse } from '@/types';

// Check if a course is expired
export const isCourseExpired = (course: BookedCourse): boolean => {
  return Date.now() > course.expiresAt;
};

// Filter out expired courses
export const filterExpiredCourses = (bookedCourses: BookedCourse[]): BookedCourse[] => {
  return bookedCourses.filter(course => !isCourseExpired(course));
};

// Note: Expiration is enforced on-chain via ERC-4907's userExpires.
// The UI uses the on-chain value returned by scGetCourseInfo().
