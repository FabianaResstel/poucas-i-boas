import { formatPrice } from '../data/products.js'

function ProductCard({ product, onOpen }) {
  const status = product.status ?? 'available'
  const statusLabel = status === 'sold' ? 'Vendida' : status === 'reserved' ? 'Reservada' : null

  return (
    <button
      className="product-card"
      style={{ '--card-rotation': product.rotation }}
      type="button"
      onClick={() => onOpen(product)}
      aria-label={`Ver detalhes de ${product.name}, ${formatPrice(product.price)}${statusLabel ? `, ${statusLabel.toLowerCase()}` : ''}`}
    >
      <span className="clothespin" aria-hidden="true" />
      {statusLabel && (
        <span className={`product-status-badge is-${status}`}>
          {statusLabel}
        </span>
      )}
      <img
        className="product-image"
        src={product.image}
        alt={product.imageAlt}
        loading="lazy"
        width="320"
        height="360"
      />
      <span className="product-card-name">{product.name}</span>
      <span className="product-price">{formatPrice(product.price)}</span>
    </button>
  )
}

export default ProductCard
