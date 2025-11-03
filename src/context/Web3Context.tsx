
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletStatus, User, Web3ContextState, Trainer, BookedCourse } from '@/types';
import { uploadToIPFS } from '@/utils/ipfs';
import { toast } from '@/components/ui/use-toast';
import { getProvider } from '@/utils/contracts';

const defaultContextValue: Web3ContextState = {
  account: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  status: WalletStatus.DISCONNECTED,
  user: null,
  isUserLoading: false,
  isTrainer: false,
  registerAsTrainer: async () => {},
};

export const Web3Context = createContext<Web3ContextState>(defaultContextValue);

export const useWeb3 = () => useContext(Web3Context);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  const [account, setAccount] = useState<string | null>(null);
  const [status, setStatus] = useState<WalletStatus>(WalletStatus.DISCONNECTED);
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(false);

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      try {
        if ((window as any).ethereum) {
          const provider = getProvider();
          const accounts = await provider.listAccounts();
          if (accounts && accounts.length > 0) {
            const addr = accounts[0].address;
            setAccount(addr);
            setStatus(WalletStatus.CONNECTED);
            const isTrainerFlag = localStorage.getItem(`isTrainer:${addr}`) === 'true';
            const storedProfileRaw = localStorage.getItem(`trainerProfile:${addr}`);
            const storedProfile = storedProfileRaw ? JSON.parse(storedProfileRaw) : undefined;
            const storedBookedRaw = localStorage.getItem(`booked:${addr}`);
            const storedBooked = storedBookedRaw ? JSON.parse(storedBookedRaw) : [];
            const base: User = { address: addr, bookedCourses: storedBooked, isTrainer: isTrainerFlag, trainerProfile: storedProfile };
            setUser(base);
          }
        }
      } catch (error) {
        console.error('Failed to check wallet connection:', error);
        setStatus(WalletStatus.ERROR);
      }
    };
    checkConnection();
  }, []);

  const connectWallet = async () => {
    try {
      if (!(window as any).ethereum) {
        toast({ title: 'MetaMask Required', description: 'Please install MetaMask', variant: 'destructive' });
        return;
      }
      setStatus(WalletStatus.CONNECTING);
      const provider = getProvider();
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      const addr = accounts[0];
      setAccount(addr);
      setStatus(WalletStatus.CONNECTED);
      setIsUserLoading(true);
      const isTrainerFlag = localStorage.getItem(`isTrainer:${addr}`) === 'true';
      const storedProfileRaw = localStorage.getItem(`trainerProfile:${addr}`);
      const storedProfile = storedProfileRaw ? JSON.parse(storedProfileRaw) : undefined;
      const storedBookedRaw = localStorage.getItem(`booked:${addr}`);
      const storedBooked = storedBookedRaw ? JSON.parse(storedBookedRaw) : [];
      const base: User = { address: addr, bookedCourses: storedBooked, isTrainer: isTrainerFlag, trainerProfile: storedProfile };
      setUser(base);
      setIsUserLoading(false);
      toast({ title: 'Wallet Connected', description: `Connected to ${addr}` });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setStatus(WalletStatus.ERROR);
      toast({ title: 'Connection Failed', description: 'Failed to connect to wallet', variant: 'destructive' });
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setUser(null);
    setStatus(WalletStatus.DISCONNECTED);
    localStorage.removeItem('walletConnected');
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const registerAsTrainer = async (name: string, bio: string, avatar: string) => {
    try {
      if (!account) throw new Error('No account');
      setIsUserLoading(true);

      // Register as trainer on-chain
      const { registerAsTrainer: registerOnChain } = await import('@/utils/contracts');
      await registerOnChain();

      // Client-side trainer flag
      localStorage.setItem(`isTrainer:${account}`, 'true');
      const profile: Trainer = { address: account, name, bio, avatar, courses: [] };
      try {
        const profileIpfs = await uploadToIPFS({ address: account, name, bio, avatar });
        profile.profileIpfs = profileIpfs;
      } catch (e) {
        console.warn('Failed to upload trainer profile to IPFS, falling back to local only', e);
      }
      localStorage.setItem(`trainerProfile:${account}`, JSON.stringify(profile));
      setUser(prev => prev ? { ...prev, isTrainer: true, trainerProfile: profile } : prev);
      toast({ title: 'Registration Successful', description: 'You are now registered as a trainer!' });
    } catch (error) {
      console.error('Failed to register as trainer:', error);
      toast({ title: 'Registration Failed', description: 'Failed to register as trainer', variant: 'destructive' });
    } finally {
      setIsUserLoading(false);
    }
  };

  const updateTrainerProfile = async (name: string, bio: string, avatar: string) => {
    try {
      if (!account) throw new Error('No account');
      setIsUserLoading(true);
      const profile: Trainer = { address: account, name, bio, avatar, courses: [], profileIpfs: undefined };
      try {
        const profileIpfs = await uploadToIPFS({ address: account, name, bio, avatar });
        profile.profileIpfs = profileIpfs;
      } catch (e) {
        console.warn('Failed to upload trainer profile to IPFS');
      }
      localStorage.setItem(`trainerProfile:${account}`, JSON.stringify(profile));
      setUser(prev => prev ? { ...prev, trainerProfile: profile, isTrainer: true } : prev);
      toast({ title: 'Profile Updated', description: 'Your trainer profile has been updated.' });
    } catch (e) {
      console.error('Failed to update trainer profile', e);
      toast({ title: 'Update Failed', description: 'Could not update trainer profile', variant: 'destructive' });
    } finally {
      setIsUserLoading(false);
    }
  };

  const appendBookedCourse = (course: BookedCourse) => {
    setUser(prev => {
      if (!prev) return prev;
      const next = { ...prev, bookedCourses: [...(prev.bookedCourses || []), course] } as User;
      try {
        localStorage.setItem(`booked:${prev.address}`, JSON.stringify(next.bookedCourses));
      } catch {}
      return next;
    });
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        connectWallet,
        disconnectWallet,
        status,
        user,
        isUserLoading,
        isTrainer: user?.isTrainer || false,
        registerAsTrainer,
        updateTrainerProfile,
        appendBookedCourse,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
