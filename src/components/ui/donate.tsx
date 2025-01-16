// components/Donate.tsx
import React from "react";
import Image from "next/image";
import SolanaLogo from "../../../public/solanaLogo.svg";
import EthereumLogo from "../../../public/ethereumLogo.svg";
import { useToast } from "@/hooks/use-toast";

const Donate: React.FC = () => {
  const { toast } = useToast();

  const handleCopy = (address) => {
    navigator.clipboard.writeText(address);
    toast({
      title: `✓ Copied Address: ${address}`, //todo add address
      description: `Thank you for your support!`,
      duration: 3000,
    });
  };

  return (
    <div
      style={{
        position: "absolute",
        right: "5%",
        bottom: "-50%",
        width: "300px",
        height: "250px",
        border: "1px solid #ccc",
        padding: "20px",
        textAlign: "center",
        backgroundColor: "white",
        borderRadius: "10px",
      }}
    >
      <p>Support Arkology Studio</p>
      <br />
      <button
        onClick={() =>
          window.open(
            "https://www.buymeacoffee.com/arkology.studio",
            "_blank",
            "noopener,noreferrer"
          )
        }
        style={{
          borderRadius: "10px",
          color: "rgb(15 23 42 / var(--tw-bg-opacity, 1))",
          background: "white",
          padding: "6px",
          border: "solid 2px rgb(15 23 42 / var(--tw-bg-opacity, 1))",
        }}
      >
        Send a few dollars
      </button>
      <br />
      <p
        style={{
          fontSize: "16px",
          color: "grey",
        }}
      >
        or
      </p>
      <button
        onClick={() =>
          handleCopy(process.env.NEXT_PUBLIC_SOLANA_DONATE_ADDRESS)
        }
      >
        <Image src={SolanaLogo} alt="Solana Logo" width={150} height={150} />
      </button>
      <p
        style={{
          fontSize: "16px",
          color: "grey",
        }}
      >
        or
      </p>
      <button
        onClick={() =>
          handleCopy(process.env.NEXT_PUBLIC_ETHEREUM_DONATE_ADDRESS)
        }
      >
        <Image
          src={EthereumLogo}
          alt="Ethereum Logo"
          width={150}
          height={150}
        />
      </button>
    </div>
  );
};

export default Donate;
