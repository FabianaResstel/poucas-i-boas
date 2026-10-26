import { formatPrice } from '../data/products.js'

function ProductCard({ product }) {
  return (
    <article
      className="product-card"
      style={{ '--card-rotation': product.rotation }}
      aria-labelledby={`product-${product.id}`}
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
      <h2 id={`product-${product.id}`}>{product.name}</h2>
      <p className="product-price">{formatPrice(product.price)}</p>
    </article>
  )
}

export default ProductCard
