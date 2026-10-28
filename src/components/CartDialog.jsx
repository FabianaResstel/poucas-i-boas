import { useEffect, useRef } from 'react'
import { formatPrice } from '../data/products.js'

function CartDialog({ items, onClose, onRemove, onContinueShopping }) {
  const dialogRef = useRef(null)
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
    return () => {
      if (dialog?.open) dialog.close()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className="app-dialog cart-dialog"
      aria-labelledby="cart-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <button className="dialog-close" type="button" onClick={onClose} aria-label="Fechar carrinho">×</button>
      <p className="dialog-eyebrow">Suas escolhas</p>
      <h2 id="cart-title">Carrinho</h2>

      {items.length === 0 ? (
        <p className="empty-cart">Seu carrinho está vazio.</p>
      ) : (
        <>
          <ul className="cart-items">
            {items.map(({ product, quantity }) => (
              <li className="cart-item" key={product.id}>
                <img src={product.image} alt="" />
                <div className="cart-item-copy">
                  <h3>{product.name}</h3>
                  <p>{quantity} × {formatPrice(product.price)}</p>
                </div>
                <button className="remove-item" type="button" onClick={() => onRemove(product.id)}>
                  Remover
                </button>
              </li>
            ))}
          </ul>
          <p className="cart-subtotal"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></p>
          <p className="checkout-note">As opções de pagamento e finalização da compra estarão disponíveis em breve.</p>
        </>
      )}

      <button className="primary-action" type="button" onClick={onContinueShopping}>
        Continuar comprando
      </button>
    </dialog>
  )
}

export default CartDialog
