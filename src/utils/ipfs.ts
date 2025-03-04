
// This is a mock implementation for demonstration
// In a production app, you would use a library like ipfs-http-client

export const uploadToIPFS = async (
  data: any,
  onProgress?: (progress: number) => void
): Promise<string> => {
  // Simulate IPFS upload with delay and progress
  await new Promise<void>((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (onProgress) onProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        resolve();
      }
    }, 300);
  });

  // Mock IPFS hash
  return `ipfs://QmHash${Math.floor(Math.random() * 1000000)}`;
};

export const fetchFromIPFS = async (hash: string): Promise<any> => {
  // Simulate fetching from IPFS
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock data
  return {
    title: "Course Title",
    description: "Course Description",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000",
    price: "0.05 ETH",
    duration: 7,
    sportType: "Yoga",
    trainer: "0x1234...5678",
    location: "City Center"
  };
};

export const prepareCourseMetadata = (courseData: any) => {
  return {
    name: courseData.title,
    description: courseData.description,
    image: courseData.image,
    attributes: [
      {
        trait_type: "Price",
        value: courseData.price
      },
      {
        trait_type: "Duration",
        value: courseData.duration
      },
      {
        trait_type: "Sport Type",
        value: courseData.sportType
      },
      {
        trait_type: "Location",
        value: courseData.location
      },
      {
        trait_type: "Trainer",
        value: courseData.trainer
      }
    ]
  };
};
