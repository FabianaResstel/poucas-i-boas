import { getDatabase } from '@netlify/database'
import { getUser } from '@netlify/identity'

const db = getDatabase()

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

function toProduct(row) {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    description: row.description,
    materials: row.materials,
    status: row.status,
    weightGrams: row.weight_grams == null ? '' : Number(row.weight_grams),
    image: row.image_path,
    imageAlt: row.image_alt,
    rotation: row.rotation,
    media: {
      images: row.extra_images,
      video: row.video_path,
    },
  }
}

function validateProduct(product, { requiresId = true } = {}) {
  if (!product || typeof product !== 'object') return 'Dados da bolsa inválidos.'
  if (requiresId && (typeof product.id !== 'string' || !product.id.trim())) return 'Identificador da bolsa inválido.'
  if (typeof product.name !== 'string' || !product.name.trim()) return 'Informe o nome da bolsa.'
  if (!Number.isFinite(Number(product.price)) || Number(product.price) < 0) return 'Informe um preço válido.'
  if (typeof product.image !== 'string' || !product.image.trim() || product.image.startsWith('blob:')) {
    return 'Escolha uma foto válida. Fotos enviadas do computador poderão ser salvas quando o armazenamento de arquivos estiver conectado.'
  }
  if (!['available', 'sold'].includes(product.status ?? 'available')) return 'Status da bolsa inválido.'
  if (product.weightGrams !== '' && product.weightGrams != null
    && (!Number.isInteger(Number(product.weightGrams)) || Number(product.weightGrams) < 0)) {
    return 'Informe o peso da bolsa em gramas.'
  }
  if (!Array.isArray(product.materials)) return 'A lista de materiais está inválida.'
  if (product.media?.images != null && !Array.isArray(product.media.images)) return 'A lista de fotos adicionais está inválida.'
  return null
}

async function requireAdmin() {
  const user = await getUser()
  if (!user) return json({ error: 'Entre no painel para continuar.' }, 401)
  if (!user.roles?.includes('admin')) return json({ error: 'Você não tem permissão para alterar as bolsas.' }, 403)
  return null
}

export default async function productsHandler(request) {
  try {
    if (request.method === 'GET') {
      const rows = await db.sql`SELECT * FROM products ORDER BY sort_order, id`
      return json(rows.map(toProduct))
    }

    if (!['POST', 'PUT'].includes(request.method)) {
      return json({ error: 'Método não permitido.' }, 405)
    }

    const accessError = await requireAdmin()
    if (accessError) return accessError

    let product
    try {
      product = await request.json()
    } catch {
      return json({ error: 'O conteúdo enviado não é um JSON válido.' }, 400)
    }

    const validationError = validateProduct(product, { requiresId: request.method === 'PUT' })
    if (validationError) return json({ error: validationError }, 400)

    const id = typeof product.id === 'string' && product.id.trim()
      ? product.id.trim()
      : crypto.randomUUID()
    const weightGrams = product.weightGrams === '' || product.weightGrams == null
      ? null
      : Number(product.weightGrams)
    const materials = JSON.stringify(product.materials.map((item) => String(item).trim()).filter(Boolean))
    const extraImages = JSON.stringify(product.media?.images ?? [])
    const videoPath = product.media?.video || null

    if (request.method === 'POST') {
      const [row] = await db.sql`
        INSERT INTO products (
          id, name, price, description, materials, status, weight_grams,
          image_path, image_alt, rotation, extra_images, video_path, sort_order
        ) VALUES (
          ${id}, ${product.name.trim()}, ${Number(product.price)}, ${product.description ?? ''},
          ${materials}::jsonb, ${product.status ?? 'available'}, ${weightGrams},
          ${product.image.trim()}, ${product.imageAlt ?? product.name.trim()}, ${product.rotation ?? '0deg'},
          ${extraImages}::jsonb, ${videoPath}, COALESCE((SELECT MAX(sort_order) + 1 FROM products), 1)
        ) RETURNING *
      `
      return json(toProduct(row), 201)
    }

    const [row] = await db.sql`
      UPDATE products SET
        name = ${product.name.trim()},
        price = ${Number(product.price)},
        description = ${product.description ?? ''},
        materials = ${materials}::jsonb,
        status = ${product.status ?? 'available'},
        weight_grams = ${weightGrams},
        image_path = ${product.image.trim()},
        image_alt = ${product.imageAlt ?? product.name.trim()},
        rotation = ${product.rotation ?? '0deg'},
        extra_images = ${extraImages}::jsonb,
        video_path = ${videoPath},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    if (!row) return json({ error: 'Bolsa não encontrada.' }, 404)
    return json(toProduct(row))
  } catch (error) {
    console.error('Products API error:', error)
    return json({ error: 'Não foi possível carregar ou salvar as bolsas.' }, 500)
  }
}

export const config = { path: '/api/products' }
