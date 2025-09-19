
import { Course, SportType } from '@/types';

// Mock data - in a real implementation, this would fetch from IPFS and interact with smart contracts
export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Advanced Yoga Sessions',
    description: 'A 7-day intensive yoga program focused on advanced poses and meditation techniques.',
    price: '0.05 ETH',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1000',
    sportType: SportType.YOGA,
    trainer: '0xAbC...123',
    location: 'Central Park, New York',
    timeStart: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    timeEnd: new Date(Date.now() + 86400000 + 3600000).toISOString(), // Tomorrow + 1 hour
    createdAt: Date.now()
  },
  {
    id: '2',
    title: 'Urban Running Experience',
    description: 'Explore the city while improving your endurance and running technique.',
    price: '0.03 ETH',
    image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?q=80&w=1000',
    sportType: SportType.RUNNING,
    trainer: '0xDeF...456',
    location: 'Downtown District',
    timeStart: new Date(Date.now() + 2 * 86400000).toISOString(), // Day after tomorrow
    timeEnd: new Date(Date.now() + 2 * 86400000 + 7200000).toISOString(), // Day after tomorrow + 2 hours
    createdAt: Date.now()
  },
  {
    id: '3',
    title: 'Basketball Skills Workshop',
    description: 'Learn advanced basketball techniques from professional coaches.',
    price: '0.07 ETH',
    image: 'https://images.unsplash.com/photo-1546519638-68e109acd27d?q=80&w=1000',
    sportType: SportType.BASKETBALL,
    trainer: '0xGhI...789',
    location: 'Sports Complex',
    timeStart: new Date(Date.now() + 3 * 86400000).toISOString(), // 3 days from now
    timeEnd: new Date(Date.now() + 3 * 86400000 + 5400000).toISOString(), // 3 days from now + 1.5 hours
    createdAt: Date.now()
  },
  {
    id: '4',
    title: 'Swimming Masterclass',
    description: 'Perfect your swimming technique with personalized coaching.',
    price: '0.04 ETH',
    image: 'https://images.unsplash.com/photo-1560090995-01632a28895b?q=80&w=1000',
    sportType: SportType.SWIMMING,
    trainer: '0xJkL...012',
    location: 'Aquatics Center',
    timeStart: new Date(Date.now() + 4 * 86400000).toISOString(), // 4 days from now
    timeEnd: new Date(Date.now() + 4 * 86400000 + 3600000).toISOString(), // 4 days from now + 1 hour
    createdAt: Date.now()
  }
];
