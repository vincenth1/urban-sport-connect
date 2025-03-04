
import { useWeb3 } from '@/context/Web3Context';
import { WalletStatus } from '@/types';

export const useWallet = () => {
  const { 
    account, 
    connectWallet, 
    disconnectWallet, 
    status, 
    user,
    isUserLoading
  } = useWeb3();

  const isConnected = status === WalletStatus.CONNECTED;
  const isConnecting = status === WalletStatus.CONNECTING;
  const hasError = status === WalletStatus.ERROR;

  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const displayAddress = account ? shortenAddress(account) : '';

  return {
    account,
    connectWallet,
    disconnectWallet,
    status,
    isConnected,
    isConnecting,
    hasError,
    displayAddress,
    user,
    isUserLoading
  };
};
