'use client'

import React, { useState } from 'react'
import { useData } from '@/lib/data/dataContext'
import { getAvailableStock, getStockStatus } from '@/lib/data/initialData'
import { Variant } from '@/types/database.types'

interface ProductsViewProps {
  onOpenNewProduct: () => void
  onAdjustVariant: (variant: Variant) => void
}

export const ProductsView: React.FC<ProductsViewProps> = ({ onOpenNewProduct, onAdjustVariant }) => {
  const { variants, deleteVariant } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = variants.filter(v => {
    const matchQuery = !searchQuery ||
      v.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase())

    const status = getStockStatus(v).label
    const matchStatus = !statusFilter || status === statusFilter

    return matchQuery && matchStatus
  })

  return (
    <div>
      <div className="head">
        <div>
          <h1>Productos</h1>
          <p className="sub">Fichas y variantes que se muestran en el catálogo de la tienda</p>
        </div>
        <button className="btn p" onClick={onOpenNewProduct}>
          + Nuevo producto
        </button>
      </div>

      <div className="card">
        <div className="tools">
          <input
            style={{ minWidth: '280px' }}
            placeholder="Buscar por nombre, SKU o categoría..."
            aria-label="Buscar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            aria-label="Filtrar por estado"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Stock bajo">Stock bajo</option>
            <option value="Agotado">Agotado</option>
          </select>

          {(searchQuery || statusFilter) && (
            <button
              className="btn"
              onClick={() => { setSearchQuery(''); setStatusFilter(''); }}
              style={{ fontSize: '12px' }}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="wrap">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>SKU</th>
                <th>Talla</th>
                <th>Color</th>
                <th className="r">Precio</th>
                <th className="r">Disponible</th>
                <th>Estado</th>
                <th>Publicado</th>
                <th className="r">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(v => {
                  const available = getAvailableStock(v)
                  const status = getStockStatus(v)
                  return (
                    <tr key={v.id}>
                      <td style={{ fontWeight: 600 }}>{v.product_name}</td>
                      <td><span className="badge">{v.category}</span></td>
                      <td><code>{v.sku}</code></td>
                      <td>{v.size}</td>
                      <td>{v.color}</td>
                      <td className="r">S/ {Number(v.price).toFixed(2)}</td>
                      <td className="r" style={{ fontWeight: 600 }}>{available}</td>
                      <td>
                        <span className={`badge ${status.badgeClass}`}>{status.label}</span>
                      </td>
                      <td>
                        <span className={`badge ${v.is_published ? 'ok' : 'warn'}`}>
                          {v.is_published ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className="r">
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="btn"
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                            onClick={() => onAdjustVariant(v)}
                            title="Ajustar stock de esta variante"
                          >
                            Ajustar
                          </button>
                          <button
                            className="btn danger"
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                            onClick={() => {
                              if (confirm(`¿Eliminar la variante ${v.sku}?`)) {
                                deleteVariant(v.id)
                              }
                            }}
                            title="Eliminar variante"
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={10} className="empty">
                    No hay variantes con esos filtros. Cambia la búsqueda o el estado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
