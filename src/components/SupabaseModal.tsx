'use client'

import React, { useState } from 'react'
import { useData } from '@/lib/data/dataContext'
import { isSupabaseConfigured } from '@/lib/supabase/client'

interface SupabaseModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const { isSupabaseConnected, connectionStatus, checkConnection, refreshData } = useData()
  const [testing, setTesting] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleTestConnection = async () => {
    setTesting(true)
    await checkConnection()
    await refreshData()
    setTesting(false)
  }

  const copyEnvSnippet = () => {
    const snippet = `NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon`
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Conexión con Supabase</h2>
            <p className="sub" style={{ margin: '4px 0 0' }}>Estado y configuración de tu base de datos en la nube</p>
          </div>
          <button className="btn" onClick={onClose} style={{ padding: '4px 10px', fontSize: '16px' }}>×</button>
        </div>

        {/* Current status banner */}
        <div
          style={{
            padding: '14px',
            borderRadius: '10px',
            marginBottom: '18px',
            background: isSupabaseConnected ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
            border: `1px solid ${isSupabaseConnected ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div style={{ fontSize: '24px' }}>{isSupabaseConnected ? '⚡' : '⚙️'}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: isSupabaseConnected ? 'var(--ok)' : 'var(--warn)' }}>
              {isSupabaseConnected ? 'Conectado en Vivo con Supabase' : 'Modo Local / Demo Activo'}
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--mut)', marginTop: '2px' }}>
              {isSupabaseConfigured
                ? 'Variables detectadas en .env.local.'
                : 'La app funciona al 100% con datos locales hasta que agregues tus credenciales.'}
            </div>
          </div>
        </div>

        {connectionStatus && (
          <div style={{
            fontSize: '13px',
            padding: '10px 12px',
            borderRadius: '8px',
            marginBottom: '16px',
            background: connectionStatus.success ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            color: connectionStatus.success ? 'var(--ok)' : 'var(--bad)',
            border: `1px solid ${connectionStatus.success ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
          }}>
            {connectionStatus.message}
          </div>
        )}

        {/* Setup steps */}
        <div style={{ background: 'var(--soft)', padding: '16px', borderRadius: '10px', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Cómo conectar en 2 pasos:</h3>
          <ol style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--fg)', display: 'grid', gap: '8px' }}>
            <li>
              Abre el archivo <code>.env.local</code> en la raíz del proyecto y coloca tu <strong>Project URL</strong> y <strong>Anon Key</strong> de Supabase.
            </li>
            <li>
              Ejecuta el script SQL que preparamos en <code>supabase/schema.sql</code> en el <strong>SQL Editor</strong> de tu panel de Supabase.
            </li>
          </ol>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button className="btn" onClick={copyEnvSnippet}>
            {copied ? '✓ Copiado' : 'Copiar formato .env.local'}
          </button>
          <button className="btn p" onClick={handleTestConnection} disabled={testing}>
            {testing ? 'Comprobando...' : 'Probar conexión'}
          </button>
        </div>
      </div>
    </div>
  )
}
