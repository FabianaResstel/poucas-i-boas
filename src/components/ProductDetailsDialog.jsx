import { useEffect, useRef, useState } from 'react'
import { formatPrice } from '../data/products.js'
import { productMedia } from '../data/productMedia.js'

function ProductDetailsDialog({ product, onClose, onAddToCart, onOpenCart }) {
  const dialogRef = useRef(null)
  const media = productMedia[product.id] ?? { images: [] }
  const gallery = [
    { src: product.image, label: 'Vista principal' },
    ...media.images,
  ]
  const [activeMedia, setActiveMedia] = useState({ type: 'image', ...gallery[0] })
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
    return () => {
      if (dialog?.open) dialog.close()
    }
  }, [])

  function addToCart() {
    onAddToCart(product)
    setAdded(true)
  }

  return (
    <dialog
      ref={dialogRef}
      className="app-dialog product-dialog"
      aria-labelledby={`details-title-${product.id}`}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <button className="dialog-close" type="button" onClick={onClose} aria-label="Fechar detalhes">
        ×
      </button>
      <div className="product-dialog-layout">
        <section className="product-gallery" aria-label={`Fotos e vídeo de ${product.name}`}>
          <div className="gallery-stage">
            {activeMedia.type === 'video' ? (
              <video key={activeMedia.src} src={activeMedia.src} controls playsInline>
                Seu navegador não consegue reproduzir este vídeo.
              </video>
            ) : (
              <img src={activeMedia.src} alt={`${product.name} — ${activeMedia.label}`} />
            )}
          </div>
          <div className="gallery-thumbnails" aria-label="Escolher uma vista">
            {gallery.map((item) => (
              <button
                key={item.src}
                className={`gallery-thumbnail${activeMedia.src === item.src && activeMedia.type === 'image' ? ' is-selected' : ''}`}
                type="button"
                onClick={() => setActiveMedia({ type: 'image', ...item })}
                aria-label={item.label}
                aria-pressed={activeMedia.src === item.src && activeMedia.type === 'image'}
              >
                <img src={item.src} alt="" />
              </button>
            ))}
            {media.video && (
              <button
                className={`video-thumbnail${activeMedia.type === 'video' ? ' is-selected' : ''}`}
                type="button"
                onClick={() => setActiveMedia({ type: 'video', src: media.video })}
                aria-pressed={activeMedia.type === 'video'}
              >
                ▶ Vídeo
              </button>
            )}
          </div>
        </section>

        <section className="product-detail-copy">
          <p className="dialog-eyebrow">Feita à mão</p>
          <h2 id={`details-title-${product.id}`}>{product.name}</h2>
          <p className="detail-price">{formatPrice(product.price)}</p>
          <p className="detail-description">{product.description}</p>

          <h3>Materiais</h3>
          <ul className="material-list">
            {product.materials.map((material) => <li key={material}>{material}</li>)}
          </ul>

          <div className="purchase-info">
            <p><strong>Formas de pagamento:</strong> Cartão de crédito, PayPal ou Pix.</p>
            <p><strong>Prazo de entrega:</strong> 7 a 15 dias úteis.</p>
          </div>

          <button className="primary-action" type="button" onClick={addToCart}>
            Adicionar ao carrinho
          </button>
          {added && (
            <div className="added-confirmation" role="status">
              <span>{product.name} foi adicionada ao carrinho.</span>
              <button className="text-action" type="button" onClick={onOpenCart}>Ver carrinho</button>
            </div>
          )}
        </section>
      </div>
    </dialog>
  )
}

export default ProductDetailsDialog
