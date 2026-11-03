function Header({ cartCount, onOpenCart, activePage, onNavigate }) {
  return (
    <header className="site-header">
      <button
        className="brand"
        type="button"
        onClick={() => onNavigate('shop')}
        aria-label="Poucas boas bolsas — início"
      >
        <img src="/images/logo/logo.JPG" alt="Poucas boas bolsas" />
      </button>

      <nav className="primary-nav" aria-label="Navegação principal">
        <button
          className={`nav-link${activePage === 'shop' ? ' is-active' : ''}`}
          type="button"
          aria-current={activePage === 'shop' ? 'page' : undefined}
          onClick={() => onNavigate('shop')}
        >
          Loja
        </button>
        <button
          className={`nav-link${activePage === 'about' ? ' is-active' : ''}`}
          type="button"
          aria-current={activePage === 'about' ? 'page' : undefined}
          onClick={() => onNavigate('about')}
        >
          Sobre mim
        </button>
        <button
          className="cart-button"
          type="button"
          aria-label={`Carrinho, ${cartCount} ${cartCount === 1 ? 'item' : 'itens'}`}
          onClick={onOpenCart}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="23"
            height="23"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 4h2l2.2 10.1a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6" />
            <circle cx="10" cy="20" r="1" />
            <circle cx="18" cy="20" r="1" />
          </svg>
          <span className="cart-count" aria-hidden="true">
            {cartCount}
          </span>
        </button>
      </nav>
    </header>
  )
}

export default Header
