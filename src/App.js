import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button, Navbar, Container, Card } from 'react-bootstrap';

import web3Modal from './modal.js'
import ContractArtifact from './assets/Artifact.json';
import snapshot from './assets/snapshot.json';

import CardLogIn from './CardLogIn'
import CardPublicMint from './CardPublicMint'
import CardPresaleMint from './CardPresaleMint'
import CardMessage from './CardMessage'
import CardThankYou from './CardThankYou'

const CHAIN_IDS = [0x1]

export default function App() {
  const [status, setStatus] = useState('init');
  const [error, setError] = useState('There was an error processing your transaction. Please open a support ticket if it continues.');
  const PENDING_STATUSES = ["signing", "pending", "failed", "alreadyMinted", "unknownError"];
  const MINT_PRICE = '0.06'

  const [instance, setInstance] = useState();
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [address, setAddress] = useState();
  const [whitelistQuantity, setWhitelistQuantity] = useState();
  const [chainId, setChainId] = useState();

  const [contract, setContract] = useState();
  const [mintStatus, setMintStatus] = useState(0);
  const [tokenIds, setTokenIds] = useState();
  const [txHash, setTxHash] = useState();

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
        '0x810ff7073b98ff8706876750196c65a77C8bBAac',
        ContractArtifact.abi,
        provider
      )
      setContract(contract)
      setMintStatus(await contract.getMintStatus());

      const alreadyMinted = await contract.mintedWallets(accounts[0]);
      const whitelistedData = snapshot.filter(owner => owner.address === accounts[0])[0]
      if (whitelistedData) {
        alreadyMinted ? setStatus('alreadyMinted') : setWhitelistQuantity(whitelistedData["quantity"]);
      }

    } catch (error) {
      console.error(error);
    }
  }

  const getMessage = {
    closed: {header: 'Minting is Closed', message: 'Whitelist minting opens on Wednesday August 17th.'},
    wrongChain: {header: 'Wrong Network', message: 'Please switch to Ethereum Mainnet to mint.'},
    signing: {header: 'Signing Transaction', message: 'Please sign your transaction in Metamask.'},
    pending: {header: 'Pending Block Confirmation', message: 'Assuming network traffic is reasonable, everything should be confirmed in about 15 seconds. Please leave this window open while you wait.'},
    alreadyMinted: {header: 'You already minted!', message: `You've already used your whitelist spot. You'll be able to mint again if more are available in the public mint.`},
    unknownError: {header: 'Unexpected Error', message: error}
  }

  const presaleMint = async (proof, quantity) => {
    const balance = await contract.balanceOf(address);
    if (balance.toNumber() > 0) {
      setStatus('alreadyMinted');
      return
    }
    setStatus('signing')
    let tx;
    try {
      tx = await contract.connect(signer).whitelistMint(proof, quantity, {value: ethers.utils.parseEther(MINT_PRICE).mul(quantity)})
      setStatus('pending')
    } catch (err) {
      setError(err)
      setStatus('unknownError')
      console.log(err);
      return
    }
    
    const receipt = await tx.wait()
    _processReceipt(receipt);
  }

  const publicMint = async (quantity) => {
    setStatus('signing')
    let tx;
    try {
      tx = await contract.connect(signer).publicMint(quantity, {value: ethers.utils.parseEther(MINT_PRICE).mul(quantity)})
      setStatus('pending')
    } catch (err) {
      console.log(err)
      setError(err)
      setStatus('unknownError')
      return
    }
    
    const receipt = await tx.wait()
    _processReceipt(receipt);
  }

  const _processReceipt = (receipt) => {
    if (receipt.status === 0) {
      setError('There is no receipt for your transaction.')
      setStatus('unknownError')
    } else {
      try {
        setTxHash(receipt.transactionHash);
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
            <Navbar.Brand href="/">BeNFT: Vegas</Navbar.Brand>
            <Navbar.Text>{address && address.length ? 'Signed In As: ' + address.slice(0, 4) + '....' + address.slice(-4) : <Button variant="light" onClick={connectWallet}>Connect Wallet</Button>}</Navbar.Text>
          </Container>
        </Navbar>

        {!address || status !== "success" || mintStatus === 0 ? 
        
          <Card style={{ width: '32rem', margin: 'auto', marginTop: '8rem', zIndex: '1' }}>
            <Card.Body>
              <>{!address ? <CardLogIn /> : ""}</>
              <>{address && status === "init" && !CHAIN_IDS.includes(chainId) ? <CardMessage message={getMessage["wrongChain"]} /> : ""}</>
              <>{address && status === "init" && mintStatus === 0 && CHAIN_IDS.includes(chainId) ? <CardMessage message={getMessage["closed"]} /> : ""}</>
              <>{address && status === "init" && mintStatus === 1 && CHAIN_IDS.includes(chainId) ? <CardPresaleMint address={address} presaleMint={presaleMint} mintPrice={MINT_PRICE} whitelistQuantity={whitelistQuantity} /> : ""}</>
              <>{address && status === "init" && mintStatus === 2 && CHAIN_IDS.includes(chainId) ? <CardPublicMint publicMint={publicMint} mintPrice={MINT_PRICE} /> : ""}</>
              <>{address && PENDING_STATUSES.includes(status) && mintStatus > 0 ? <CardMessage message={getMessage[status]} /> : ""}</>
            </Card.Body>
          </Card>

          : <CardThankYou tokenIds={tokenIds} contractAddr={contract.address} txHash={txHash} />}
      </div>
    </div>
  );
}