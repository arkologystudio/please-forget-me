// components/Donate.tsx
import React from "react";
import Image from "next/image";
import SolanaLogo from "../../../public/solanaLogoMark.svg";
import EthereumLogo from "../../../public/eth-glyph-colored.svg";
import { useToast } from "@/hooks/use-toast";
import { Card } from "./card";
import { Button } from "./button";

const Donate: React.FC = () => {
  const { toast } = useToast();
  const [showCryptoOptions, setShowCryptoOptions] = React.useState(false);

  const handleCopy = (address: string | undefined) => {
    if (!address) {
      toast({
        title: "Error",
        description: "Donation address not found",
        duration: 3000,
      });
      return;
    }
    navigator.clipboard.writeText(address);
    const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
    toast({
      title: `✓ Copied Address: ${truncatedAddress}`,
      description: `Thank you for your support!`, 
      duration: 3000,
    });
  };

  return (
    <Card className="block w-[300px] border border-slate-200 px-12 py-5 text-center bg-white rounded-lg space-y-2 ">
      <p className="text-lg font-medium text-slate-900 py-2">Support this project ❤️</p>
      <Button
        className="w-full"
        onClick={() =>
          window.open(
            "https://www.buymeacoffee.com/arkology.studio",
            "_blank",
            "noopener,noreferrer"
          )
        }
      >
        Buy Us a Coffee
      </Button>
      <p>Or</p>
      {showCryptoOptions ? (
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={() => handleCopy(process.env.NEXT_PUBLIC_SOLANA_DONATE_ADDRESS)}
            className="w-full"
          >
            <Image src={SolanaLogo} alt="Solana Logo" width={20} height={20} className="mr-2" />
            SOL
          </Button>
          <Button
            variant="outline" 
            onClick={() => handleCopy(process.env.NEXT_PUBLIC_ETHEREUM_DONATE_ADDRESS)}
            className="w-full"
          >
            <Image src={EthereumLogo} alt="Ethereum Logo" width={20} height={20} className="mr-2" />
            ETH
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => setShowCryptoOptions(true)}
          className="w-full"
        >
          Donate Crypto
        </Button>
      )}
    </Card>
  );
};

export default Donate;
