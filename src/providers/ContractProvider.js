import { ethers } from "ethers"
import { createContext, useContext, useEffect, useState } from "react"

import BeNFTArtifact from './Artifact.json';
import { useEthereum } from "./EthereumProvider"

const ContractContext = createContext()

const ContractProvider = (props) => {
  const { provider } = useEthereum()
  const [contract, setContract] = useState()

  useEffect(() => {
    setContract(new ethers.Contract(
      '0xB790e2Bb937e5A5FBd587bf9b327020866D94DE1',
      BeNFTArtifact.abi,
      provider
    )
  )}, [])

  return <ContractContext.Provider value={contract} {...props} />
}

export const useContract = () => {
  return useContext(ContractContext)
}

export default ContractProvider