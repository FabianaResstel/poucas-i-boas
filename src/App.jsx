import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import ProductGrid from './components/ProductGrid.jsx'
import ProductDetailsDialog from './components/ProductDetailsDialog.jsx'
import CartDialog from './components/CartDialog.jsx'
import AboutPage from './components/AboutPage.jsx'
import CheckoutPage from './components/CheckoutPage.jsx'
import OwnerAccess from './components/OwnerAccess.jsx'
import { products as staticProducts } from './data/products.js'
import { productMedia } from './data/productMedia.js'

const defaultStoreSettings = {
  pixKey: 'francitacollistet@hotmail.com',
  pixRecipient: '',
  originCep: '29090-030',
  boxLength: '30',
  boxWidth: '28',
  boxHeight: '5',
  boxWeight: '35',
  bagsPerBox: '2',
  freePacItems: '2',
  deliveryMin: '7',
  deliveryMax: '15',
}

function App() {
  const isOwnerRoute = window.location.pathname.replace(/\/$/, '') === '/admin'
  const hasIdentityCallback = /(?:invite_token|access_token|confirmation_token|recovery_token|email_change_token)=/.test(window.location.hash)
  const [activePage, setActivePage] = useState('shop')
  const [products, setProducts] = useState(() => staticProducts.map((product) => ({
    ...product,
    media: productMedia[product.id] ?? { images: [], video: null },
  })))
  const [storeSettings, setStoreSettings] = useState(defaultStoreSettings)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0)

  useEffect(() => {
    if (isOwnerRoute || hasIdentityCallback) return undefined

    let isMounted = true
    fetch('/api/products')
      .then((response) => (response.ok ? response.json() : null))
      .then((savedProducts) => {
        if (isMounted && Array.isArray(savedProducts)) setProducts(savedProducts)
      })
      .catch(() => {})

    fetch('/api/settings')
      .then((response) => (response.ok ? response.json() : null))
      .then((savedSettings) => {
        if (isMounted && savedSettings) setStoreSettings(savedSettings)
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [isOwnerRoute, hasIdentityCallback])

  useEffect(() => {
    if (isOwnerRoute || hasIdentityCallback) {
      document.title = 'Painel da proprietária | Poucas boas bolsas'
      return
    }

    const pageMetadata = {
      shop: {
        title: 'Poucas boas bolsas | Bolsas feitas à mão',
        description: 'Conheça as bolsas feitas à mão da Poucas boas bolsas. Peças únicas em tecido, crochê e tricô.',
      },
      about: {
        title: 'Sobre mim | Poucas boas bolsas',
        description: 'Conheça Francita e seu universo criativo de bolsas feitas à mão, com crochê, tricô, tecidos e bordados.',
      },
      checkout: {
        title: 'Finalizar pedido | Poucas boas bolsas',
        description: 'Revise seu pedido e veja as opções de pagamento da Poucas boas bolsas.',
      },
    }
    const { title, description } = pageMetadata[activePage] ?? pageMetadata.shop
    document.title = title

    document.querySelector('meta[name="description"]')?.setAttribute(
      'content',
      description,
    )
  }, [activePage, isOwnerRoute, hasIdentityCallback])

  function addToCart(product) {
    if ((product.status ?? 'available') !== 'available') return false

    setCartItems((items) => {
      const existing = items.find((item) => item.product.id === product.id)
      if (existing) {
        return items.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...items, { product, quantity: 1 }]
    })
    return true
  }

  function removeFromCart(productId) {
    setCartItems((items) => items.filter((item) => item.product.id !== productId))
  }

  if (isOwnerRoute || hasIdentityCallback) return <OwnerAccess />

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
          <p className="shipping-promo-banner">
            Na compra de {storeSettings.freePacItems} ou mais bolsas, o frete PAC é grátis. 10% de desconto no PIX.
          </p>
          <main>
            {activePage === 'about' ? (
              <AboutPage onShopClick={() => setActivePage('shop')} />
            ) : activePage === 'checkout' ? (
              <CheckoutPage
                items={cartItems}
                settings={storeSettings}
                onBackToCart={() => {
                  setActivePage('shop')
                  setCartOpen(true)
                }}
                onContinueShopping={() => setActivePage('shop')}
              />
            ) : (
              <ProductGrid products={products} onOpenProduct={setSelectedProduct} />
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
          <p className="portfolio-credit">
            Site desenvolvido por{' '}
            <a
              href="https://fabianaresstel-portfolio.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Fabiana Resstel
            </a>
          </p>
        </footer>
      </div>
      {selectedProduct && (
        <ProductDetailsDialog
          product={selectedProduct}
          settings={storeSettings}
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
          freePacItems={Number(storeSettings.freePacItems)}
          onClose={() => setCartOpen(false)}
          onRemove={removeFromCart}
          onContinueShopping={() => setCartOpen(false)}
          onCheckout={() => {
            setCartOpen(false)
            setActivePage('checkout')
          }}
        />
      )}
    </div>
  )
}

export default App;
