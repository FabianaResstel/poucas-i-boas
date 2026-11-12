import { getDeployStore, getStore } from '@netlify/blobs'

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
