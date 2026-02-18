import { ReactNode } from 'react'
import { Web3ReactProvider } from '@web3-react/core'
import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'

interface WalletProviderProps {
  children: ReactNode
}

const [metaMask, hooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions })
)

const connectors: [MetaMask, typeof hooks][] = [[metaMask, hooks]]

export default function WalletProvider({ children }: WalletProviderProps) {
  return (
    <Web3ReactProvider connectors={connectors}>
      {children}
    </Web3ReactProvider>
  )
}
