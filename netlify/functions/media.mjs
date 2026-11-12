import { getDeployStore, getStore } from '@netlify/blobs'
import { getUser } from '@netlify/identity'

const storeName = 'product-media'
const allowedFileTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
])

function getMediaStore(context) {
  return context.deploy?.context === 'production'
    ? getStore(storeName)
    : getDeployStore(storeName)
}

function isProductMediaKey(key) {
  if (typeof key !== 'string') return false
  const parts = key.split('/')
  return parts.length === 3
    && parts[0] === 'products'
    && /^[A-Za-z0-9_-]{1,100}$/.test(parts[1])
    && /^[0-9a-f-]{36}\.(jpg|png|webp|mp4)$/.test(parts[2])
}

export default async function mediaHandler(request, context) {
  if (request.method === 'DELETE') {
    try {
      const user = await getUser()
      if (!user) return Response.json({ error: 'Entre no painel para continuar.' }, { status: 401 })
      if (!user.roles?.includes('admin')) {
        return Response.json({ error: 'Você não tem permissão para remover arquivos.' }, { status: 403 })
      }

      const { key, productId } = await request.json()
      if (!isProductMediaKey(key) || typeof productId !== 'string' || !key.startsWith(`products/${productId}/`)) {
        return Response.json({ error: 'Arquivo inválido.' }, { status: 400 })
      }

      await getMediaStore(context).delete(key)
      return Response.json({ deleted: true }, { headers: { 'Cache-Control': 'no-store' } })
    } catch (error) {
      console.error('Product media delete error:', error)
      return Response.json({ error: 'Não foi possível remover o arquivo.' }, { status: 500 })
    }
  }

  if (request.method !== 'GET') return new Response(null, { status: 405 })

  const key = new URL(request.url).searchParams.get('key')
  if (!isProductMediaKey(key)) return new Response(null, { status: 404 })

  try {
    const entry = await getMediaStore(context).getWithMetadata(key, { type: 'stream' })
    const contentType = entry?.metadata?.contentType
    if (!entry?.data || !allowedFileTypes.has(contentType)) return new Response(null, { status: 404 })

    return new Response(entry.data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Product media read error:', error)
    return new Response('Não foi possível carregar esta mídia.', { status: 500 })
  }
}

export const config = { path: '/api/media' }
