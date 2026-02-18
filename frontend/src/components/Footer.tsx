import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>Powered by Uniswap Protocol</p>
        <p className="footer-links">
          <a href="https://uniswap.org" target="_blank" rel="noopener noreferrer">
            Learn More
          </a>
          {' • '}
          <a href="https://docs.uniswap.org" target="_blank" rel="noopener noreferrer">
            Documentation
          </a>
        </p>
      </div>
    </footer>
  )
}
