import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button, Card } from 'react-bootstrap';

import { MerkleTree }  from 'merkletreejs';
import addressJson from './assets/snapshot.json';

export default function CardPresaleMint({address, presaleMint, mintPrice}) {
    const [proof, setProof] = useState([]);

    useEffect(() => {
        if (address) {
            setProof(getProof(address));
        }
    }, [address])

    const getProof = (inputAddr) => {
        const addresses = addressJson.map(o => o.Address);
        const leaves = addresses.map(addr => ethers.utils.keccak256(addr));
        const tree = new MerkleTree(leaves, ethers.utils.keccak256, { sortPairs: true });
        return tree.getHexProof(ethers.utils.keccak256(inputAddr));
    }

    return (
        <>
            {proof && proof.length > 0 ? 
                <div>
                <Card.Header as="h3" style={{textAlign: 'center', marginBottom: '1rem' }}>You Are On The Whitelist!</Card.Header>
                <Card.Text>The presale mint is open! Mint your Capitalist Pig NFTs for {mintPrice} ETH, and get access to the private investor community, deal flow, and other VIP perks.</Card.Text>
                <Button 
                    variant="primary" 
                    style={{margin: 'auto', marginTop: '1rem' }} 
                    onClick={presaleMint(proof)}>
                    {`Mint Your Capitalist Pig NFT for ${mintPrice} ETH`}
                </Button>
                </div>
                : 
                <div>
                <Card.Header as="h3" style={{textAlign: 'center', marginBottom: '1rem' }}>You Are Not On The Whitelist</Card.Header>
                <Card.Text>According to our records, you aren't on the whitelist.</Card.Text>
                <Card.Text>If you verified that you were on the snapshot list, please reach out to the mods for support.</Card.Text>
                </div>
            }
        </>
    )
}