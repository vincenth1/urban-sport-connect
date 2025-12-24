
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletStatus, User, Web3ContextState, Trainer, BookedCourse } from '@/types';
import { uploadToIPFS, fetchFromIPFSMemo } from '@/utils/ipfs';
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
            await loadUserData(addr);
          }
        }
      } catch (error) {
        console.error('Failed to check wallet connection:', error);
        setStatus(WalletStatus.ERROR);
      }
    };
    checkConnection();
  }, []);

  const loadUserData = async (addr: string) => {
    setIsUserLoading(true);
    try {
      const isTrainerFlag = localStorage.getItem(`isTrainer:${addr}`) === 'true';
      const storedBookedRaw = localStorage.getItem(`booked:${addr}`);
      const storedBooked = storedBookedRaw ? JSON.parse(storedBookedRaw) : [];

      let trainerProfile: Trainer | undefined;
      if (isTrainerFlag) {
        const profileIpfsUri = localStorage.getItem(`trainerProfileIpfs:${addr}`);
        if (profileIpfsUri) {
          try {
            const profileData = await fetchFromIPFSMemo(profileIpfsUri);
            trainerProfile = {
              address: addr,
              name: profileData.name,
              bio: profileData.bio,
              avatar: profileData.avatar,
              courses: [],
              profileIpfs: profileIpfsUri
            };
          } catch (error) {
            console.warn('Failed to load trainer profile from IPFS:', error);
            // No fallback to localStorage - profile will be undefined
          }
        }
      }

      const base: User = { address: addr, bookedCourses: storedBooked, isTrainer: isTrainerFlag, trainerProfile };
      setUser(base);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsUserLoading(false);
    }
  };

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
      await loadUserData(addr);
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
      console.log('Starting trainer registration...');
      if (!account) throw new Error('No account');
      setIsUserLoading(true);

      console.log('Registering as trainer on-chain...');
      // Register as trainer on-chain
      const { registerAsTrainer: registerOnChain } = await import('@/utils/contracts');
      await registerOnChain();
      console.log('On-chain registration successful');

      // Client-side trainer flag
      localStorage.setItem(`isTrainer:${account}`, 'true');

      console.log('Uploading profile to IPFS...');
      // Upload profile to IPFS
      const profileIpfs = await uploadToIPFS({ address: account, name, bio, avatar });
      console.log('IPFS upload successful:', profileIpfs);
      localStorage.setItem(`trainerProfileIpfs:${account}`, profileIpfs);

      // Create profile object with IPFS reference
      const profile: Trainer = {
        address: account,
        name,
        bio,
        avatar,
        courses: [],
        profileIpfs
      };

      setUser(prev => prev ? { ...prev, isTrainer: true, trainerProfile: profile } : prev);
      toast({ title: 'Registration Successful', description: 'You are now registered as a trainer!' });
      console.log('Trainer registration completed');
    } catch (error) {
      console.error('Failed to register as trainer:', error);
      toast({ title: 'Registration Failed', description: `Failed to register as trainer: ${error.message}`, variant: 'destructive' });
    } finally {
      setIsUserLoading(false);
    }
  };

  const updateTrainerProfile = async (name: string, bio: string, avatar: string) => {
    try {
      console.log('Starting profile update with:', { name, bio, avatar });
      if (!account) throw new Error('No account');
      setIsUserLoading(true);

      // Upload updated profile to IPFS
      console.log('Uploading to IPFS...');
      const profileIpfs = await uploadToIPFS({ address: account, name, bio, avatar });
      console.log('IPFS upload successful, new URI:', profileIpfs);
      localStorage.setItem(`trainerProfileIpfs:${account}`, profileIpfs);

      // Create updated profile object
      const profile: Trainer = {
        address: account,
        name,
        bio,
        avatar,
        courses: [],
        profileIpfs
      };

      console.log('Setting user with new profile:', profile);
      setUser(prev => {
        console.log('Previous user state:', prev);
        const newUser = prev ? { ...prev, trainerProfile: profile, isTrainer: true } : prev;
        console.log('New user state:', newUser);
        return newUser;
      });
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
