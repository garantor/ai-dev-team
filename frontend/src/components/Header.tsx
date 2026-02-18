import { useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import './Header.css'

const [metaMask] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions })
)

export default function Header() {
  const { account, isActive, connector } = useWeb3React()
  const [isConnecting, setIsConnecting] = useState(false)

  const connectWallet = async () => {
    try {
      setIsConnecting(true)
      await metaMask.activate(1) // Ethereum Mainnet
    } catch (error) {
      console.error('Error connecting wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      if (connector?.deactivate) {
        await connector.deactivate()
      } else {
        await connector.resetState()
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#FF007A"/>
            <path d="M16 8L8 16L16 24L24 16L16 8Z" fill="white"/>
          </svg>
          <span>Uniswap DEX</span>
        </div>
        <div className="wallet-section">
          {isActive && account ? (
            <div className="wallet-info">
              <div className="wallet-address">{formatAddress(account)}</div>
              <button onClick={disconnectWallet} className="disconnect-btn">
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={connectWallet} 
              disabled={isConnecting}
              className="connect-btn"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
