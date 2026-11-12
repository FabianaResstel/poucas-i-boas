import { useState } from 'react'
import { products as initialProducts, formatPrice } from '../data/products.js'
import { productMedia } from '../data/productMedia.js'
import './owner-dashboard.css'

const startingProducts = initialProducts.map((product) => ({
  ...product,
  weightGrams: '',
  media: productMedia[product.id] ?? { images: [], video: null },
}))

const startingOrders = [{
  id: 'DEMO-001',
  customer: 'Cliente demonstração',
  product: 'Bolsa Gaia',
  productImage: '/images/bolsa-gaia/frente.jpg',
  total: 415,
  payment: 'Pix',
  paymentStatus: 'Aguardando confirmação',
  orderStatus: 'Aguardando pagamento',
  shipping: 'PAC',
}]

const startingSettings = {
  pixKey: 'francitacollistet@hotmail.com',
  pixRecipient: '',
  originCep: '29090-030',
  boxLength: '30',
  boxWidth: '28',
  boxHeight: '5',
  boxWeight: '35',
  bagsPerBox: '2',
  freePacItems: '2',
  deliveryMin: '7',
  deliveryMax: '15',
}

const sections = [
  { id: 'overview', label: 'Visão geral', icon: '⌂' },
  { id: 'products', label: 'Bolsas', icon: '♡' },
  { id: 'orders', label: 'Pedidos', icon: '▤' },
  { id: 'settings', label: 'Configurações', icon: '⚙' },
]

function blankProduct() {
  return {
    id: '',
    name: '',
    price: '',
    description: '',
    materials: [],
    weightGrams: '',
    image: '',
    imageAlt: '',
    status: 'available',
    rotation: '0deg',
    media: { images: [], video: null },
  }
}

function OwnerDashboard({ onSignOut }) {
  const [section, setSection] = useState('overview')
  const [products, setProducts] = useState(startingProducts)
  const [orders, setOrders] = useState(startingOrders)
  const [settings, setSettings] = useState(startingSettings)
  const [editor, setEditor] = useState(null)
  const [materialText, setMaterialText] = useState('')
  const [notice, setNotice] = useState('')

  const availableCount = products.filter((product) => product.status === 'available').length
  const soldCount = products.filter((product) => product.status === 'sold').length
  const pendingCount = orders.filter((order) => order.paymentStatus === 'Aguardando confirmação').length

  function openEditor(product) {
    setEditor(product ? { ...product, media: { ...product.media, images: [...product.media.images] } } : blankProduct())
    setMaterialText(product?.materials.join(', ') ?? '')
    setNotice('')
  }

  function updateEditor(field, value) {
    setEditor((current) => ({ ...current, [field]: value }))
  }

  function saveProduct(event) {
    event.preventDefault()
    if (!editor.name.trim() || !editor.price || !editor.image) {
      setNotice('Preencha o nome, o preço e escolha uma foto principal.')
      return
    }

    const saved = {
      ...editor,
      id: editor.id || `demo-${Date.now()}`,
      name: editor.name.trim(),
      price: Number(editor.price),
      materials: materialText.split(',').map((item) => item.trim()).filter(Boolean),
      imageAlt: editor.name.trim(),
    }

    setProducts((current) => editor.id
      ? current.map((product) => product.id === editor.id ? saved : product)
      : [saved, ...current])
    setEditor(null)
    setNotice('Bolsa atualizada nesta prévia. A alteração não foi salva no site.')
    setSection('products')
  }

  function markSold(product) {
    const shouldMarkSold = window.confirm(`Marcar ${product.name} como vendida nesta prévia?`)
    if (!shouldMarkSold) return
    setProducts((current) => current.map((item) => item.id === product.id
      ? { ...item, status: 'sold' }
      : item))
    setNotice(`${product.name} aparece como vendida nesta prévia.`)
  }

  function confirmPix(orderId) {
    setOrders((current) => current.map((order) => order.id === orderId
      ? { ...order, paymentStatus: 'Pix confirmado', orderStatus: 'Em preparação' }
      : order))
  }

  function saveSettings(event) {
    event.preventDefault()
    setNotice('Configurações atualizadas nesta prévia. A alteração não foi salva no site.')
  }

  function selectMainImage(event) {
    const file = event.target.files?.[0]
    if (file) updateEditor('image', URL.createObjectURL(file))
  }

  function addGalleryImages(event) {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return
    setEditor((current) => ({
      ...current,
      media: {
        ...current.media,
        images: [...current.media.images, ...files.map((file) => ({
          src: URL.createObjectURL(file),
          label: file.name,
        }))],
      },
    }))
    event.target.value = ''
  }

  function setVideo(event) {
    const file = event.target.files?.[0]
    if (file) {
      setEditor((current) => ({
        ...current,
        media: { ...current.media, video: URL.createObjectURL(file) },
      }))
    }
  }

  return (
    <div className="owner-page">
      <div className="owner-shell">
        <header className="owner-topbar">
          <a className="owner-brand" href="/" aria-label="Voltar à loja">
            <img src="/images/logo/logo.JPG" alt="Poucas boas bolsas" />
            <span><strong>Poucas boas bolsas</strong><small>Painel da proprietária</small></span>
          </a>
          <div className="owner-account-actions">
            <button className="owner-text-button owner-signout-button" type="button" onClick={onSignOut}>Sair</button>
            <a className="owner-store-link" href="/">Ver loja ↗</a>
          </div>
        </header>

        <div className="owner-demo-note" role="status">
          <strong>Prévia do painel</strong>
          <span>As alterações são temporárias e não serão salvas no site.</span>
        </div>

        <div className="owner-layout">
          <nav className="owner-nav" aria-label="Navegação do painel">
            {sections.map((item) => (
              <button
                className={section === item.id ? 'owner-nav-link is-active' : 'owner-nav-link'}
                type="button"
                key={item.id}
                onClick={() => {
                  setSection(item.id)
                  setEditor(null)
                  setNotice('')
                }}
              >
                <span aria-hidden="true">{item.icon}</span>{item.label}
              </button>
            ))}
          </nav>

          <main className="owner-main">
            {notice && <p className="owner-notice" role="status">{notice}</p>}

            {section === 'overview' && (
              <section aria-labelledby="owner-title">
                <div className="owner-heading-row">
                  <div>
                    <p className="owner-eyebrow">Sua loja, com carinho</p>
                    <h1 id="owner-title">Olá, Francita <span aria-hidden="true">✦</span></h1>
                    <p className="owner-subtitle">Acompanhe as bolsas e os pedidos em um só lugar.</p>
                  </div>
                  <button className="owner-primary-button" type="button" onClick={() => { setSection('products'); openEditor(null) }}>
                    + Adicionar bolsa
                  </button>
                </div>

                <div className="owner-stat-grid">
                  <div className="owner-stat"><span>Bolsas cadastradas</span><strong>{products.length}</strong><small>Catálogo atual</small></div>
                  <div className="owner-stat"><span>Disponíveis</span><strong>{availableCount}</strong><small>Podem ser compradas</small></div>
                  <div className="owner-stat"><span>Aguardando Pix</span><strong>{pendingCount}</strong><small>Exemplo para esta prévia</small></div>
                </div>

                <div className="owner-content-grid">
                  <section className="owner-panel">
                    <div className="owner-panel-heading"><h2>Bolsas recentes</h2><button type="button" className="owner-text-button" onClick={() => setSection('products')}>Ver catálogo</button></div>
                    {products.slice(0, 4).map((product) => (
                      <div className="owner-product-row" key={product.id}>
                        <img src={product.image} alt="" />
                        <span><strong>{product.name}</strong><small>{product.status === 'sold' ? 'Vendida' : 'Disponível'}</small></span>
                        <b>{formatPrice(product.price)}</b>
                      </div>
                    ))}
                  </section>
                  <section className="owner-panel">
                    <div className="owner-panel-heading"><h2>Precisa de atenção</h2></div>
                    <div className="owner-task">
                      <span className="owner-task-dot" aria-hidden="true">•</span>
                      <span><strong>Confirmar pagamento Pix</strong><small>Exemplo de pedido aguardando conferência no banco.</small></span>
                    </div>
                    <button type="button" className="owner-text-button owner-task-link" onClick={() => setSection('orders')}>Abrir pedidos</button>
                    <p className="owner-muted-note">A confirmação real só estará disponível quando o backend estiver conectado.</p>
                  </section>
                </div>
              </section>
            )}

            {section === 'products' && (
              <section aria-labelledby="products-title">
                <div className="owner-heading-row">
                  <div><p className="owner-eyebrow">Catálogo</p><h1 id="products-title">Suas bolsas</h1><p className="owner-subtitle">Edite as informações e mídias de cada peça.</p></div>
                  <button className="owner-primary-button" type="button" onClick={() => openEditor(null)}>+ Adicionar bolsa</button>
                </div>

                {editor ? (
                  <form className="owner-panel owner-product-form" onSubmit={saveProduct}>
                    <div className="owner-panel-heading"><h2>{editor.id ? 'Editar bolsa' : 'Nova bolsa'}</h2><button type="button" className="owner-text-button" onClick={() => setEditor(null)}>Cancelar</button></div>
                    <label>Nome da bolsa<input value={editor.name} onChange={(event) => updateEditor('name', event.target.value)} placeholder="Ex.: Bolsa Afrodite" required /></label>
                    <div className="owner-form-grid">
                      <label>Preço (R$)<input type="number" min="0" step="0.01" value={editor.price} onChange={(event) => updateEditor('price', event.target.value)} required /></label>
                      <label>Peso da bolsa, sem embalagem (g)<input type="number" min="0" step="1" value={editor.weightGrams} onChange={(event) => updateEditor('weightGrams', event.target.value)} placeholder="Preencher quando souber" /></label>
                    </div>
                    <label>Descrição<textarea rows="4" value={editor.description} onChange={(event) => updateEditor('description', event.target.value)} /></label>
                    <label>Materiais <span>(separe por vírgulas)</span><input value={materialText} onChange={(event) => setMaterialText(event.target.value)} placeholder="Crochê, cetim, miçangas" /></label>
                    <label>Status<select value={editor.status} onChange={(event) => updateEditor('status', event.target.value)}><option value="available">Disponível</option><option value="sold">Vendida</option></select></label>

                    <fieldset className="owner-media-fieldset">
                      <legend>Fotos e vídeo</legend>
                      <div className="owner-media-preview"><img src={editor.image || '/images/logo/logo.JPG'} alt="Prévia da foto principal" /><label>Foto principal<input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectMainImage} /></label></div>
                      <label>Adicionar outras fotos<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addGalleryImages} /></label>
                      {editor.media.images.length > 0 && <div className="owner-extra-photos">{editor.media.images.map((image, index) => <img key={`${image.src}-${index}`} src={image.src} alt={image.label || 'Outra foto da bolsa'} />)}</div>}
                      <label>Adicionar ou substituir vídeo<input type="file" accept="video/mp4" onChange={setVideo} /></label>
                      {editor.media.video && <p className="owner-file-note">Vídeo selecionado ✓</p>}
                    </fieldset>
                    <button className="owner-primary-button" type="submit">Salvar bolsa (prévia)</button>
                  </form>
                ) : (
                  <section className="owner-panel">
                    <div className="owner-table-wrap">
                      <table className="owner-table">
                        <thead><tr><th>Bolsa</th><th>Preço</th><th>Status</th><th>Ações</th></tr></thead>
                        <tbody>{products.map((product) => (
                          <tr key={product.id}>
                            <td><span className="owner-table-product"><img src={product.image} alt="" /><strong>{product.name}</strong></span></td>
                            <td className="owner-price-cell">{formatPrice(product.price)}</td>
                            <td><span className={`owner-status ${product.status}`}>{product.status === 'sold' ? 'Vendida' : 'Disponível'}</span></td>
                            <td><div className="owner-row-actions"><button type="button" className="owner-text-button" onClick={() => openEditor(product)}>Editar</button>{product.status !== 'sold' && <button type="button" className="owner-text-button" onClick={() => markSold(product)}>Marcar vendida</button>}</div></td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                    <p className="owner-muted-note">{soldCount} bolsa(s) marcada(s) como vendida(s) nesta prévia.</p>
                  </section>
                )}
              </section>
            )}

            {section === 'orders' && (
              <section aria-labelledby="orders-title">
                <div className="owner-heading-row"><div><p className="owner-eyebrow">Vendas</p><h1 id="orders-title">Pedidos</h1><p className="owner-subtitle">Confira o pagamento e acompanhe a entrega.</p></div></div>
                {orders.length ? orders.map((order) => (
                  <article className="owner-panel owner-order" key={order.id}>
                    <div className="owner-order-heading"><div><span className="owner-order-number">{order.id} <span className="owner-demo-chip">exemplo</span></span><h2>{order.customer}</h2><small>Forma de pagamento: {order.payment} · Envio: {order.shipping}</small></div><strong>{formatPrice(order.total)}</strong></div>
                    <div className="owner-order-product"><img src={order.productImage} alt="" /><span>{order.product}</span></div>
                    <div className="owner-order-bottom"><span><small>Pagamento</small><strong>{order.paymentStatus}</strong></span><label>Status do pedido<select value={order.orderStatus} onChange={(event) => setOrders((current) => current.map((item) => item.id === order.id ? { ...item, orderStatus: event.target.value } : item))}><option>Aguardando pagamento</option><option>Em preparação</option><option>Enviado</option><option>Entregue</option><option>Cancelado</option></select></label>
                      {order.paymentStatus === 'Aguardando confirmação' && <button type="button" className="owner-primary-button" onClick={() => confirmPix(order.id)}>Confirmar Pix (prévia)</button>}
                    </div>
                    <p className="owner-muted-note">Pedido fictício para demonstrar a tela; nenhuma confirmação financeira será enviada ou registrada.</p>
                  </article>
                )) : <div className="owner-panel owner-empty"><h2>Nenhum pedido por enquanto</h2><p>Os novos pedidos aparecerão aqui quando o checkout estiver conectado.</p></div>}
              </section>
            )}

            {section === 'settings' && (
              <section aria-labelledby="settings-title">
                <div className="owner-heading-row"><div><p className="owner-eyebrow">Preferências da loja</p><h1 id="settings-title">Configurações</h1><p className="owner-subtitle">Informações para pagamento e embalagem.</p></div></div>
                <form className="owner-panel owner-settings-form" onSubmit={saveSettings}>
                  <h2>Pix</h2>
                  <label>Chave Pix<input value={settings.pixKey} onChange={(event) => setSettings({ ...settings, pixKey: event.target.value })} /></label>
                  <label>Nome que aparece ao pagador<input value={settings.pixRecipient} onChange={(event) => setSettings({ ...settings, pixRecipient: event.target.value })} placeholder="Nome da titular da chave" /></label>
                  <h2>Envio</h2>
                  <label>CEP de origem<input value={settings.originCep} onChange={(event) => setSettings({ ...settings, originCep: event.target.value })} /></label>
                  <div className="owner-form-grid owner-dimensions"><label>Comprimento (cm)<input type="number" value={settings.boxLength} onChange={(event) => setSettings({ ...settings, boxLength: event.target.value })} /></label><label>Largura (cm)<input type="number" value={settings.boxWidth} onChange={(event) => setSettings({ ...settings, boxWidth: event.target.value })} /></label><label>Altura (cm)<input type="number" value={settings.boxHeight} onChange={(event) => setSettings({ ...settings, boxHeight: event.target.value })} /></label></div>
                  <div className="owner-form-grid"><label>Peso da caixa (g)<input type="number" value={settings.boxWeight} onChange={(event) => setSettings({ ...settings, boxWeight: event.target.value })} /></label><label>Bolsas por caixa<input type="number" min="1" value={settings.bagsPerBox} onChange={(event) => setSettings({ ...settings, bagsPerBox: event.target.value })} /></label></div>
                  <div className="owner-form-grid"><label>Frete PAC grátis a partir de<input type="number" min="1" value={settings.freePacItems} onChange={(event) => setSettings({ ...settings, freePacItems: event.target.value })} /></label><span className="owner-settings-hint">O SEDEX continua pago.</span></div>
                  <div className="owner-form-grid"><label>Prazo mínimo (dias úteis)<input type="number" min="1" value={settings.deliveryMin} onChange={(event) => setSettings({ ...settings, deliveryMin: event.target.value })} /></label><label>Prazo máximo (dias úteis)<input type="number" min="1" value={settings.deliveryMax} onChange={(event) => setSettings({ ...settings, deliveryMax: event.target.value })} /></label></div>
                  <button className="owner-primary-button" type="submit">Salvar configurações (prévia)</button>
                </form>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default OwnerDashboard
