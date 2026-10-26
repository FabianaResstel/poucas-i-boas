import Header from './components/Header.jsx'
import ProductGrid from './components/ProductGrid.jsx'

function App() {
  return (
    <div className="page-frame" id="inicio">
      <div className="page-container">
        <div className="store-panel">
          <Header />
          <main>
            <ProductGrid />
          </main>
        </div>

        <footer className="site-footer" aria-label="Redes sociais">
          <a
            className="instagram-link"
            href="https://instagram.com/poucasiboasbolsas"
            target="_blank"
            rel="noreferrer"
          >
            Instagram @poucasiboasbolsas
          </a>
          <a
            className="whatsapp-link"
            href="https://wa.me/5527995055326"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Fale com a Poucas boas bolsas pelo WhatsApp"
          >
            WhatsApp
          </a>
        </footer>
      </div>
    </div>
  )
}

export default App;
