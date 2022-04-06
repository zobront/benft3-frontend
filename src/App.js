// import { useEthereum } from "./providers/EthereumProvider"
// import { useContract } from "./providers/ContractProvider"
import { useState, useEffect } from 'react';

import { ethers } from 'ethers';
import { MerkleTree }  from 'merkletreejs';
import addressJson from './merkle/snapshot.json';

import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import WalletConnect from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";
import BeNFTArtifact from './providers/Artifact.json';

import { Button, Navbar, Container, Card, Spinner, Form } from 'react-bootstrap';

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

function App() {
  // const { signer, address, chainId } = useEthereum();
  // const contract = useContract();
  const [instance, setInstance] = useState();
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [address, setAddress] = useState();
  const [chainId, setChainId] = useState();
  const [contract, setContract] = useState();

  const [proof, setProof] = useState([]);
  const [status, setStatus] = useState('init');
  const [txHash, setTxHash] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [checked, setChecked] = useState(false);
  const [openSeaLink, setOpenSeaLink] = useState('http://opensea.io/');
  const [manualAddress, setManualAddress] = useState('');
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
   }, [])

  useEffect(() => {
    if (address) {
      const proof = getProof(address);
      setProof(proof);
    }
  }, [address]);

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
        '0xb19242eB66804044798EBBEbCD70F52EDa430498',
        BeNFTArtifact.abi,
        provider
      )
      setContract(contract)
    } catch (error) {
      console.error(error);
    }
  }

  const getProof = (inputAddr) => {
    const addresses = addressJson.map(o => o.Address);
    const leaves = addresses.map(addr => ethers.utils.keccak256(addr));
    const tree = new MerkleTree(leaves, ethers.utils.keccak256, { sortPairs: true });
    return tree.getHexProof(ethers.utils.keccak256(inputAddr));
  }

  const mintable = () => {
    return checked && proof.length > 0 && (chainId === 1 || chainId === '0x1');
  }

  const statusToMessage = () => {
    if (status === 'signing') {
      return {header: 'Signing Transaction', message: 'Please sign your transaction in Metamask.'};
    } else if (status === 'pending') {
      return {header: 'Pending Block Confirmation', message: 'Assuming network traffic is reasonable, everything should be confirmed in about 15 seconds.'};
    } else if (status === 'failed') {
      return {header: 'Failed', message: `The transaction seems to have failed. ${errorMessage}`};
    } else if (status === 'success') {
      return {header: 'Congrats!', message: 'You are the proud owner of a Bitcoin & Billionaires NFT. Give the links below a minute to load, then click them to reveal.'};
    }
  }

  const mint = async () => {
    const balance = await contract.balanceOf(address);
    if (balance.toNumber() > 0) {
      setStatus('failed');
      setErrorMessage('You already minted!');
      return
    }

    setStatus('signing')
    let tx;
    try {
      tx = await contract.connect(signer).mint(proof)
      setStatus('pending')
    } catch (err) {
      setErrorMessage(err.data ? err.data.message : err.message);
      setStatus('failed')
      return
    }
    
    const receipt = await tx.wait()
    if (receipt.status === 0) {
      setStatus('failed')
    } else {
      setTxHash(receipt.transactionHash)
      try {
        const tokenId = parseInt(receipt.events[0].args.tokenId)
        setOpenSeaLink(`https://opensea.io/assets/${contract.address}/${tokenId}`)
      } catch (err) {}
      setStatus('success')
    }
  }

  const copyManualProof = () => {
    try {
      const proofArray = getProof(manualAddress)
      if (proofArray.length === 0) {
        setCopyStatus('noproof');
        setTimeout(() => { setCopyStatus('')  }, 2000);
        return
      }
      let proofText = "[" + proofArray.map(o => o.toString()).join(",") + "]"
      navigator.clipboard.writeText(proofText)
      setCopyStatus('copied');
      setTimeout(() => { setCopyStatus('')  }, 2000);
    } catch (err) {
      setCopyStatus('error');
      setTimeout(() => { setCopyStatus('')  }, 2000);
    }
  }

  return (
    <div className="App">
      <div style={{ backgroundImage:`url(/background.png)`, backgroundRepeat:"no-repeat", backgroundSize:"cover", height: '100vh', width: '100vw' }}>
        <Navbar bg="dark" variant="dark">
          <Container>
            <Navbar.Brand href="/">Ben Mezrich Project: Bitcoin & Billionaires</Navbar.Brand>
            <Navbar.Text>{address && address.length ? 'Signed In As: ' + address.slice(0, 4) + '....' + address.slice(-4) : <Button variant="light" onClick={connectWallet}>Connect Wallet</Button>}</Navbar.Text>
          </Container>
        </Navbar>

        <Card style={{ width: '32rem', margin: 'auto', marginTop: '8rem', zIndex: '1' }}>
          <Card.Body>
            { status === 'init' ?
              <div>
                { address && chainId ?
                  <div>
                    {proof && proof.length > 0 ? 
                      <div>
                        <Card.Header as="h3" style={{textAlign: 'center', marginBottom: '1rem' }}>You Are On The Whitelist!</Card.Header>
                        <input type="checkbox" checked={checked} onClick={() => setChecked(!checked)} onChange={(e) => {}} />
                        <span> By Minting you agree to the <a href="https://www.benmezrichnft.com/terms">Terms of Service</a> and acknowledge the <a href="https://www.benmezrichnft.com/privacy-policy">Privacy Policy</a>. 
                        You also acknowledge that you will be required to opt into the <a href="https://www.benmezrichnft.com/screenplay-token-opt-in-agreement">Screenplay Token Opt In Agreement</a> in order to be eligible for the Screenplay Token Award.</span>
                        <br />
                        <Button variant="primary" style={{margin: 'auto', marginTop: '1rem' }} disabled={mintable() ? false : true } onClick={mint}>
                          {mintable() ? 
                            'Mint Your Free Bitcoin & Billionaires NFT' : 
                            <span>
                              {(chainId === 1 || chainId === '0x1') ?  'Please Agree to Terms & Conditions to Mint' : 'Wrong Network: Connect to Mainnet to Mint'}
                            </span>
                          }
                        </Button>
                      </div>
                      : 
                      <div>
                        <Card.Header as="h3" style={{textAlign: 'center', marginBottom: '1rem' }}>You Are Not On The Whitelist</Card.Header>
                        <Card.Text>According to our records, you aren't on the whitelist.</Card.Text>
                        <Card.Text>If you verified that you were on the snapshot list, please reach out to the mods for support.</Card.Text>
                      </div>
                    }
                  </div>
                  :
                  <div>
                    <Card.Header as="h3" style={{textAlign: 'center', marginBottom: '1rem' }}>Please Connect Your Wallet</Card.Header>
                    <div style={{ marginLeft: '45%', marginTop: '2rem', marginBottom: '2rem' }}>    
                      <Spinner animation="border" role="status"></Spinner>
                    </div>
                  </div>
                }
              </div>
            :
            <>
              <Card.Header as="h3" style={{textAlign: 'center', marginBottom: '1rem' }}>{statusToMessage(status).header}</Card.Header>
              <Card.Text style={{textAlign: 'center'}}>{statusToMessage(status).message}</Card.Text>
              { status === 'success' ? 
                <table>
                  <tbody>
                    <tr>
                      <td style={{padding: "10px"}}><a href={openSeaLink} rel="noreferrer" target="_blank">Check it out on OpenSea!</a></td>
                      <td style={{padding: "10px"}}><Card.Text><a href={`http://etherscan.io/tx/${txHash}`} rel="noreferrer" target="_blank">View Transaction on Etherscan</a></Card.Text></td>
                    </tr>
                    <tr style={{marginTop: "100 px"}}>
                      <td style={{textAlign: 'center'}}><img src="/opensea.png" width="100" height="100" href={openSeaLink} alt="" rel="noreferrer" target="_blank" /></td>
                      <td style={{textAlign: 'center'}}><img src="/etherscan.png" width="100" height="100" href={`http://etherscan.io/tx/${txHash}`} alt="" rel="noreferrer" target="_blank" /></td>
                    </tr>
                  </tbody>
                </table>
              : null }
            </>
            }
          </Card.Body>
        </Card>
        <div style={{
          backgroundColor: "rgba(255,255,255,.8)",
          textAlign: "center",
          padding: "20px",
          position: "fixed",
          left: "0",
          bottom: "0",
          height: "190px",
          width: "100%",
        }}>
          <h5 style={{margin: "0px"}}>Prefer to Mint on Etherscan? <a rel="noreferrer" target="_blank" href="https://www.loom.com/share/e01bd0f2e38248b6b13f944039d96ff2">(Walkthrough Video)</a></h5>
          <div style={{width: "60%", margin: 'auto'}}><hr /></div>
          <table style={{width: "100%"}}>
            <tbody>
            <tr>
              <td style={{textAlign: 'center'}}>Step 1:<h6>Enter Whitelisted Address</h6></td>
              <td style={{textAlign: 'center'}}>Step 2:<h6>Create Proof & Copy to Clipboard</h6></td>
              <td style={{textAlign: 'center'}}>Step 3:<h6>Input on Etherscan</h6></td>
            </tr>
            <tr>
              <td style={{width: "40%"}}><Form.Control placeholder="0x..." onChange={ (e) => setManualAddress(e.target.value) }></Form.Control></td>
              <td><Button 
                variant={!copyStatus ? 'primary' : copyStatus === 'copied' ? 'success' : 'danger'}
                style={{width: "60%", margin: "0 20px"}}
                onClick={() => copyManualProof()}>
                  {!copyStatus ? 'Copy Proof' : copyStatus === 'copied' ? 'Copied!' : copyStatus === 'error' ? 'Not A Valid Address!' : 'Not Whitelisted!'}
              </Button></td>
              <td><Button style={{width: "60%", textAlign: 'center', margin: "0 20px"}} href={ contract ? `http://etherscan.io/address/${contract.address}` : ''} rel="noreferrer" target="_blank">Contract</Button></td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;