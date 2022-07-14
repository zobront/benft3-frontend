import { Card } from 'react-bootstrap';

export default function CardThankYou({tokenIds, txHash, contractAddr}) {
    return (
        <Card style={{ width: '32rem', margin: 'auto', marginTop: '4rem', zIndex: '1' }}>
            <Card.Body>
                <Card.Header as="h3" style={{textAlign: 'center', marginBottom: '1rem' }}>You are now the owner of Vegas BeNFT
                            { tokenIds.length > 1 ? `s #${tokenIds.join(', ')}` : ` #${tokenIds[0]}`}!</Card.Header>
                <Card.Text style={{textAlign: 'center'}}>
                    Congratulations! Please give Etherscan and OpenSea a couple minutes to update their records, then click the links below to check out your new NFT.
                </Card.Text>
                <Card.Text style={{textAlign: 'center', margin: '2rem'}}>
                    <a href={`http://testnets.opensea.io/assets/${contractAddr}/${tokenIds[0]}`} alt="" rel="noreferrer" target="_blank" ><img src="/opensea.png" width="100" height="100" style={{marginRight: '1rem'}} /></a>
                    <a href={`http://rinkeby.etherscan.io/tx/${txHash}`} alt="" rel="noreferrer" target="_blank"><img src="/etherscan.png" width="100" height="100" style={{marginLeft: '1rem'}} /></a>
                </Card.Text>
            </Card.Body>
        </Card>
    )
}