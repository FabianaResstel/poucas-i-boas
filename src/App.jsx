import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import ProductGrid from './components/ProductGrid.jsx'
import ProductDetailsDialog from './components/ProductDetailsDialog.jsx'
import CartDialog from './components/CartDialog.jsx'
import AboutPage from './components/AboutPage.jsx'

function App() {
  const [activePage, setActivePage] = useState('shop')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0)

  useEffect(() => {
    const isAboutPage = activePage === 'about'
    document.title = isAboutPage
      ? 'Sobre mim | Poucas boas bolsas'
      : 'Poucas boas bolsas | Bolsas feitas à mão'

    document.querySelector('meta[name="description"]')?.setAttribute(
      'content',
      isAboutPage
        ? 'Conheça Francita e seu universo criativo de bolsas feitas à mão, com crochê, tricô, tecidos e bordados.'
        : 'Conheça as bolsas feitas à mão da Poucas boas bolsas. Peças únicas em tecido, crochê e tricô.',
    )
  }, [activePage])

  function addToCart(product) {
    setCartItems((items) => {
      const existing = items.find((item) => item.product.id === product.id)
      if (existing) {
        return items.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...items, { product, quantity: 1 }]
    })
  }

  function removeFromCart(productId) {
    setCartItems((items) => items.filter((item) => item.product.id !== productId))
  }

  return (
    <div className="page-frame" id="inicio">
      <div className="page-container">
        <div className="store-panel">
          <Header
            cartCount={cartCount}
            onOpenCart={() => setCartOpen(true)}
            activePage={activePage}
            onNavigate={setActivePage}
          />
          <main>
            {activePage === 'about' ? (
              <AboutPage onShopClick={() => setActivePage('shop')} />
            ) : (
              <ProductGrid onOpenProduct={setSelectedProduct} />
            )}
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
      {selectedProduct && (
        <ProductDetailsDialog
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
          onOpenCart={() => {
            setSelectedProduct(null)
            setCartOpen(true)
          }}
        />
      )}
      {cartOpen && (
        <CartDialog
          items={cartItems}
          onClose={() => setCartOpen(false)}
          onRemove={removeFromCart}
          onContinueShopping={() => setCartOpen(false)}
        />
      )}
    </div>
  )
}

export default App;
