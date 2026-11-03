import { useState } from 'react'
import { formatPrice } from '../data/products.js'

const paymentMethods = [
  { id: 'card', label: 'Cartão de crédito', description: 'Pague com seu cartão de crédito.' },
  { id: 'paypal', label: 'PayPal', description: 'Use sua conta PayPal.' },
  { id: 'pix', label: 'Pix', description: 'Pague com Pix.' },
]

function CheckoutPage({ items, onBackToCart, onContinueShopping }) {
  const [paymentMethod, setPaymentMethod] = useState(null)
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <section className="checkout-page" aria-labelledby="checkout-title">
      <button className="checkout-back-link" type="button" onClick={onBackToCart}>
        ← Voltar ao carrinho
      </button>
      <div className="checkout-heading">
        <p className="dialog-eyebrow">Quase lá</p>
        <h1 id="checkout-title">Finalizar pedido</h1>
        <p>Esta é uma prévia da experiência de compra. Nenhum pagamento será processado.</p>
      </div>

      <div className="checkout-layout">
        <div className="checkout-forms">
          <section className="checkout-panel" aria-labelledby="delivery-title">
            <h2 id="delivery-title">Entrega</h2>
            <div className="checkout-field-grid">
              <label className="checkout-field checkout-field-full">
                Nome completo
                <input type="text" autoComplete="off" placeholder="Seu nome" />
              </label>
              <label className="checkout-field checkout-field-full">
                CEP
                <input type="text" inputMode="numeric" autoComplete="off" placeholder="00000-000" />
              </label>
              <label className="checkout-field checkout-field-full">
                Endereço e número
                <input type="text" autoComplete="off" placeholder="Rua, avenida e número" />
              </label>
              <label className="checkout-field checkout-field-full">
                Cidade / UF
                <input type="text" autoComplete="off" placeholder="Cidade / Estado" />
              </label>
            </div>
          </section>

          <section className="checkout-panel" aria-labelledby="payment-title">
            <h2 id="payment-title">Forma de pagamento</h2>
            <div className="payment-method-list">
              {paymentMethods.map((method) => (
                <label
                  className={`payment-method${paymentMethod === method.id ? ' is-selected' : ''}`}
                  key={method.id}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                  />
                  <span>
                    <strong>{method.label}</strong>
                    <small>{method.description}</small>
                  </span>
                </label>
              ))}
            </div>

            {paymentMethod === 'card' && (
              <div className="payment-preview" aria-label="Prévia dos dados do cartão">
                <label className="checkout-field checkout-field-full">
                  Nome no cartão
                  <input type="text" autoComplete="off" placeholder="Como aparece no cartão" />
                </label>
                <label className="checkout-field checkout-field-full">
                  Número do cartão
                  <input type="text" inputMode="numeric" autoComplete="off" placeholder="0000 0000 0000 0000" />
                </label>
                <div className="checkout-field-grid">
                  <label className="checkout-field">
                    Validade
                    <input type="text" inputMode="numeric" autoComplete="off" placeholder="MM/AA" />
                  </label>
                  <label className="checkout-field">
                    Código de segurança
                    <input type="text" inputMode="numeric" autoComplete="off" placeholder="CVV" />
                  </label>
                </div>
              </div>
            )}

            {paymentMethod === 'paypal' && (
              <div className="payment-preview payment-provider-preview" role="status">
                <strong>PayPal</strong>
                <p>Você poderá entrar na sua conta PayPal quando essa forma de pagamento estiver disponível.</p>
              </div>
            )}

            {paymentMethod === 'pix' && (
              <div className="payment-preview pix-preview" role="status">
                <div className="pix-code-placeholder" aria-hidden="true">PIX</div>
                <p>O código ou QR Code Pix será exibido aqui quando essa forma de pagamento estiver disponível.</p>
              </div>
            )}
          </section>
        </div>

        <aside className="checkout-panel order-summary" aria-labelledby="summary-title">
          <h2 id="summary-title">Resumo do pedido</h2>
          <ul className="checkout-items">
            {items.map(({ product, quantity }) => (
              <li className="checkout-item" key={product.id}>
                <img src={product.image} alt="" />
                <span className="checkout-item-copy">
                  <strong>{product.name}</strong>
                  <small>{quantity} × {formatPrice(product.price)}</small>
                </span>
                <strong>{formatPrice(product.price * quantity)}</strong>
              </li>
            ))}
          </ul>
          <p className="checkout-delivery"><strong>Prazo de entrega:</strong> 7 a 15 dias úteis.</p>
          <p className="checkout-total"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></p>
          <p className="checkout-shipping-note">O frete será definido na finalização da compra.</p>
          <button className="primary-action checkout-placeholder" type="button" disabled>
            Formas de pagamento em breve
          </button>
          <button className="checkout-continue-link" type="button" onClick={onContinueShopping}>
            Continuar comprando
          </button>
        </aside>
      </div>
    </section>
  )
}

export default CheckoutPage
