const STORE_ORIGIN = 'https://poucas-i-boas.netlify.app'
const IDENTITY_USER_URL = `${STORE_ORIGIN}/.netlify/identity/user`
const CONNECT_PATH = '/api/melhor-envio/connect'
const CALLBACK_PATH = '/api/melhor-envio/callback'
const AUTH_ORIGIN = 'https://sandbox.melhorenvio.com.br'
const PROVIDER = 'melhor-envio'
const ENVIRONMENT = 'sandbox'
const REQUESTED_SCOPE = 'shipping-calculate'

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character])
}

function statusPage(title, message, status = 200) {
  return new Response(`<!doctype html>
<html lang="pt-BR">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title></head>
  <body style="margin:0;padding:40px 18px;background:#f8f2fa;color:#43245f;font:16px Arial,sans-serif;text-align:center">
    <main style="max-width:520px;margin:10vh auto;padding:30px 24px;background:#fff;border-radius:18px">
      <h1 style="font-size:24px">${escapeHtml(title)}</h1>
      <p style="line-height:1.6">${escapeHtml(message)}</p>
      <a href="${STORE_ORIGIN}/admin" style="display:inline-block;margin-top:12px;padding:12px 18px;border-radius:22px;background:#e0489a;color:white;font-weight:bold;text-decoration:none">Voltar ao painel</a>
    </main>
  </body>
</html>`, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    },
  })
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store',
    'Vary': 'Origin',
  }
}

function json(data, status, origin) {
  return Response.json(data, {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json; charset=utf-8' },
  })
}

async function hashState(state) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(state))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function getConfig(env) {
  const clientId = env.MELHOR_ENVIO_SANDBOX_CLIENT_ID
  const clientSecret = env.MELHOR_ENVIO_SANDBOX_CLIENT_SECRET
  const redirectUri = env.MELHOR_ENVIO_SANDBOX_REDIRECT_URI
  const supportEmail = env.MELHOR_ENVIO_SUPPORT_EMAIL

  if (!clientId || !clientSecret || !redirectUri || !supportEmail) return null

  let callback
  try {
    callback = new URL(redirectUri)
  } catch {
    return null
  }
  if (callback.protocol !== 'https:' || callback.pathname !== CALLBACK_PATH) return null

  return { clientId, clientSecret, redirectUri: callback.toString(), supportEmail }
}

async function getAdminFromRequest(request) {
  const authorization = request.headers.get('Authorization') ?? ''
  const match = /^Bearer\s+(.+)$/i.exec(authorization)
  if (!match) return null

  let response
  try {
    response = await fetch(IDENTITY_USER_URL, {
      headers: { Authorization: `Bearer ${match[1]}`, Accept: 'application/json' },
    })
  } catch {
    return null
  }
  if (!response.ok) return null

  let user
  try {
    user = await response.json()
  } catch {
    return null
  }

  const roles = user?.app_metadata?.roles ?? user?.roles ?? []
  return typeof user?.id === 'string' && roles.includes('admin') ? user : null
}

async function startAuthorization(request, env, origin) {
  if (origin !== STORE_ORIGIN) return new Response('Origem não autorizada.', { status: 403 })

  const user = await getAdminFromRequest(request)
  if (!user) return json({ error: 'Entre no painel como administradora para continuar.' }, 401, origin)

  const config = getConfig(env)
  if (!config) return json({ error: 'A configuração Sandbox ainda está incompleta.' }, 503, origin)
  if (!env.DB) return json({ error: 'O armazenamento da integração ainda não está configurado.' }, 503, origin)

  const state = `${crypto.randomUUID()}${crypto.randomUUID()}`
  const now = Date.now()
  const expiresAt = now + 10 * 60 * 1000

  await env.DB.prepare('DELETE FROM shipping_provider_oauth_states WHERE expires_at <= ?').bind(now).run()
  await env.DB.prepare(`
    INSERT INTO shipping_provider_oauth_states
      (state_hash, environment, initiated_by_user_id, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(await hashState(state), ENVIRONMENT, user.id, expiresAt, now).run()

  const authorizationUrl = new URL('/oauth/authorize', AUTH_ORIGIN)
  authorizationUrl.search = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: REQUESTED_SCOPE,
    state,
  }).toString()

  return json({ authorizationUrl: authorizationUrl.toString() }, 200, origin)
}

async function consumeAuthorizationState(state, env) {
  const result = await env.DB.prepare(`
    DELETE FROM shipping_provider_oauth_states
    WHERE state_hash = ? AND environment = ? AND expires_at > ?
    RETURNING initiated_by_user_id
  `).bind(await hashState(state), ENVIRONMENT, Date.now()).all()
  return result.results?.[0] ?? null
}

async function completeAuthorization(request, env) {
  const config = getConfig(env)
  if (!config) return statusPage('Configuração pendente', 'As credenciais Sandbox ainda não foram configuradas no Cloudflare.', 503)
  if (!env.DB) return statusPage('Configuração pendente', 'O armazenamento da integração ainda não foi configurado.', 503)

  const callback = new URL(request.url)
  const state = callback.searchParams.get('state')
  if (!state) return statusPage('Não foi possível conectar', 'A autorização expirou ou não foi iniciada pelo painel. Tente novamente.', 400)

  const storedState = await consumeAuthorizationState(state, env)
  if (!storedState) {
    return statusPage('Não foi possível conectar', 'A autorização expirou ou não é válida. Volte ao painel e tente novamente.', 400)
  }

  if (callback.searchParams.has('error')) {
    return statusPage('Autorização cancelada', 'A conta Sandbox não autorizou o aplicativo. Você pode tentar novamente pelo painel.', 400)
  }

  const code = callback.searchParams.get('code')
  if (!code) return statusPage('Não foi possível conectar', 'O Melhor Envio não retornou o código de autorização. Tente novamente.', 400)

  let tokenResponse
  try {
    tokenResponse = await fetch(`${AUTH_ORIGIN}/oauth/token`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': `Poucas Boas Bolsas (${config.supportEmail})`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        code,
      }),
    })
  } catch {
    return statusPage('Não foi possível conectar', 'Não conseguimos alcançar o Melhor Envio. Tente novamente mais tarde.', 502)
  }

  let tokenData
  try {
    tokenData = await tokenResponse.json()
  } catch {
    tokenData = null
  }
  const expiresIn = Number(tokenData?.expires_in)
  if (!tokenResponse.ok || !tokenData?.access_token || !tokenData?.refresh_token || !Number.isFinite(expiresIn)) {
    console.error('Melhor Envio token exchange failed with status:', tokenResponse.status)
    return statusPage('Não foi possível conectar', 'O Melhor Envio não aceitou a autorização. Confira a configuração do aplicativo e tente novamente.', 502)
  }

  const now = Date.now()
  const refreshExpiresIn = Number(tokenData.refresh_expires_in)
  const scope = Array.isArray(tokenData.scope)
    ? tokenData.scope.join(' ')
    : String(tokenData.scope ?? REQUESTED_SCOPE)

  await env.DB.prepare(`
    INSERT INTO shipping_provider_tokens (
      provider, environment, access_token, refresh_token, token_type, scope,
      expires_at, refresh_expires_at, authorized_by_user_id, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (provider, environment) DO UPDATE SET
      access_token = excluded.access_token,
      refresh_token = excluded.refresh_token,
      token_type = excluded.token_type,
      scope = excluded.scope,
      expires_at = excluded.expires_at,
      refresh_expires_at = excluded.refresh_expires_at,
      authorized_by_user_id = excluded.authorized_by_user_id,
      updated_at = excluded.updated_at
  `).bind(
    PROVIDER,
    ENVIRONMENT,
    tokenData.access_token,
    tokenData.refresh_token,
    tokenData.token_type ?? 'Bearer',
    scope,
    now + expiresIn * 1000,
    Number.isFinite(refreshExpiresIn) && refreshExpiresIn > 0 ? now + refreshExpiresIn * 1000 : null,
    storedState.initiated_by_user_id,
    now,
  ).run()

  return statusPage('Sandbox conectado', 'A conta de testes do Melhor Envio foi autorizada. Nenhuma etiqueta foi comprada.', 200)
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin')

    if (url.pathname === CONNECT_PATH && request.method === 'OPTIONS') {
      if (origin !== STORE_ORIGIN) return new Response(null, { status: 403 })
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    if (url.pathname === CONNECT_PATH) {
      if (request.method !== 'POST') return new Response('Método não permitido.', { status: 405 })
      try {
        return await startAuthorization(request, env, origin)
      } catch (error) {
        console.error('Melhor Envio OAuth start error:', error)
        return json({ error: 'Não foi possível iniciar a conexão. Tente novamente.' }, 500, origin === STORE_ORIGIN ? origin : STORE_ORIGIN)
      }
    }

    if (url.pathname === CALLBACK_PATH) {
      if (request.method !== 'GET') return new Response('Método não permitido.', { status: 405 })
      try {
        return await completeAuthorization(request, env)
      } catch (error) {
        console.error('Melhor Envio OAuth callback error:', error)
        return statusPage('Não foi possível conectar', 'Ocorreu um erro ao conectar a conta Sandbox. Tente novamente.', 500)
      }
    }

    return new Response('Não encontrado.', { status: 404 })
  },
}
