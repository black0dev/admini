'use client'

import React, { useState } from 'react'
import { useData } from '@/lib/data/dataContext'

export const MovementsView: React.FC = () => {
  const { movements } = useData()
  const [filterType, setFilterType] = useState('')
  const [filterSku, setFilterSku] = useState('')

  const filtered = movements.filter(m => {
    const matchType = !filterType || m.type === filterType
    const matchSku = !filterSku || m.sku.toLowerCase().includes(filterSku.toLowerCase())
    return matchType && matchSku
  })

  return (
    <div>
      <div className="head">
        <div>
          <h1>Movimientos de inventario</h1>
          <p className="sub">Historial de auditoría: entradas, ajustes, reservas y ventas</p>
        </div>
        <div style={{ fontSize: '13px', color: 'var(--mut)' }}>
          Total registros: <strong>{movements.length}</strong>
        </div>
      </div>

      <div className="card">
        <div className="tools">
          <input
            placeholder="Filtrar por SKU..."
            value={filterSku}
            onChange={(e) => setFilterSku(e.target.value)}
          />

          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">Todos los tipos</option>
            <option value="Entrada">Entradas</option>
            <option value="Ajuste">Ajustes</option>
            <option value="Venta">Ventas</option>
            <option value="Reserva">Reservas</option>
          </select>

          {(filterSku || filterType) && (
            <button
              className="btn"
              onClick={() => { setFilterSku(''); setFilterType(''); }}
              style={{ fontSize: '12px' }}
            >
              Limpiar
            </button>
          )}
        </div>

        <div className="wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>SKU</th>
                <th>Tipo</th>
                <th className="r">Cantidad</th>
                <th>Motivo</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((m, idx) => (
                  <tr key={m.id || idx}>
                    <td>{m.date}</td>
                    <td><code>{m.sku}</code></td>
                    <td>
                      <span className={`badge ${m.type === 'Entrada' ? 'ok' : m.type === 'Venta' ? 'bad' : 'warn'}`}>
                        {m.type}
                      </span>
                    </td>
                    <td className="r" style={{ fontWeight: 600, color: m.quantity > 0 ? 'var(--ok)' : 'var(--fg)' }}>
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </td>
                    <td>{m.reason}</td>
                    <td><span style={{ color: 'var(--mut)' }}>{m.user}</span></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="empty">No hay movimientos que coincidan con los filtros.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
