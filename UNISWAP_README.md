# Uniswap Integration Web App

A responsive web application that integrates with Uniswap for swapping tokens on the blockchain with a clean and modern interface.

## 🚀 Features

- **Wallet Connection**: Connect your MetaMask wallet to interact with the blockchain
- **Token Swapping**: Swap between popular tokens (ETH, WETH, USDC, USDT, DAI)
- **Responsive Design**: Clean, modern UI that works on desktop, tablet, and mobile
- **Real-time Estimates**: Get instant swap rate estimates
- **User-Friendly**: Intuitive interface with loading states and error handling

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20 or higher
- **npm**: Comes with Node.js
- **MetaMask**: Browser extension for connecting your wallet

## 🛠️ Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/garantor/ai-dev-team.git
   cd ai-dev-team
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

## 📦 Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## 🏗️ Project Structure

```
ai-dev-team/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx          # Header with wallet connection
│   │   │   ├── SwapCard.tsx        # Main swap interface
│   │   │   ├── Footer.tsx          # Footer component
│   │   │   └── WalletProvider.tsx  # Web3 provider wrapper
│   │   ├── App.tsx                 # Main app component
│   │   ├── main.tsx                # Entry point
│   │   └── index.css               # Global styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── package.json
└── README.md
```

## 🔧 Technologies Used

- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Uniswap SDK**: Integration with Uniswap protocol
  - `@uniswap/sdk-core`: Core Uniswap SDK
  - `@uniswap/v3-sdk`: Uniswap V3 protocol integration
- **Web3 React**: Wallet connection management
  - `@web3-react/core`: Core Web3 React functionality
  - `@web3-react/metamask`: MetaMask connector
- **Ethers.js**: Ethereum interaction library

## 💡 Usage

### Connecting Your Wallet

1. Click the "Connect Wallet" button in the header
2. Approve the connection in your MetaMask extension
3. Your wallet address will be displayed once connected

### Swapping Tokens

1. Select the token you want to swap from in the "From" dropdown
2. Enter the amount you want to swap
3. Select the token you want to receive in the "To" dropdown
4. Review the estimated output amount
5. Click "Swap" to initiate the transaction
6. Confirm the transaction in MetaMask

### Supported Tokens

- **ETH**: Ethereum
- **WETH**: Wrapped Ether
- **USDC**: USD Coin
- **USDT**: Tether USD
- **DAI**: Dai Stablecoin

## ⚠️ Important Notes

- **Demo Mode**: This is currently a demonstration interface. The swap functionality simulates transactions.
- **Mainnet**: To perform actual swaps, ensure you're connected to Ethereum Mainnet
- **Gas Fees**: Real swaps require ETH for gas fees
- **Security**: Never share your private keys or seed phrase

## 🔐 Security

- All wallet interactions are handled through MetaMask
- No private keys are stored or transmitted
- Smart contract interactions follow Uniswap's security best practices

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Tokens

To add new tokens, edit the `TOKENS` object in `frontend/src/components/SwapCard.tsx`:

```typescript
const TOKENS = {
  YOUR_TOKEN: {
    symbol: 'TOKEN',
    name: 'Token Name',
    decimals: 18,
    address: '0x...'
  }
}
```

## 📝 Future Enhancements

- [ ] Real Uniswap V3 pool integration
- [ ] Historical transaction list
- [ ] Price charts and analytics
- [ ] Multiple wallet support (WalletConnect, Coinbase Wallet)
- [ ] Slippage tolerance settings
- [ ] Multi-chain support (Polygon, Arbitrum, Optimism)
- [ ] Token search and custom token imports

## 🤝 Contributing

This project follows the AI Dev Team workflow. See the [AI Team Guide](docs/AI_TEAM_GUIDE.md) for contribution guidelines.

## 📄 License

MIT

## 🆘 Support

For issues or questions:
- Create an issue on [GitHub Issues](https://github.com/garantor/ai-dev-team/issues)
- Check the [Documentation](docs/)

## 🙏 Acknowledgments

- [Uniswap](https://uniswap.org) - Decentralized exchange protocol
- [Vite](https://vitejs.dev) - Build tool
- [React](https://react.dev) - UI framework
- [Web3 React](https://github.com/Uniswap/web3-react) - Wallet connection library
