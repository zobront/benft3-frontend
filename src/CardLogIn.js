import { Card, Spinner } from 'react-bootstrap';

export default function CardLogIn() {
    return (
        <div>
            <Card.Header as="h3" style={{textAlign: 'center', marginBottom: '1rem' }}>Please Connect Your Wallet</Card.Header>
            <div style={{ marginLeft: '45%', marginTop: '2rem', marginBottom: '2rem' }}>    
            <Spinner animation="border" role="status"></Spinner>
            </div>
        </div>
    )
}