import { useState } from 'react'
import { formatPrice } from '../data/products.js'

const paymentMethods = [
  { id: 'card', label: 'Cartão de crédito', description: 'Pague com seu cartão de crédito.' },
  { id: 'paypal', label: 'PayPal', description: 'Use sua conta PayPal.' },
  { id: 'pix', label: 'Pix', description: 'Pague com Pix.' },
]

const shippingMethods = [
  { id: 'pac', label: 'PAC' },
  { id: 'sedex', label: 'SEDEX' },
]

function formatCep(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
}

function CheckoutPage({ items, settings, onBackToCart, onContinueShopping }) {
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [cep, setCep] = useState('')
  const [cepError, setCepError] = useState('')
  const [shippingStepComplete, setShippingStepComplete] = useState(false)
  const [selectedShipping, setSelectedShipping] = useState(null)
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)
  const freePacItems = Number(settings.freePacItems)
  const qualifiesForFreePac = itemCount >= freePacItems
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  function handleCepChange(event) {
    setCep(formatCep(event.target.value))
    setCepError('')
    setShippingStepComplete(false)
    setSelectedShipping(null)
  }

  function handleShippingSubmit(event) {
    event.preventDefault()
    const digits = cep.replace(/\D/g, '')

    if (digits.length !== 8) {
      setCepError('Confira o CEP. Digite os 8 números para continuar.')
      setShippingStepComplete(false)
      setSelectedShipping(null)
      return
    }

    setCepError('')
    setShippingStepComplete(true)
    setSelectedShipping(null)
  }

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
            <form onSubmit={handleShippingSubmit} noValidate>
              <div className="checkout-field-grid">
                <div className="checkout-field checkout-field-full">
                  <label htmlFor="delivery-cep">CEP</label>
                  <span className="checkout-cep-control">
                    <input
                      id="delivery-cep"
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      placeholder="00000-000"
                      value={cep}
                      onChange={handleCepChange}
                      aria-invalid={Boolean(cepError)}
                      aria-describedby={cepError ? 'cep-error' : 'cep-help'}
                    />
                    <button className="primary-action checkout-shipping-submit" type="submit">
                      Calcular frete
                    </button>
                  </span>
                </div>
              </div>
              {cepError ? (
                <p className="checkout-form-error" id="cep-error" role="alert">{cepError}</p>
              ) : (
                <p className="checkout-form-help" id="cep-help">Informe o CEP para ver as opções de envio.</p>
              )}
            </form>

            {shippingStepComplete && (
              <div className="checkout-shipping-results" aria-live="polite">
                <p className="checkout-preview-note">
                  Prévia: os valores e prazos reais aparecerão quando o cálculo de frete estiver conectado.
                </p>
                <fieldset className="checkout-shipping-methods">
                  <legend>Escolha a forma de envio</legend>
                  {shippingMethods.map((method) => (
                    <label
                      className={`checkout-shipping-method${selectedShipping === method.id ? ' is-selected' : ''}`}
                      key={method.id}
                    >
                      <input
                        type="radio"
                        name="shipping-method"
                        value={method.id}
                        checked={selectedShipping === method.id}
                        onChange={() => setSelectedShipping(method.id)}
                      />
                      <span className="checkout-shipping-method-copy">
                        <strong>Correios {method.label}</strong>
                        <small>
                          {method.id === 'pac' && qualifiesForFreePac
                            ? 'Frete grátis neste pedido'
                            : 'Preço e prazo após integração'}
                        </small>
                      </span>
                      <strong className="checkout-shipping-pending">
                        {method.id === 'pac' && qualifiesForFreePac ? 'Grátis' : 'A calcular'}
                      </strong>
                    </label>
                  ))}
                </fieldset>
                <p className="checkout-shipping-promo">
                  {qualifiesForFreePac
                    ? 'O PAC é grátis para este pedido. O SEDEX permanece pago.'
                    : `Na compra de ${freePacItems} ou mais bolsas, o frete PAC é grátis. O SEDEX permanece pago.`}
                </p>
              </div>
            )}

            {shippingStepComplete && (
              <div className="checkout-address-section" aria-labelledby="address-title">
                <h3 id="address-title">Dados para entrega</h3>
                <p className="checkout-form-help">Preencha o endereço onde deseja receber o pedido.</p>
                <div className="checkout-field-grid">
                  <label className="checkout-field checkout-field-full">
                    Nome completo
                    <input type="text" autoComplete="name" placeholder="Seu nome" />
                  </label>
                  <label className="checkout-field checkout-field-full">
                    Endereço e número
                    <input type="text" autoComplete="street-address" placeholder="Rua, avenida e número" />
                  </label>
                  <label className="checkout-field">
                    Bairro
                    <input type="text" autoComplete="address-level3" placeholder="Seu bairro" />
                  </label>
                  <label className="checkout-field">
                    Complemento <span className="checkout-optional">(opcional)</span>
                    <input type="text" autoComplete="address-line2" placeholder="Apto, bloco..." />
                  </label>
                  <label className="checkout-field checkout-field-full">
                    Cidade / UF
                    <input type="text" autoComplete="address-level2" placeholder="Cidade / Estado" />
                  </label>
                </div>
              </div>
            )}
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
                <img src={product.image} alt={product.imageAlt || product.name} />
                <span className="checkout-item-copy">
                  <strong>{product.name}</strong>
                  <small>{quantity} × {formatPrice(product.price)}</small>
                </span>
                <strong>{formatPrice(product.price * quantity)}</strong>
              </li>
            ))}
          </ul>
          <p className="checkout-delivery">
            <strong>Prazo de entrega:</strong>{' '}
            {selectedShipping
              ? `${settings.deliveryMin} a ${settings.deliveryMax} dias úteis, sujeito à cotação dos Correios.`
              : 'aguardando cotação do frete.'}
          </p>
          <p className="checkout-total"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></p>
          <p className="checkout-shipping-note">
            <span>Frete {selectedShipping ? `Correios ${selectedShipping.toUpperCase()}` : 'PAC ou SEDEX'}</span>
            <strong>
              {selectedShipping === 'pac' && qualifiesForFreePac
                ? 'Grátis'
                : selectedShipping
                  ? 'A calcular'
                  : 'Aguardando CEP'}
            </strong>
          </p>
          <p className="checkout-total checkout-order-total">
            <span>Total</span>
            <strong>
              {selectedShipping === 'pac' && qualifiesForFreePac
                ? formatPrice(subtotal)
                : selectedShipping
                  ? `${formatPrice(subtotal)} + frete`
                  : 'Subtotal + frete'}
            </strong>
          </p>
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
