
import { useState } from 'react';
import { Course } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { prepareCourseMetadata, uploadToIPFS } from '@/utils/ipfs';
import { deployItemNft, setItemMetadata, registerInCounter, getNextCourseNameAndSymbol, changeItemPrice } from '@/utils/contracts';

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
      // 1) Upload metadata to IPFS
      toast({ title: 'Processing', description: 'Uploading metadata to IPFS...' });
      const metadata = prepareCourseMetadata({ ...newCourse, trainer: account });
      const ipfsUri = await uploadToIPFS(metadata);

      // 2) Deploy ItemNft (one per course)
      toast({ title: 'Processing', description: 'Deploying course contract...' });
      const auto = await getNextCourseNameAndSymbol();
      const itemAddress = await deployItemNft({ name: auto.name, symbol: auto.symbol, priceEth: newCourse.price, capacity: newCourse.capacity ?? 1 });

      // 3) Set token metadata (store IPFS uri in image field for richer fetch later)
      await setItemMetadata(itemAddress, 1, newCourse.title, newCourse.description, ipfsUri);

      // 4) Register in NFTCounter using secret from env
      await registerInCounter(itemAddress, import.meta.env.VITE_SECRET);

      const course: Course = {
        ...newCourse,
        id: itemAddress,
        tokenId: '1',
        ipfsHash: ipfsUri,
        trainer: account,
        createdAt: Date.now()
      };
      onCourseCreated(course);
      toast({ title: 'Course Created', description: `${newCourse.title} has been created successfully` });
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
