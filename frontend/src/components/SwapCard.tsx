import { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import './SwapCard.css'

// Common token addresses on Ethereum Mainnet
const TOKENS = {
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    address: '0x0000000000000000000000000000000000000000'
  },
  WETH: {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  },
  DAI: {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F'
  }
}

export default function SwapCard() {
  const { account, provider, isActive } = useWeb3React()
  const [fromToken, setFromToken] = useState(TOKENS.ETH)
  const [toToken, setToToken] = useState(TOKENS.USDC)
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [isSwapping, setIsSwapping] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSwap = async () => {
    if (!isActive || !account || !provider) {
      setError('Please connect your wallet first')
      return
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setIsSwapping(true)
    setError('')
    setSuccess('')

    try {
      // In a real implementation, this would:
      // 1. Get pool data from Uniswap
      // 2. Calculate the swap route
      // 3. Execute the swap transaction
      
      // For demo purposes, we'll show a simulated swap
      setSuccess(`Swap initiated! Swapping ${fromAmount} ${fromToken.symbol} for ${toToken.symbol}`)
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSuccess(`Successfully swapped ${fromAmount} ${fromToken.symbol} for ${toToken.symbol}!`)
      setFromAmount('')
      setToAmount('')
    } catch (err: any) {
      console.error('Swap error:', err)
      setError(err.message || 'Failed to execute swap')
    } finally {
      setIsSwapping(false)
    }
  }

  const handleSwapDirection = () => {
    const tempToken = fromToken
    const tempAmount = fromAmount
    setFromToken(toToken)
    setToToken(tempToken)
    setFromAmount(toAmount)
    setToAmount(tempAmount)
  }

  const estimateOutput = (input: string) => {
    if (!input || parseFloat(input) <= 0) {
      setToAmount('')
      return
    }
    
    // Simple mock estimation (in real app, this would query Uniswap pools)
    const inputAmount = parseFloat(input)
    let rate = 1800 // Mock ETH/USD rate
    
    if (fromToken.symbol === 'ETH' && toToken.symbol === 'USDC') {
      setToAmount((inputAmount * rate).toFixed(2))
    } else if (fromToken.symbol === 'USDC' && toToken.symbol === 'ETH') {
      setToAmount((inputAmount / rate).toFixed(6))
    } else {
      setToAmount((inputAmount * 0.95).toFixed(6)) // Mock 5% slippage
    }
  }

  useEffect(() => {
    estimateOutput(fromAmount)
  }, [fromAmount, fromToken, toToken])

  return (
    <div className="swap-card">
      <div className="swap-header">
        <h2>Swap</h2>
      </div>

      {error && (
        <div className="message error-message">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="message success-message">
          ✅ {success}
        </div>
      )}

      <div className="token-input-container">
        <div className="token-input">
          <div className="input-header">
            <span className="input-label">From</span>
            <span className="balance">Balance: 0.00</span>
          </div>
          <div className="input-row">
            <input
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              disabled={isSwapping}
            />
            <select 
              value={fromToken.symbol} 
              onChange={(e) => setFromToken(TOKENS[e.target.value as keyof typeof TOKENS])}
              disabled={isSwapping}
              className="token-select"
            >
              {Object.values(TOKENS).map(token => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button 
          className="swap-direction-btn" 
          onClick={handleSwapDirection}
          disabled={isSwapping}
        >
          ↓
        </button>

        <div className="token-input">
          <div className="input-header">
            <span className="input-label">To</span>
            <span className="balance">Balance: 0.00</span>
          </div>
          <div className="input-row">
            <input
              type="number"
              placeholder="0.0"
              value={toAmount}
              readOnly
              disabled={isSwapping}
            />
            <select 
              value={toToken.symbol} 
              onChange={(e) => setToToken(TOKENS[e.target.value as keyof typeof TOKENS])}
              disabled={isSwapping}
              className="token-select"
            >
              {Object.values(TOKENS).map(token => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {toAmount && (
        <div className="swap-details">
          <div className="detail-row">
            <span>Rate</span>
            <span>1 {fromToken.symbol} ≈ {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(4)} {toToken.symbol}</span>
          </div>
        </div>
      )}

      <button
        className="swap-button"
        onClick={handleSwap}
        disabled={!isActive || isSwapping || !fromAmount || parseFloat(fromAmount) <= 0}
      >
        {!isActive ? 'Connect Wallet to Swap' : isSwapping ? 'Swapping...' : 'Swap'}
      </button>

      <div className="swap-info">
        <p>⚠️ This is a demo interface. Connect to mainnet to perform actual swaps.</p>
      </div>
    </div>
  )
}
