'use client'

import React from 'react'
import { useData } from '@/lib/data/dataContext'
import { getAvailableStock } from '@/lib/data/initialData'
import { TabName } from '@/components/Header'

interface DashboardViewProps {
  onNavigateTab: (tab: TabName) => void
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab }) => {
  const { variants, movements, isSupabaseConnected } = useData()

  // Calculate stats
  const publishedVariants = variants.filter(v => v.is_published)
  const uniqueProducts = new Set(publishedVariants.map(v => v.product_name)).size
  const activeVariantsCount = publishedVariants.length
  const outOfStockCount = publishedVariants.filter(v => getAvailableStock(v) <= 0).length
  const lowStockCount = publishedVariants.filter(v => {
    const disp = getAvailableStock(v)
    return disp > 0 && disp <= v.threshold
  }).length

  return (
    <div>
      <div className="head">
        <div>
          <h1>Panel</h1>
          <p className="sub">Resumen en tiempo real de tu tienda Vintage 29</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="btn" onClick={() => onNavigateTab('Portada web')}>
            ✏️ Editar Portada
          </button>
          <button className="btn p" onClick={() => onNavigateTab('Inventario')}>
            📦 Gestionar Inventario
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="cards">
        <div className="card" onClick={() => onNavigateTab('Productos')} style={{ cursor: 'pointer' }}>
          <div className="t">
            <span>Productos publicados</span>
            <span style={{ fontSize: '18px' }}>▢</span>
          </div>
          <div className="n">{uniqueProducts}</div>
          <div style={{ fontSize: '12px', color: 'var(--mut)', marginTop: '4px' }}>En catálogo visible</div>
        </div>

        <div className="card" onClick={() => onNavigateTab('Productos')} style={{ cursor: 'pointer' }}>
          <div className="t">
            <span>Variantes activas</span>
            <span style={{ fontSize: '18px' }}>▤</span>
          </div>
          <div className="n">{activeVariantsCount}</div>
          <div style={{ fontSize: '12px', color: 'var(--mut)', marginTop: '4px' }}>Tallas y colores</div>
        </div>

        <div className="card" onClick={() => onNavigateTab('Inventario')} style={{ cursor: 'pointer' }}>
          <div className="t">
            <span>Agotadas</span>
            <span style={{ fontSize: '18px', color: 'var(--bad)' }}>⊘</span>
          </div>
          <div className="n" style={{ color: outOfStockCount > 0 ? 'var(--bad)' : 'inherit' }}>
            {outOfStockCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--mut)', marginTop: '4px' }}>Requieren reposición</div>
        </div>

        <div className="card" onClick={() => onNavigateTab('Inventario')} style={{ cursor: 'pointer' }}>
          <div className="t">
            <span>Stock bajo</span>
            <span style={{ fontSize: '18px', color: 'var(--warn)' }}>▾</span>
          </div>
          <div className="n" style={{ color: lowStockCount > 0 ? 'var(--warn)' : 'inherit' }}>
            {lowStockCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--mut)', marginTop: '4px' }}>Bajo el umbral mínimo</div>
        </div>
      </div>

      {/* Recent Movements Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ margin: 0 }}>Últimos ajustes de inventario</h2>
          <button className="btn" onClick={() => onNavigateTab('Movimientos')} style={{ fontSize: '12.5px' }}>
            Ver todos los movimientos →
          </button>
        </div>

        <div className="wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>SKU</th>
                <th>Tipo</th>
                <th className="r">Cantidad</th>
                <th>Motivo</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {movements.slice(0, 5).map((m, idx) => (
                <tr key={m.id || idx}>
                  <td>{m.date}</td>
                  <td><code style={{ fontWeight: 600 }}>{m.sku}</code></td>
                  <td>
                    <span className={`badge ${m.type === 'Entrada' ? 'ok' : m.type === 'Venta' ? 'bad' : 'warn'}`}>
                      {m.type}
                    </span>
                  </td>
                  <td className="r" style={{ fontWeight: 600, color: m.quantity > 0 ? 'var(--ok)' : 'var(--fg)' }}>
                    {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                  </td>
                  <td>{m.reason}</td>
                  <td><span style={{ color: 'var(--mut)', fontSize: '12.5px' }}>{m.user}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
