'use client'

import React, { useState } from 'react'
import { useData } from '@/lib/data/dataContext'
import { getAvailableStock, getStockStatus } from '@/lib/data/initialData'
import { Variant } from '@/types/database.types'

interface InventoryViewProps {
  onAdjustVariant: (variant: Variant) => void
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onAdjustVariant }) => {
  const { variants } = useData()
  const [filterQuery, setFilterQuery] = useState('')

  const filtered = variants.filter(v =>
    !filterQuery ||
    v.product_name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    v.sku.toLowerCase().includes(filterQuery.toLowerCase())
  )

  return (
    <div>
      <div className="head">
        <div>
          <h1>Inventario online</h1>
          <p className="sub">Unidades asignadas al canal de venta online por variante</p>
        </div>
        <div style={{ fontSize: '13px', color: 'var(--mut)' }}>
          Total variantes: <strong>{variants.length}</strong>
        </div>
      </div>

      <div className="card">
        <div className="tools">
          <input
            style={{ minWidth: '300px' }}
            placeholder="Filtrar por producto o SKU..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
          {filterQuery && (
            <button className="btn" onClick={() => setFilterQuery('')} style={{ fontSize: '12px' }}>
              Limpiar
            </button>
          )}
        </div>

        <div className="wrap">
          <table>
            <thead>
              <tr>
                <th>Variante</th>
                <th>SKU</th>
                <th className="r">Asignado</th>
                <th className="r">Reservado</th>
                <th className="r">Vendido</th>
                <th className="r">Disponible</th>
                <th>Estado</th>
                <th className="r">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(v => {
                  const disp = getAvailableStock(v)
                  const status = getStockStatus(v)
                  return (
                    <tr key={v.id}>
                      <td style={{ fontWeight: 600 }}>
                        {v.product_name} · {v.size} · {v.color}
                      </td>
                      <td><code>{v.sku}</code></td>
                      <td className="r">{v.assigned}</td>
                      <td className="r" style={{ color: v.reserved > 0 ? 'var(--warn)' : 'var(--mut)' }}>
                        {v.reserved}
                      </td>
                      <td className="r">{v.sold}</td>
                      <td className="r" style={{ fontWeight: 700, color: disp <= 0 ? 'var(--bad)' : 'var(--fg)' }}>
                        {disp}
                      </td>
                      <td>
                        <span className={`badge ${status.badgeClass}`}>{status.label}</span>
                      </td>
                      <td className="r">
                        <button
                          className="btn"
                          style={{ padding: '4px 10px', fontSize: '12.5px' }}
                          onClick={() => onAdjustVariant(v)}
                        >
                          Ajustar
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={8} className="empty">No se encontraron variantes.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
