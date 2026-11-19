import { useEffect, useState } from 'react'
import { formatPrice } from '../data/products.js'
import './owner-dashboard.css'

const sections = [
  { id: 'overview', label: 'Visão geral', icon: '⌂' },
  { id: 'products', label: 'Bolsas', icon: '♡' },
  { id: 'orders', label: 'Pedidos', icon: '▤' },
  { id: 'settings', label: 'Configurações', icon: '⚙' },
]

const shippingApiUrl = 'https://poucas-i-boas-api.poucaseboaswebsite.workers.dev'

function getIdentityAccessToken() {
  const tokenCookie = document.cookie.split('; ').find((cookie) => cookie.startsWith('nf_jwt='))
  if (!tokenCookie) return null
  try {
    return decodeURIComponent(tokenCookie.slice('nf_jwt='.length))
  } catch {
    return tokenCookie.slice('nf_jwt='.length)
  }
}

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

async function uploadProductMedia(file, productId) {
  const form = new FormData()
  form.append('file', file)
  form.append('productId', productId)

  const response = await fetch('/api/media-upload', { method: 'POST', body: form })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Não foi possível enviar o arquivo.')
  return result.url
}

function getProductMediaKey(src) {
  try {
    const url = new URL(src, window.location.origin)
    return url.pathname === '/api/media' ? url.searchParams.get('key') : null
  } catch {
    return null
  }
}

function stageMediaRemoval(src, setPendingFiles) {
  const key = getProductMediaKey(src)
  if (key) {
    setPendingFiles((current) => ({ ...current, removedKeys: [...new Set([...current.removedKeys, key])] }))
  }
}

async function deleteProductMedia(key, productId) {
  const response = await fetch('/api/media', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, productId }),
  })
  if (!response.ok) {
    const result = await response.json()
    throw new Error(result.error || 'Não foi possível remover um arquivo antigo.')
  }
}

function OwnerDashboard({ onSignOut }) {
  const [section, setSection] = useState('overview')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [settings, setSettings] = useState(null)
  const [editor, setEditor] = useState(null)
  const [materialText, setMaterialText] = useState('')
  const [notice, setNotice] = useState('')
  const [pendingFiles, setPendingFiles] = useState({ mainImage: null, gallery: [], video: null, removedKeys: [] })
  const [isSavingProduct, setIsSavingProduct] = useState(false)
  const [isConnectingShipping, setIsConnectingShipping] = useState(false)
  const [dataStatus, setDataStatus] = useState('loading')
  const [dataError, setDataError] = useState('')

  async function loadDashboardData() {
    setDataStatus('loading')
    setDataError('')
    try {
      const [productsResponse, settingsResponse] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/settings'),
      ])
      if (!productsResponse.ok || !settingsResponse.ok) {
        throw new Error('Não foi possível carregar os dados da loja.')
      }
      const [savedProducts, savedSettings] = await Promise.all([
        productsResponse.json(),
        settingsResponse.json(),
      ])
      setProducts(savedProducts)
      setSettings(savedSettings)
      setDataStatus('ready')
    } catch (error) {
      setDataError(error.message || 'Não foi possível conectar ao banco de dados.')
      setDataStatus('error')
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const availableCount = products.filter((product) => product.status === 'available').length
  const soldCount = products.filter((product) => product.status === 'sold').length
  const pendingCount = orders.filter((order) => order.paymentStatus === 'Aguardando confirmação').length

  function openEditor(product) {
    clearPendingFiles()
    setEditor(product ? { ...product, media: { ...product.media, images: [...product.media.images] } } : blankProduct())
    setMaterialText(product?.materials.join(', ') ?? '')
    setNotice('')
  }

  function clearPendingFiles() {
    if (pendingFiles.mainImage && editor?.image?.startsWith('blob:')) URL.revokeObjectURL(editor.image)
    pendingFiles.gallery.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    if (pendingFiles.video && editor?.media?.video?.startsWith('blob:')) URL.revokeObjectURL(editor.media.video)
    setPendingFiles({ mainImage: null, gallery: [], video: null, removedKeys: [] })
  }

  function cancelEditor() {
    clearPendingFiles()
    setEditor(null)
  }

  function updateEditor(field, value) {
    setEditor((current) => ({ ...current, [field]: value }))
  }

  async function saveProduct(event) {
    event.preventDefault()
    if (!editor.name.trim() || !editor.price || !editor.image) {
      setNotice('Preencha o nome, o preço e escolha uma foto principal.')
      return
    }
    setIsSavingProduct(true)
    setNotice('')
    try {
      const productId = editor.id || crypto.randomUUID()
      const imagePath = pendingFiles.mainImage
        ? await uploadProductMedia(pendingFiles.mainImage, productId)
        : editor.image
      const savedImages = editor.media.images.filter((image) => !image.src.startsWith('blob:'))
      for (const pendingImage of pendingFiles.gallery) {
        const src = await uploadProductMedia(pendingImage.file, productId)
        savedImages.push({ src, label: pendingImage.file.name })
      }
      const videoPath = pendingFiles.video
        ? await uploadProductMedia(pendingFiles.video, productId)
        : editor.media.video
      const product = {
        ...editor,
        id: productId,
        name: editor.name.trim(),
        price: Number(editor.price),
        materials: materialText.split(',').map((item) => item.trim()).filter(Boolean),
        image: imagePath,
        imageAlt: editor.name.trim(),
        media: { images: savedImages, video: videoPath },
      }
      const response = await fetch('/api/products', {
        method: editor.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      })
      const saved = await response.json()
      if (!response.ok) throw new Error(saved.error || 'Não foi possível salvar a bolsa.')
      let cleanupFailed = false
      for (const key of pendingFiles.removedKeys) {
        try {
          await deleteProductMedia(key, productId)
        } catch (error) {
          cleanupFailed = true
          console.error(error)
        }
      }
      setProducts((current) => editor.id
        ? current.map((item) => item.id === saved.id ? saved : item)
        : [saved, ...current])
      clearPendingFiles()
      setEditor(null)
      setNotice(cleanupFailed
        ? 'Bolsa salva, mas não foi possível apagar um arquivo removido do armazenamento.'
        : 'Bolsa salva no banco de dados.')
      setSection('products')
    } catch (error) {
      setNotice(error.message || 'Não foi possível salvar a bolsa. Tente novamente.')
    } finally {
      setIsSavingProduct(false)
    }
  }

  async function markSold(product) {
    const shouldMarkSold = window.confirm(`Marcar ${product.name} como vendida?`)
    if (!shouldMarkSold) return
    const updated = { ...product, status: 'sold' }
    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      const saved = await response.json()
      if (!response.ok) throw new Error(saved.error || 'Não foi possível atualizar o status.')
      setProducts((current) => current.map((item) => item.id === saved.id ? saved : item))
      setNotice(`${product.name} marcada como vendida.`)
    } catch (error) {
      setNotice(error.message || 'Não foi possível atualizar o status. Tente novamente.')
    }
  }

  async function saveSettings(event) {
    event.preventDefault()
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const saved = await response.json()
      if (!response.ok) throw new Error(saved.error || 'Não foi possível salvar as configurações.')
      setSettings(saved)
      setNotice('Configurações salvas no banco de dados.')
    } catch (error) {
      setNotice(error.message || 'Não foi possível salvar as configurações. Tente novamente.')
    }
  }

  async function connectShippingAccount() {
    setIsConnectingShipping(true)
    setNotice('')
    try {
      const accessToken = getIdentityAccessToken()
      if (!accessToken) throw new Error('Sua sessão expirou. Entre novamente no painel.')

      const response = await fetch(`${shippingApiUrl}/api/melhor-envio/connect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível iniciar a conexão.')

      const authorizationUrl = new URL(result.authorizationUrl)
      if (authorizationUrl.origin !== 'https://sandbox.melhorenvio.com.br') {
        throw new Error('O endereço de autorização retornado não é válido.')
      }
      window.location.assign(authorizationUrl.toString())
    } catch (error) {
      setNotice(error.message || 'Não foi possível conectar ao Melhor Envio. Tente novamente.')
      setIsConnectingShipping(false)
    }
  }

  function selectMainImage(event) {
    const file = event.target.files?.[0]
    if (file) {
      if (pendingFiles.mainImage && editor.image.startsWith('blob:')) URL.revokeObjectURL(editor.image)
      else stageMediaRemoval(editor.image, setPendingFiles)
      setPendingFiles((current) => ({ ...current, mainImage: file }))
      updateEditor('image', URL.createObjectURL(file))
    }
    event.target.value = ''
  }

  function addGalleryImages(event) {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return
    const pendingImages = files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }))
    setPendingFiles((current) => ({ ...current, gallery: [...current.gallery, ...pendingImages] }))
    setEditor((current) => ({
      ...current,
      media: {
        ...current.media,
        images: [...current.media.images, ...pendingImages.map(({ file, previewUrl }) => ({
          src: previewUrl,
          label: file.name,
        }))],
      },
    }))
    event.target.value = ''
  }

  function removeGalleryImage(image) {
    if (image.src.startsWith('blob:')) {
      URL.revokeObjectURL(image.src)
      setPendingFiles((current) => ({
        ...current,
        gallery: current.gallery.filter((item) => item.previewUrl !== image.src),
      }))
    } else {
      stageMediaRemoval(image.src, setPendingFiles)
    }
    setEditor((current) => ({
      ...current,
      media: { ...current.media, images: current.media.images.filter((item) => item.src !== image.src) },
    }))
  }

  function removeVideo() {
    if (editor.media.video?.startsWith('blob:')) {
      URL.revokeObjectURL(editor.media.video)
      setPendingFiles((current) => ({ ...current, video: null }))
    } else {
      if (editor.media.video) stageMediaRemoval(editor.media.video, setPendingFiles)
    }
    setEditor((current) => ({ ...current, media: { ...current.media, video: null } }))
  }

  function setVideo(event) {
    const file = event.target.files?.[0]
    if (file) {
      if (pendingFiles.video && editor.media.video?.startsWith('blob:')) URL.revokeObjectURL(editor.media.video)
      else if (editor.media.video) stageMediaRemoval(editor.media.video, setPendingFiles)
      setPendingFiles((current) => ({ ...current, video: file }))
      setEditor((current) => ({
        ...current,
        media: { ...current.media, video: URL.createObjectURL(file) },
      }))
    }
    event.target.value = ''
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
          <strong>Dados conectados</strong>
          <span>Produtos e configurações são salvos no banco; fotos e vídeos são armazenados no Netlify Blobs.</span>
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
                    cancelEditor()
                  setNotice('')
                }}
              >
                <span aria-hidden="true">{item.icon}</span>{item.label}
              </button>
            ))}
          </nav>

          <main className="owner-main">
            {notice && <p className="owner-notice" role="status">{notice}</p>}

            {dataStatus === 'loading' && <p className="owner-panel owner-access-message" role="status">Carregando os dados da loja…</p>}
            {dataStatus === 'error' && (
              <div className="owner-panel owner-empty" role="alert">
                <h2>Não foi possível carregar o painel</h2>
                <p>{dataError}</p>
                <button className="owner-primary-button" type="button" onClick={loadDashboardData}>Tentar novamente</button>
              </div>
            )}

            {dataStatus === 'ready' && section === 'overview' && (
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
                  <div className="owner-stat"><span>Aguardando Pix</span><strong>{pendingCount}</strong><small>Pedidos aguardando confirmação</small></div>
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
                      <span><strong>Nenhum pedido para revisar</strong><small>Os pedidos reais aparecerão aqui quando o checkout estiver conectado.</small></span>
                    </div>
                    <button type="button" className="owner-text-button owner-task-link" onClick={() => setSection('orders')}>Abrir pedidos</button>
                    <p className="owner-muted-note">A confirmação real só estará disponível quando o backend estiver conectado.</p>
                  </section>
                </div>
              </section>
            )}

            {dataStatus === 'ready' && section === 'products' && (
              <section aria-labelledby="products-title">
                <div className="owner-heading-row">
                  <div><p className="owner-eyebrow">Catálogo</p><h1 id="products-title">Suas bolsas</h1><p className="owner-subtitle">Edite as informações e mídias de cada peça.</p></div>
                  <button className="owner-primary-button" type="button" onClick={() => openEditor(null)}>+ Adicionar bolsa</button>
                </div>

                {editor ? (
                  <form className="owner-panel owner-product-form" onSubmit={saveProduct}>
                    <div className="owner-panel-heading"><h2>{editor.id ? 'Editar bolsa' : 'Nova bolsa'}</h2><button type="button" className="owner-text-button" onClick={cancelEditor}>Cancelar</button></div>
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
                      <p className="owner-file-note">Os arquivos selecionados serão enviados ao salvar. Limite de 4 MB por arquivo.</p>
                      <p className="owner-file-note">Para remover uma foto ou vídeo, clique em Remover e salve a bolsa.</p>
                      <div className="owner-media-preview"><img src={editor.image || '/images/logo/logo.JPG'} alt="Prévia da foto principal" /><label>Foto principal<input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectMainImage} /></label></div>
                      <label>Adicionar outras fotos<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addGalleryImages} /></label>
                      {editor.media.images.length > 0 && <div className="owner-extra-photos">{editor.media.images.map((image, index) => (
                        <div className="owner-extra-photo" key={`${image.src}-${index}`}>
                          <img src={image.src} alt={image.label || 'Outra foto da bolsa'} />
                          <button type="button" onClick={() => removeGalleryImage(image)} aria-label={`Remover foto ${image.label || index + 1}`}>Remover</button>
                        </div>
                      ))}</div>}
                      <label>Adicionar ou substituir vídeo<input type="file" accept="video/mp4" onChange={setVideo} /></label>
                      {editor.media.video && <div className="owner-video-actions"><p className="owner-file-note">{pendingFiles.video ? 'Novo vídeo selecionado ✓' : 'Vídeo cadastrado ✓'}</p><button type="button" onClick={removeVideo}>Remover vídeo</button></div>}
                    </fieldset>
                    <button className="owner-primary-button" type="submit" disabled={isSavingProduct}>{isSavingProduct ? 'Enviando e salvando…' : 'Salvar bolsa'}</button>
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

            {dataStatus === 'ready' && section === 'orders' && (
              <section aria-labelledby="orders-title">
                <div className="owner-heading-row"><div><p className="owner-eyebrow">Vendas</p><h1 id="orders-title">Pedidos</h1><p className="owner-subtitle">Confira o pagamento e acompanhe a entrega.</p></div></div>
                {orders.length ? orders.map((order) => (
                  <article className="owner-panel owner-order" key={order.id}>
                    <div className="owner-order-heading"><div><span className="owner-order-number">{order.id} <span className="owner-demo-chip">exemplo</span></span><h2>{order.customer}</h2><small>Forma de pagamento: {order.payment} · Envio: {order.shipping}</small></div><strong>{formatPrice(order.total)}</strong></div>
                    <div className="owner-order-product"><img src={order.productImage} alt="" /><span>{order.product}</span></div>
                    <div className="owner-order-bottom"><span><small>Pagamento</small><strong>{order.paymentStatus}</strong></span><label>Status do pedido<select value={order.orderStatus} onChange={(event) => setOrders((current) => current.map((item) => item.id === order.id ? { ...item, orderStatus: event.target.value } : item))}><option>Aguardando pagamento</option><option>Em preparação</option><option>Enviado</option><option>Entregue</option><option>Cancelado</option></select></label>
                    </div>
                  </article>
                )) : <div className="owner-panel owner-empty"><h2>Nenhum pedido por enquanto</h2><p>Os novos pedidos aparecerão aqui quando o checkout estiver conectado.</p></div>}
              </section>
            )}

            {dataStatus === 'ready' && section === 'settings' && (
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
                  <button className="owner-primary-button" type="submit">Salvar configurações</button>
                </form>
                <section className="owner-panel owner-shipping-connection" aria-labelledby="shipping-connection-title">
                  <h2 id="shipping-connection-title">Melhor Envio · ambiente de testes</h2>
                  <p>Conecte a conta Sandbox para preparar as cotações. Essa etapa não compra etiquetas nem conecta a conta real.</p>
                  <button className="owner-primary-button" type="button" onClick={connectShippingAccount} disabled={isConnectingShipping}>
                    {isConnectingShipping ? 'Conectando…' : 'Conectar conta Sandbox'}
                  </button>
                </section>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default OwnerDashboard
