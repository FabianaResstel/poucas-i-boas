import { useEffect, useState } from 'react'
import {
  acceptInvite,
  getUser,
  handleAuthCallback,
  login,
  logout,
  onAuthChange,
} from '@netlify/identity'
import OwnerDashboard from './OwnerDashboard.jsx'
import './owner-dashboard.css'

function isStoreAdmin(user) {
  return user?.roles?.includes('admin') ?? false
}

function OwnerAccess() {
  const [status, setStatus] = useState('loading')
  const [inviteToken, setInviteToken] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadSession() {
      try {
        const callback = await handleAuthCallback()
        if (!isMounted) return

        if (callback?.type === 'invite' && callback.token) {
          setInviteToken(callback.token)
          setStatus('invite')
          return
        }

        const user = callback?.user ?? await getUser()
        if (!isMounted) return
        setStatus(user ? (isStoreAdmin(user) ? 'dashboard' : 'unauthorized') : 'login')
      } catch {
        if (isMounted) {
          setStatus('login')
          setError('Não foi possível conectar ao login. Tente novamente em instantes.')
        }
      }
    }

    loadSession()
    const unsubscribe = onAuthChange((_event, user) => {
      if (isMounted && user) {
        setStatus(isStoreAdmin(user) ? 'dashboard' : 'unauthorized')
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  async function submitLogin(event) {
    event.preventDefault()
    setError('')
    try {
      const user = await login(email.trim(), password)
      setStatus(isStoreAdmin(user) ? 'dashboard' : 'unauthorized')
    } catch {
      setError('E-mail ou senha inválidos. Confira os dados e tente novamente.')
    }
  }

  async function submitInvite(event) {
    event.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Crie uma senha com pelo menos 8 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    try {
      await acceptInvite(inviteToken, password)
      window.location.replace('/admin')
    } catch {
      setError('Não foi possível concluir o convite. Peça um novo convite e tente novamente.')
    }
  }

  async function signOut() {
    await logout()
    setStatus('login')
    setPassword('')
  }

  if (status === 'dashboard') return <OwnerDashboard onSignOut={signOut} />

  return (
    <main className="owner-page">
      <section className="owner-access-card" aria-labelledby="owner-access-title">
        <a className="owner-access-brand" href="/" aria-label="Voltar à loja">
          <img src="/images/logo/logo.JPG" alt="Poucas boas bolsas" />
        </a>
        <p className="owner-eyebrow">Área da proprietária</p>
        <h1 id="owner-access-title">
          {status === 'invite' ? 'Ative seu acesso' : 'Painel da proprietária'}
        </h1>

        {status === 'loading' ? (
          <p className="owner-access-message">Verificando seu acesso…</p>
        ) : status === 'invite' ? (
          <form className="owner-access-form" onSubmit={submitInvite}>
            <p className="owner-access-message">Escolha uma senha para concluir seu convite.</p>
            <label>
              Senha
              <input type="password" autoComplete="new-password" minLength={8} value={password}
                onChange={(event) => setPassword(event.target.value)} required />
            </label>
            <label>
              Confirme a senha
              <input type="password" autoComplete="new-password" minLength={8} value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)} required />
            </label>
            {error && <p className="owner-access-error" role="alert">{error}</p>}
            <button className="owner-primary-button" type="submit">Concluir convite</button>
          </form>
        ) : status === 'unauthorized' ? (
          <div className="owner-access-form">
            <p className="owner-access-error" role="alert">
              Esta conta não tem acesso de administradora ao painel.
            </p>
            <button className="owner-primary-button" type="button" onClick={signOut}>Sair</button>
          </div>
        ) : (
          <form className="owner-access-form" onSubmit={submitLogin}>
            <p className="owner-access-message">Entre com sua conta para acessar o painel.</p>
            <label>
              E-mail
              <input type="email" autoComplete="username" value={email}
                onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label>
              Senha
              <input type="password" autoComplete="current-password" value={password}
                onChange={(event) => setPassword(event.target.value)} required />
            </label>
            {error && <p className="owner-access-error" role="alert">{error}</p>}
            <button className="owner-primary-button" type="submit">Entrar</button>
          </form>
        )}
        {status !== 'invite' && status !== 'loading' && (
          <a className="owner-access-store-link" href="/">Voltar à loja</a>
        )}
      </section>
    </main>
  )
}

export default OwnerAccess
