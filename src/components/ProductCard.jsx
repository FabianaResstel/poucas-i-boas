import { formatPrice } from '../data/products.js'

function ProductCard({ product, onOpen }) {
  return (
    <button
      className="product-card"
      style={{ '--card-rotation': product.rotation }}
      type="button"
      onClick={() => onOpen(product)}
      aria-label={`Ver detalhes de ${product.name}, ${formatPrice(product.price)}`}
    >
      <span className="clothespin" aria-hidden="true" />
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
