
import React from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { Wallet as WalletIcon, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface WalletConnectProps {
  message?: string;
  fullPage?: boolean;
}

const WalletConnect = ({ 
  message = "Connect your wallet to access this feature", 
  fullPage = false 
}: WalletConnectProps) => {
  const { connectWallet, isConnecting } = useWallet();

  if (fullPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <Card className="glass-card max-w-md w-full p-8 text-center space-y-6 animate-in slide-up">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <WalletIcon className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">{message}</h2>
          <p className="text-muted-foreground">
            To use this feature, you need to connect your Ethereum wallet. This allows you to interact with the blockchain.
          </p>
          <Button 
            onClick={connectWallet} 
            className="w-full py-6"
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <WalletIcon className="mr-2 h-4 w-4" />
                Connect Wallet
              </>
            )}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6 text-center space-y-4 animate-in fade-in">
      <WalletIcon className="h-12 w-12 text-primary/70 mx-auto" />
      <h3 className="text-xl font-semibold">{message}</h3>
      <p className="text-sm text-muted-foreground">
        You need to connect your wallet to access this feature.
      </p>
      <Button 
        onClick={connectWallet} 
        className="w-full"
        disabled={isConnecting}
      >
        {isConnecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <WalletIcon className="mr-2 h-4 w-4" />
            Connect Wallet
          </>
        )}
      </Button>
    </div>
  );
};

export default WalletConnect;
