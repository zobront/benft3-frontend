import { useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';

export default function CardPublicMint({publicMint, mintPrice}) {
    const [quantity, setQuantity] = useState('');

    const handleChange = (event) => {
        event.preventDefault();
        setQuantity(event.target.value);
    }

    return (
        <>
            <Card.Header as="h3" style={{textAlign: 'center', marginBottom: '1rem' }}>Join the Pig Pen</Card.Header>
            <Card.Text>The public mint is open! Mint your Capitalist Pig NFTs for {mintPrice} ETH each, and get access to the private investor community, deal flow, and other VIP perks.</Card.Text>
            <Form>
                <Form.Control type="text" placeholder="How many would you like to mint?" value={quantity} onChange={(e) => handleChange(e)} />
            </Form>
            <Button variant="primary" disabled={quantity === '' ? true : false} style={{margin: 'auto', marginTop: '1rem' }} onClick={() => publicMint(quantity)}>
                {quantity === '' ?
                    'Enter a Quantity to Mint' :
                    `Mint Your ${quantity} Capitalist Pig NFT${quantity > 1 ? 's' : ''}: ${quantity * mintPrice} ETH`}
            </Button>
        </>
    )
}

