import { products } from '../data/products.js'
import ProductCard from './ProductCard.jsx'

function ProductGrid({ onOpenProduct }) {
  return (
    <section className="shop-page" id="loja" aria-labelledby="shop-title">
      <div className="shop-intro">
        <h1 id="shop-title">Bolsas feitas à mão</h1>
        <p>Cada peça é única: tecido, crochê e tricô no mesmo desenho.</p>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onOpen={onOpenProduct} />
        ))}
      </div>
    </section>
  )
}

export default ProductGrid
