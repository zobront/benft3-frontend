import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import WalletConnect from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";

const web3Modal = new Web3Modal({
    network: "mainnet",
    cacheProvider: true,
    providerOptions: {
      walletlink: {
        package: CoinbaseWalletSDK, 
        options: {
          appName: "Bitcoin & Billionaires Mint",
          infuraId: "fb419f740b7e401bad5bec77d0d285a5"
        }
      },
      walletconnect: {
        package: WalletConnect, 
        options: {
          infuraId: "fb419f740b7e401bad5bec77d0d285a5"
        }
      }
    }
  })

  export default web3Modal;