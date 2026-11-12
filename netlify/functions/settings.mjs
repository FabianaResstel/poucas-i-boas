import { getDatabase } from '@netlify/database'
import { getUser } from '@netlify/identity'

const db = getDatabase()

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

function toSettings(row) {
  return {
    pixKey: row.pix_key,
    pixRecipient: row.pix_recipient,
    originCep: row.origin_cep,
    boxLength: String(row.box_length_cm),
    boxWidth: String(row.box_width_cm),
    boxHeight: String(row.box_height_cm),
    boxWeight: String(row.box_weight_grams),
    bagsPerBox: String(row.bags_per_box),
    freePacItems: String(row.free_pac_item_threshold),
    deliveryMin: String(row.delivery_min_business_days),
    deliveryMax: String(row.delivery_max_business_days),
  }
}

function validateSettings(settings) {
  if (!settings || typeof settings !== 'object') return 'Configurações inválidas.'
  if (typeof settings.pixKey !== 'string' || typeof settings.pixRecipient !== 'string') {
    return 'Confira os dados do Pix.'
  }
  if (typeof settings.originCep !== 'string' || !/^\d{5}-?\d{3}$/.test(settings.originCep.trim())) {
    return 'Informe um CEP de origem válido.'
  }

  const numericFields = [
    ['boxLength', 'comprimento'],
    ['boxWidth', 'largura'],
    ['boxHeight', 'altura'],
    ['boxWeight', 'peso da caixa'],
    ['bagsPerBox', 'bolsas por caixa'],
    ['freePacItems', 'quantidade para frete PAC grátis'],
    ['deliveryMin', 'prazo mínimo'],
    ['deliveryMax', 'prazo máximo'],
  ]
  for (const [field, label] of numericFields) {
    const value = Number(settings[field])
    if (!Number.isFinite(value) || value < 0) return `Confira ${label}.`
  }
  if (Number(settings.bagsPerBox) < 1 || Number(settings.freePacItems) < 1
    || Number(settings.deliveryMin) < 1
    || Number(settings.deliveryMax) < Number(settings.deliveryMin)) {
    return 'Confira os limites de quantidade e o prazo de entrega.'
  }
  return null
}

async function requireAdmin() {
  const user = await getUser()
  if (!user) return json({ error: 'Entre no painel para continuar.' }, 401)
  if (!user.roles?.includes('admin')) return json({ error: 'Você não tem permissão para alterar as configurações.' }, 403)
  return null
}

export default async function settingsHandler(request) {
  try {
    if (request.method === 'GET') {
      const [row] = await db.sql`SELECT * FROM store_settings WHERE id = 1`
      if (!row) return json({ error: 'As configurações da loja ainda não foram criadas.' }, 404)
      return json(toSettings(row))
    }

    if (request.method !== 'PUT') return json({ error: 'Método não permitido.' }, 405)

    const accessError = await requireAdmin()
    if (accessError) return accessError

    let settings
    try {
      settings = await request.json()
    } catch {
      return json({ error: 'O conteúdo enviado não é um JSON válido.' }, 400)
    }

    const validationError = validateSettings(settings)
    if (validationError) return json({ error: validationError }, 400)

    const [row] = await db.sql`
      UPDATE store_settings SET
        pix_key = ${settings.pixKey.trim()},
        pix_recipient = ${settings.pixRecipient.trim()},
        origin_cep = ${settings.originCep.trim()},
        box_length_cm = ${Number(settings.boxLength)},
        box_width_cm = ${Number(settings.boxWidth)},
        box_height_cm = ${Number(settings.boxHeight)},
        box_weight_grams = ${Number(settings.boxWeight)},
        bags_per_box = ${Number(settings.bagsPerBox)},
        free_pac_item_threshold = ${Number(settings.freePacItems)},
        delivery_min_business_days = ${Number(settings.deliveryMin)},
        delivery_max_business_days = ${Number(settings.deliveryMax)},
        updated_at = NOW()
      WHERE id = 1
      RETURNING *
    `
    if (!row) return json({ error: 'As configurações da loja não foram encontradas.' }, 404)
    return json(toSettings(row))
  } catch (error) {
    console.error('Settings API error:', error)
    return json({ error: 'Não foi possível carregar ou salvar as configurações.' }, 500)
  }
}

export const config = { path: '/api/settings' }
