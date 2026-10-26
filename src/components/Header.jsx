function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#inicio" aria-label="Poucas boas bolsas — início">
        <img src="/images/logo/logo.JPG" alt="Poucas boas bolsas" />
      </a>

      <nav className="primary-nav" aria-label="Navegação principal">
        <a className="nav-link is-active" href="#loja" aria-current="page">
          Loja
        </a>
        <button className="nav-link" type="button" disabled>
          Sobre mim
        </button>
        <button
          className="cart-button"
          type="button"
          aria-label="Carrinho, 0 itens"
          disabled
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
            0
          </span>
        </button>
      </nav>
    </header>
  )
}

export default Header
