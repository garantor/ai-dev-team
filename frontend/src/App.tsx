import Header from './components/Header'
import SwapCard from './components/SwapCard'
import Footer from './components/Footer'
import WalletProvider from './components/WalletProvider'
import './App.css'

function App() {
  return (
    <WalletProvider>
      <div className="app">
        <Header />
        <main className="main-content">
          <div className="container">
            <h1 className="title">Swap Tokens</h1>
            <p className="subtitle">Trade tokens in an instant with the best rates</p>
            <SwapCard />
          </div>
        </main>
        <Footer />
      </div>
    </WalletProvider>
  )
}

export default App
