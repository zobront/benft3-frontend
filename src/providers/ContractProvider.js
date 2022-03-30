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
      '0xb19242eB66804044798EBBEbCD70F52EDa430498',
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