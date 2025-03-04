
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletStatus, User, Web3ContextState } from '@/types';
import { toast } from '@/components/ui/use-toast';

// Mock data - in real implementation, this would interact with actual wallet providers 
// and smart contracts
const mockUser: User = {
  address: '0x1234...5678',
  bookedCourses: [],
  isTrainer: false
};

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
        // In a real implementation, check if a wallet is already connected
        const isConnected = localStorage.getItem('walletConnected') === 'true';
        
        if (isConnected) {
          // For demo purposes, use mock data
          setStatus(WalletStatus.CONNECTED);
          setAccount(mockUser.address);
          setUser(mockUser);
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
      setStatus(WalletStatus.CONNECTING);
      
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, this would connect to MetaMask or another wallet
      setAccount(mockUser.address);
      setStatus(WalletStatus.CONNECTED);
      
      // Load user data
      setIsUserLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(mockUser);
      setIsUserLoading(false);
      
      localStorage.setItem('walletConnected', 'true');
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${mockUser.address}`,
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setStatus(WalletStatus.ERROR);
      
      toast({
        title: "Connection Failed",
        description: "Failed to connect to wallet",
        variant: "destructive",
      });
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
      // In a real implementation, this would call a smart contract function
      setIsUserLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser: User = {
        ...mockUser,
        isTrainer: true,
        trainerProfile: {
          address: mockUser.address,
          name,
          bio,
          avatar,
          courses: []
        }
      };
      
      setUser(updatedUser);
      setIsUserLoading(false);
      
      toast({
        title: "Registration Successful",
        description: "You are now registered as a trainer!",
      });
    } catch (error) {
      console.error('Failed to register as trainer:', error);
      setIsUserLoading(false);
      
      toast({
        title: "Registration Failed",
        description: "Failed to register as trainer",
        variant: "destructive",
      });
    }
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
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
