
export interface Course {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  duration: number; // in days
  sportType: SportType;
  trainer: string;
  location: string;
  time?: string; // legacy single time
  timeStart?: string; // ISO datetime string
  timeEnd?: string;   // ISO datetime string
  tokenId?: string;
  ipfsHash?: string;
  createdAt: number;
}

export enum SportType {
  YOGA = "Yoga",
  FITNESS = "Fitness",
  RUNNING = "Running",
  SWIMMING = "Swimming",
  CYCLING = "Cycling",
  BASKETBALL = "Basketball",
  FOOTBALL = "Football",
  TENNIS = "Tennis",
  CLIMBING = "Climbing",
  OTHER = "Other"
}

export interface BookedCourse extends Course {
  bookedAt: number;
  expiresAt: number;
}

export interface Trainer {
  address: string;
  name: string;
  bio: string;
  avatar: string;
  courses: Course[];
  profileIpfs?: string;
}

export interface User {
  address: string;
  bookedCourses: BookedCourse[];
  isTrainer: boolean;
  trainerProfile?: Trainer;
}

export enum WalletStatus {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  ERROR = "error"
}

export interface Web3ContextState {
  account: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  status: WalletStatus;
  user: User | null;
  isUserLoading: boolean;
  isTrainer: boolean;
  registerAsTrainer: (name: string, bio: string, avatar: string) => Promise<void>;
  updateTrainerProfile?: (name: string, bio: string, avatar: string) => Promise<void>;
  appendBookedCourse?: (course: BookedCourse) => void;
}
