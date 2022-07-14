import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button, Card, Form } from 'react-bootstrap';

import { MerkleTree }  from 'merkletreejs';
import addressJson from './assets/snapshot.json';

export default function CardPresaleMint({address, presaleMint, mintPrice}) {
    const [proof, setProof] = useState([]);
    const [quantity, setQuantity] = useState('');
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (address) {
            setProof(getProof(address));
        }
    }, [address])

    const handleChange = (event) => {
        event.preventDefault();
        const re = /^[0-9\b]+$/;
        if (event.target.value === '' || re.test(event.target.value)) {
            setQuantity(event.target.value);
        } 
    }

    const createLeaf = (owner) => {
        return Buffer.from(ethers.utils.solidityKeccak256(['uint256', 'address'], [owner['quantity'], owner['address']]).slice(2), 'hex')
    }
    
    const getProof = (inputAddr) => {
        const leaves = addressJson.map(owner => createLeaf(owner));
        const tree = new MerkleTree(leaves, ethers.utils.keccak256, { sortPairs: true });
        return tree.getHexProof(createLeaf({"address": inputAddr, "quantity": 1 }));
    }

    return (
        <>
            {proof && proof.length > 0 ? 
                <div>
                    <Card.Header as="h3" style={{textAlign: 'center', marginBottom: '1rem' }}>You Are On The Whitelist!</Card.Header>
                    <Form>
                        <input type="checkbox" checked={checked} onClick={() => setChecked(!checked)} onChange={(e) => {}} />
                        <span> By Minting you agree to the <a href="https://www.benmezrichnft.com/terms">Terms of Service</a> and acknowledge the <a href="https://www.benmezrichnft.com/privacy-policy">Privacy Policy</a>. 
                        You also acknowledge that you will be required to opt into the <a href="https://www.benmezrichnft.com/screenplay-token-opt-in-agreement">Screenplay Token Opt In Agreement</a> in order to be eligible for the Screenplay Token Award.</span>
                        <br /><br />
                        <Form.Control type="text" placeholder="How many would you like to mint?" value={quantity} onChange={(e) => handleChange(e)} />
                    </Form>
                    <Button variant="primary" disabled={quantity === '' || !checked ? true : false} style={{margin: 'auto', marginTop: '1rem' }} onClick={() => presaleMint(quantity)}>
                        {quantity === '' ?
                            'Enter a Quantity to Mint' :
                            `Mint Your ${quantity} Vegas BeNFT${quantity > 1 ? 's' : ''}: ${quantity * mintPrice} ETH`}
                    </Button>                
                </div>
                : 
                <div>
                    <Card.Header as="h3" style={{textAlign: 'center', marginBottom: '1rem' }}>You Are Not On The Whitelist</Card.Header>
                    <Card.Text>According to our records, you aren't on the whitelist.</Card.Text>
                    <Card.Text>If you verified that you were listed in the snapshot CSV, please reach out to the mods for support.</Card.Text>
                </div>
            }
        </>
    )
}