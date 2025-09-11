
import { useState, useEffect, useRef } from 'react';
import { Course, SportType, BookedCourse } from '@/types';
import { useWeb3 } from '@/context/Web3Context';
import { toast } from '@/components/ui/use-toast';
import { filterExpiredCourses } from '@/utils/courseUtils';
import { listAllCourseContracts, getItemNft, getRentalStatus } from '@/utils/contracts';
import { fetchFromIPFSMemo } from '@/utils/ipfs';
import { useBookCourse } from '@/hooks/useBookCourse';
import { useCreateCourse } from '@/hooks/useCreateCourse';

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [bookedCourses, setBookedCourses] = useState<BookedCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, account } = useWeb3();

  // Fetch all available courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        
        const addresses = await listAllCourseContracts();
        // Fetch contracts in parallel with a concurrency cap
        const concurrency = 4;
        const chunks: string[][] = [];
        for (let i = 0; i < addresses.length; i += concurrency) {
          chunks.push(addresses.slice(i, i + concurrency));
        }
        const allResults: Course[] = [];
        for (const batch of chunks) {
          const batchResults = await Promise.all(batch.map(async (addr) => {
            try {
              const item = await getItemNft(addr);
              const [tokenId, meta, priceWei] = await Promise.all([
                item._tokenId(),
                item.getTokenMetadata(1),
                item._rentPrice(),
              ]);

              let enriched = { name: meta.name, description: meta.description, image: meta.image } as any;
              try {
                if (typeof meta.image === 'string' && meta.image.startsWith('ipfs://')) {
                  const ipfsData = await fetchFromIPFSMemo(meta.image);
                  enriched = {
                    name: ipfsData.name || meta.name,
                    description: ipfsData.description || meta.description,
                    image: ipfsData.image || meta.image,
                  };
                }
              } catch (e) {
                console.warn('IPFS fetch failed for', addr, e);
              }

              const trainer = await item.ownerOf(Number(tokenId));
              const course: Course = {
                id: addr,
                tokenId: tokenId.toString(),
                ipfsHash: typeof meta.image === 'string' && meta.image.startsWith('ipfs://') ? meta.image : undefined,
                title: enriched.name,
                description: enriched.description,
                image: enriched.image,
                price: (Number(priceWei) / 1e18).toString(),
                duration: 0,
                sportType: 'Other',
                trainer,
                location: '',
                createdAt: Date.now()
              };
              return course;
            } catch (e) {
              console.warn('Failed to load course for', addr, e);
              return null;
            }
          }));
          allResults.push(...batchResults.filter(Boolean) as Course[]);
        }
        setCourses(allResults);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Failed to load courses",
          variant: "destructive",
        });
      }
    };

    fetchCourses();
  }, []);

  // Fetch booked courses for connected user
  useEffect(() => {
    if (account) {
      const fetchBookedCourses = async () => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // In a real implementation, this would fetch booked courses from the blockchain
          if (user?.bookedCourses) {
            setBookedCourses(user.bookedCourses);
          } else {
            setBookedCourses([]);
          }
        } catch (error) {
          console.error('Failed to fetch booked courses:', error);
          toast({
            title: "Error",
            description: "Failed to load your booked courses",
            variant: "destructive",
          });
        }
      };

      fetchBookedCourses();
    } else {
      // Not logged in: show none for booked
      setBookedCourses([]);
    }
  }, [account, user]);

  // Periodically prune expired bookings from view
  const bookedRef = useRef<BookedCourse[]>([]);
  useEffect(() => {
    bookedRef.current = bookedCourses;
  }, [bookedCourses]);
  useEffect(() => {
    const interval = setInterval(async () => {
      const prev = bookedRef.current;
      const updated: BookedCourse[] = [];
      for (const b of prev) {
        try {
          const status = await getRentalStatus(b.id, Number(b.tokenId || '1'));
          const isStillUser = status.user.toLowerCase() === (account || '').toLowerCase();
          const stillValid = Date.now() < status.expires;
          if (isStillUser && stillValid) {
            updated.push({ ...b, expiresAt: status.expires });
          }
        } catch (e) {
          if (Date.now() < b.expiresAt) updated.push(b);
        }
      }
      setBookedCourses(filterExpiredCourses(updated));
    }, 15000);
    return () => clearInterval(interval);
  }, [account]);

  // Handle booking a course
  const handleCourseBooked = (bookedCourse: BookedCourse) => {
    setBookedCourses(prev => Array.isArray(prev) ? [...prev, bookedCourse] : [bookedCourse]);
  };

  // Hook for booking courses
  const { bookCourse } = useBookCourse(handleCourseBooked);

  // Handle creating a course
  const handleCourseCreated = (newCourse: Course) => {
    setCourses(prev => [...prev, newCourse]);
  };

  // Hook for creating courses
  const { createCourse } = useCreateCourse(handleCourseCreated);

  // Optimistically update a course in local state
  const updateCourseInState = (updated: Partial<Course> & { id: string }) => {
    setCourses(prev => prev.map(c => (c.id === updated.id ? { ...c, ...updated } as Course : c)));
  };

  // Filter courses by type
  const filterCoursesByType = (type: SportType | 'all') => {
    if (type === 'all') {
      return courses;
    }
    return courses.filter(course => course.sportType === type);
  };

  // Get active booked courses (not expired)
  const activeBookedCourses = filterExpiredCourses(bookedCourses);

  return {
    courses,
    bookedCourses: activeBookedCourses,
    isLoading,
    bookCourse: (courseId: string) => {
      const courseToBook = courses.find(c => c.id === courseId);
      if (courseToBook) {
        bookCourse(courseToBook, account);
      }
    },
    createCourse: (newCourse: Omit<Course, 'id' | 'createdAt' | 'trainer'>) => {
      return createCourse(newCourse, account);
    },
    filterCoursesByType,
    updateCourseInState
  };
};
