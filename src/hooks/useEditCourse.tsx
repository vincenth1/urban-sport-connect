import { useState } from 'react';
import { Course, SportType } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { uploadToIPFS } from '@/utils/ipfs';
import { setItemMetadata, changeItemPrice } from '@/utils/contracts';

export const useEditCourse = (onCourseUpdated: (course: Partial<Course> & { id: string }) => void) => {
  const [isSaving, setIsSaving] = useState(false);

  const saveCourse = async (courseId: string, tokenId: number, updates: Partial<Course>) => {
    try {
      setIsSaving(true);
      toast({ title: 'Updating Course', description: 'Saving changes to IPFS and blockchain...' });

      // 1) Upload updated metadata to IPFS
      const meta: any = {
        name: updates.title,
        description: updates.description,
        image: updates.image,
        timeStart: (updates as any).timeStart,
        timeEnd: (updates as any).timeEnd,
        location: updates.location,
        sportType: updates.sportType,
        capacity: (updates as any).capacity
      };
      // Include extended attributes if provided
      const attributes: any[] = [];
      if (updates.price) attributes.push({ trait_type: 'Price', value: updates.price });
      if (updates.location) attributes.push({ trait_type: 'Location', value: updates.location });
      if ((updates as any).timeStart) attributes.push({ trait_type: 'TimeStart', value: (updates as any).timeStart });
      if ((updates as any).timeEnd) attributes.push({ trait_type: 'TimeEnd', value: (updates as any).timeEnd });
      if (updates.sportType) attributes.push({ trait_type: 'Sport Type', value: updates.sportType as SportType });
      if ((updates as any).capacity !== undefined) attributes.push({ trait_type: 'Capacity', value: (updates as any).capacity });
      if (attributes.length) meta.attributes = attributes;
      const ipfsUri = await uploadToIPFS(meta);

      // 2) Update on-chain metadata to point to new IPFS uri
      await setItemMetadata(courseId, tokenId, updates.title || '', updates.description || '', ipfsUri);

      // 3) Optionally change price
      if (updates.price) {
        await changeItemPrice(courseId, updates.price);
      }

      onCourseUpdated({ id: courseId, ...updates, ipfsHash: ipfsUri });
      toast({ title: 'Updated', description: 'Course updated successfully' });
      return true;
    } catch (error) {
      console.error('Failed to update course:', error);
      toast({ title: 'Update Failed', description: 'Could not update course', variant: 'destructive' });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { isSaving, saveCourse };
};


