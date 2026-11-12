import { getDeployStore, getStore } from '@netlify/blobs'
import { getUser } from '@netlify/identity'

const storeName = 'product-media'
const maxFileSize = 4 * 1024 * 1024
const allowedFileTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['video/mp4', 'mp4'],
])

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

function getMediaStore(context) {
  return context.deploy?.context === 'production'
    ? getStore(storeName)
    : getDeployStore(storeName)
}

export default async function mediaUploadHandler(request, context) {
  if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405)

  try {
    const user = await getUser()
    if (!user) return json({ error: 'Entre no painel para enviar arquivos.' }, 401)
    if (!user.roles?.includes('admin')) return json({ error: 'Você não tem permissão para enviar arquivos.' }, 403)

    const form = await request.formData()
    const file = form.get('file')
    const productId = form.get('productId')
    if (!(file instanceof File) || file.size === 0) {
      return json({ error: 'Selecione uma imagem ou vídeo.' }, 400)
    }
    if (typeof productId !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(productId)) {
      return json({ error: 'Identificador da bolsa inválido.' }, 400)
    }
    if (file.size > maxFileSize) {
      return json({ error: 'O arquivo ultrapassa o limite de 4 MB. Comprima-o e tente novamente.' }, 413)
    }

    const extension = allowedFileTypes.get(file.type)
    if (!extension) {
      return json({ error: 'Use uma imagem JPG, PNG ou WebP, ou um vídeo MP4.' }, 415)
    }

    const key = `products/${productId}/${crypto.randomUUID()}.${extension}`
    const store = getMediaStore(context)
    await store.set(key, file, { metadata: { contentType: file.type } })

    return json({
      key,
      url: `/api/media?key=${encodeURIComponent(key)}`,
      contentType: file.type,
    }, 201)
  } catch (error) {
    console.error('Product media upload error:', error)
    return json({ error: 'Não foi possível enviar o arquivo. Tente novamente.' }, 500)
  }
}

export const config = { path: '/api/media-upload' }
