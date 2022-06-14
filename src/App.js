import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button, Navbar, Container, Card } from 'react-bootstrap';

import web3Modal from './modal.js'
import ContractArtifact from './assets/Artifact.json';

import CardLogIn from './CardLogIn'
import CardPublicMint from './CardPublicMint'
import CardPresaleMint from './CardPresaleMint'
import CardMessage from './CardMessage'
import CardThankYou from './CardThankYou'

const CHAIN_IDS = [1, 4]

export default function App() {
  const [status, setStatus] = useState('init');
  const PENDING_STATUSES = ["signing", "pending", "failed", "alreadyMinted", "unknownError"];

  const [instance, setInstance] = useState();
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [address, setAddress] = useState();
  const [chainId, setChainId] = useState();

  const [contract, setContract] = useState();
  const [mintStatus, setMintStatus] = useState();
  const [mintPrice, setMintPrice] = useState();
  const [tokenIds, setTokenIds] = useState();

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
   }, [])

   useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts) => {
        console.log("accountsChanged", accounts);
        if (accounts) setAddress(accounts[0]);
      };

      // TODO: DO SOMETHING TO FORCE REFRESH HERE
      const handleChainChanged = (chainId) => {
        setChainId(chainId);
      };

      instance.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);

      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [provider, instance]);

  const connectWallet = async () => {
    try {
      const instance = await web3Modal.connect();
      setInstance(instance)

      const provider = new ethers.providers.Web3Provider(instance);
      setProvider(provider)

      const accounts = await provider.listAccounts();
      if (accounts) setAddress(accounts[0])
      
      const network = await provider.getNetwork();
      setChainId(network.chainId);

      const signer = provider.getSigner(accounts[0]);
      setSigner(signer);

      const contract = new ethers.Contract(
        '0x78D72E60BaE892F97b97fEBAE5886DaB2eF0cbC8',
        ContractArtifact.abi,
        provider
      )
      setContract(contract)

      const tierInfo = await contract.getTierInfo(0);
      setMintPrice(ethers.utils.formatEther(tierInfo.price.toString()));
      setMintStatus(tierInfo.mintStatus);
    } catch (error) {
      console.error(error);
    }
  }

  const getMessage = {
    closed: {header: 'Minting is Closed', message: 'Sign up for our email list to be notified when it next opens.'},
    wrongChain: {header: 'Wrong Network', message: 'Please switch to Ethereum Mainnet to mint.'},
    signing: {header: 'Signing Transaction', message: 'Please sign your transaction in Metamask.'},
    pending: {header: 'Pending Block Confirmation', message: 'Assuming network traffic is reasonable, everything should be confirmed in about 15 seconds.'},
    alreadyMinted: {header: 'You already minted!', message: `You've already used your whitelist spot. You'll be able to mint again if more are available in the public mint.`},
    unknownError: {header: 'Unknown Error', message: `You can email xxx@capitalism.com for support if this problem continues.`}
  }

  const presaleMint = async (proof) => {
    const balance = await contract.balanceOf(address);
    if (balance.toNumber() > 0) {
      setStatus('alreadyMinted');
      return
    }
    setStatus('signing')
    let tx;
    try {
      tx = await contract.connect(signer).mintPresale(0, proof, {value: ethers.utils.parseEther(mintPrice)})
      setStatus('pending')
    } catch (err) {
      console.log(err)
      setStatus('unknownError')
      return
    }
    
    const receipt = await tx.wait()
    _processReceipt(receipt);
  }

  const publicMint = async (quantity) => {
    setStatus('signing')
    let tx;
    try {
      tx = await contract.connect(signer).mintPublic(0, quantity, {value: ethers.utils.parseEther(mintPrice).mul(quantity)})
      setStatus('pending')
    } catch (err) {
      console.log(err)
      setStatus('unknownError')
      return
    }
    
    const receipt = await tx.wait()
    _processReceipt(receipt);
  }

  const _processReceipt = (receipt) => {
    if (receipt.status === 0) {
      setStatus('unknownError')
    } else {
      try {
        let tokenIds = [];
        const events = receipt.events;
        for (let i = 0; i < events.length; i++) {
          tokenIds.push(events[i].args.tokenId.toNumber());
        }
        setTokenIds(tokenIds)
      } catch (err) {}
      setStatus('success')
    }
  }
 
  return (
    <div className="App">
      <div style={{ backgroundImage:`url(/background.png)`, backgroundRepeat:"no-repeat", backgroundSize:"cover", height: '100vh', width: '100vw' }}>
        <Navbar bg="dark" variant="dark">
          <Container>
            <Navbar.Brand href="/">Capitalist Pigs</Navbar.Brand>
            <Navbar.Text>{address && address.length ? 'Signed In As: ' + address.slice(0, 4) + '....' + address.slice(-4) : <Button variant="light" onClick={connectWallet}>Connect Wallet</Button>}</Navbar.Text>
          </Container>
        </Navbar>

        {!address || status !== "success" || mintStatus === 0 ? 
        
          <Card style={{ width: '32rem', margin: 'auto', marginTop: '8rem', zIndex: '1' }}>
            <Card.Body>
              <>{!address ? <CardLogIn /> : ""}</>
              <>{address && mintStatus === 0 ? <CardMessage message={getMessage["closed"]} /> : ""}</>
              <>{address && status === "init" && mintStatus > 0 && !CHAIN_IDS.includes(chainId) ? <CardMessage message={getMessage["wrongChain"]} /> : ""}</>
              <>{address && status === "init" && mintStatus === 1 && CHAIN_IDS.includes(chainId) ? <CardPresaleMint presaleMint={presaleMint} mintPrice={mintPrice} /> : ""}</>
              <>{address && status === "init" && mintStatus === 2 && CHAIN_IDS.includes(chainId) ? <CardPublicMint publicMint={publicMint} mintPrice={mintPrice} /> : ""}</>
              <>{address && PENDING_STATUSES.includes(status) && mintStatus > 0 ? <CardMessage message={getMessage[status]} /> : ""}</>
            </Card.Body>
          </Card>

          : <CardThankYou tokenIds={tokenIds} address={address} contractAddr={contract.address} />}
      </div>
    </div>
  );
}