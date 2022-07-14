import { useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';

export default function CardPublicMint({publicMint, mintPrice}) {
    const [quantity, setQuantity] = useState('');
    const [checked, setChecked] = useState(false);

    const handleChange = (event) => {
        event.preventDefault();
        const re = /^[0-9\b]+$/;
        if (event.target.value === '' || re.test(event.target.value)) {
            setQuantity(event.target.value);
        } 
    }

    return (
        <>
            <Card.Header as="h3" style={{textAlign: 'center', marginBottom: '1rem' }}>Mint Your Vegas BeNFT</Card.Header>
            <Form>
                <input type="checkbox" checked={checked} onClick={() => setChecked(!checked)} onChange={(e) => {}} />
                <span> By Minting you agree to the <a href="https://www.benmezrichnft.com/terms">Terms of Service</a> and acknowledge the <a href="https://www.benmezrichnft.com/privacy-policy">Privacy Policy</a>. 
                You also acknowledge that you will be required to opt into the <a href="https://www.benmezrichnft.com/screenplay-token-opt-in-agreement">Screenplay Token Opt In Agreement</a> in order to be eligible for the Screenplay Token Award.</span>
                <br /><br />
                <Form.Control type="text" placeholder="How many would you like to mint?" value={quantity} onChange={(e) => handleChange(e)} />
            </Form>
            <Button variant="primary" disabled={quantity === '' ? true : false} style={{margin: 'auto', marginTop: '1rem' }} onClick={() => publicMint(quantity)}>
                {quantity === '' ?
                    'Enter a Quantity to Mint' :
                    `Mint Your ${quantity} Vegas BeNFT${quantity > 1 ? 's' : ''}: ${quantity * mintPrice} ETH`}
            </Button>
        </>
    )
}

