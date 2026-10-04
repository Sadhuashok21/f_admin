import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { exchangeAuthorizationCode } from './pkce'
import { useAuth } from '../context/AuthContext'

export const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state') || ''
    const errorParam = searchParams.get('error')

    if (errorParam) {
      setError(searchParams.get('error_description') || errorParam || 'Authentication failed.')
      return
    }

    if (!code) {
      setError('Authorization code missing from identity callback.')
      return
    }

    const config = {
      clientId: 'admin',
      accountsPortalUrl: (import.meta.env.VITE_ACCOUNTS_URL || 'http://localhost:5174').replace(/\/+$/, ''),
      apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, ''),
      redirectUri: `${window.location.origin}/auth/callback`,
    }

    exchangeAuthorizationCode(config, code, state)
      .then((result) => {
        localStorage.setItem('as_access_token', result.accessToken)
        localStorage.setItem('as_auth_user', JSON.stringify({
          userId: result.user.user_id,
          name: `${result.user.name} ${result.user.lastname || ''}`.trim(),
          email: result.user.email,
          role: result.user.user_type === 'admin' ? 'Administrator' : 'User',
          profile: result.user.profile || '/as_logo.webp',
        }))
        login(result.user)
        navigate(result.returnTo || '/', { replace: true })
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to complete authorization.')
      })
  }, [searchParams, navigate, login])

  if (error) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: '440px', textAlign: 'center', background: '#0f172a', color: '#f8fafc', padding: '2rem', borderRadius: '1rem', border: '1px solid #1e293b' }}>
          <div style={{ color: '#ef4444', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <AlertTriangle size={36} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Admin Portal Authentication Error</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{error}</p>
          <button
            onClick={() => window.location.assign('/')}
            style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #e0e7ff', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#94a3b8', marginTop: '1rem', fontSize: '0.9rem' }}>Verifying Administrator credentials with SSO…</p>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
