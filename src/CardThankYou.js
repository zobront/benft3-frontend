import { Card, CardGroup, Form, Button } from 'react-bootstrap';
import { useState } from 'react';

export default function CardThankYou({tokenIds, address, contractAddr}) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const submitInfo = async (e) => {
        e.preventDefault();
        console.log(
            `New Pig Purchased!
            Buyer: ${name}
            Email: ${email}
            Address: ${address}
            Quantity: ${tokenIds.length} (${tokenIds.join(', ')}))`
        )
        setMessage("Thank you! We'll be in touch soon!");
    }

    return (
        <Card style={{ width: '48rem', margin: 'auto', marginTop: '4rem', zIndex: '1' }}>
            <Card.Body>
            <Card.Header as="h3" style={{textAlign: 'center', marginBottom: '1rem' }}>Welcome to the Pig Pen!</Card.Header>
                <CardGroup>
                    <Card>
                        <Card.Body>
                        <Card.Text style={{textAlign: 'center'}}>You are now the owner of Pig
                            { tokenIds.length > 1 ? `s #${tokenIds.join(', ')}` : ` #${tokenIds[0]}`}.   
                        </Card.Text>
                        <a href={`http://testnets.opensea.io/assets/${contractAddr}/${tokenIds[0]}`}><Card.Img variant="bottom" src={`0${tokenIds[0] > 9 ? '' : '0'}${tokenIds[0]}.png`} /></a>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Body>
                            <Card.Text>Please provide your contact information so we can send you details on next steps.</Card.Text>
                            <Card.Text>(If you'd rather stay anonymous, check Ryan's Facebook shortly for the Discord link.)</Card.Text>
                            <Form>
                                <Form.Group style={{marginBottom: "15px"}}>
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} />
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                                    <Form.Label>Ethereum Address</Form.Label>
                                    <Form.Control type="text" value={address} readOnly />
                                </Form.Group>
                                <Button variant="primary" type="submit" onClick={(e) => submitInfo(e)}>Submit</Button>
                            </Form>
                            <Card.Text>{message}</Card.Text>
                        </Card.Body>
                    </Card>
                </CardGroup>     
            </Card.Body>      
        </Card>
    )
}