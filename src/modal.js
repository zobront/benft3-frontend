import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import WalletConnect from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";

import { Button, Navbar, Container, Card, Spinner, Form } from 'react-bootstrap';

function App() {

  const [web3Modal, setWeb3Modal] = useState();
  const [web3Provider, setWeb3Provider] = useState();
  const [library, setLibrary] = useState();

  useEffect(() => {
    const modalOptions = {
      network: "mainnet", // optional
      cacheProvider: true, // optional
      providerOptions: {
        walletlink: {
          package: CoinbaseWalletSDK, 
          options: {
            appName: "Web 3 Modal Demo",
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
    }
    setWeb3Modal(new Web3Modal(modalOptions));
  }, [])

  const connectWallet = async () => {
    try {
      const w3provider = await web3Modal.connect();
      const library = new ethers.providers.Web3Provider(w3provider);
      setWeb3Provider(w3provider);
      setLibrary(library);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="App">
      <div style={{ backgroundImage:`url(/background.png)`, backgroundRepeat:"no-repeat", backgroundSize:"cover", height: '100vh', width: '100vw' }}>
        <Navbar bg="dark" variant="dark">
          <Container>
            <Navbar.Brand href="/">Ben Mezrich Project: Bitcoin & Billionaires</Navbar.Brand>
            <Navbar.Text> <button onClick={connectWallet}>Connect Wallet</button></Navbar.Text>
          </Container>
        </Navbar>
      </div>
    </div>
  );
}

export default App;