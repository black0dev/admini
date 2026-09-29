'use client'

import React from 'react'
import { useData } from '@/lib/data/dataContext'

export type TabName = 'Resumen' | 'Portada web' | 'Productos' | 'Inventario' | 'Movimientos' | 'Categorías' | 'Envíos'

interface HeaderProps {
  currentTab: TabName
  onSelectTab: (tab: TabName) => void
  onOpenSupabaseModal: () => void
}

const TABS: TabName[] = ['Resumen', 'Portada web', 'Productos', 'Inventario', 'Movimientos', 'Categorías', 'Envíos']

export const Header: React.FC<HeaderProps> = ({ currentTab, onSelectTab, onOpenSupabaseModal }) => {
  const { theme, toggleTheme, isSupabaseConnected } = useData()

  return (
    <header>
      <div className="store" title="Tienda activa">
        <span>🏪 Vintage 29</span>
        <span aria-hidden="true" style={{ fontSize: '11px', color: 'var(--mut)' }}>⇅</span>
      </div>

      <nav aria-label="Secciones de la tienda">
        {TABS.map((tab) => (
          <button
            key={tab}
            data-t={tab}
            aria-current={currentTab === tab ? 'page' : undefined}
            onClick={() => onSelectTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="header-actions">
        <button
          className={`sb-badge ${isSupabaseConnected ? 'connected' : 'offline'}`}
          onClick={onOpenSupabaseModal}
          title="Ver estado de conexión con Supabase"
        >
          <span style={{ fontSize: '8px' }}>●</span>
          {isSupabaseConnected ? 'Supabase: Conectado' : 'Supabase: Configurar'}
        </button>

        <button
          className="icon"
          id="theme"
          aria-label="Cambiar tema"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>

        <div className="avatar" title="admin@vintage29" aria-hidden="true">
          V29
        </div>
      </div>
    </header>
  )
}
