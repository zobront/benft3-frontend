import { Card } from 'react-bootstrap';

export default function CardMessage({message}) {
    return (
        <>
            <Card.Header as="h3" style={{textAlign: 'center', marginBottom: '1rem' }}>{message.header}</Card.Header>
            <Card.Text>{message.message}</Card.Text>
        </>
        
    )
}
