'use client'

import React, { useState } from 'react'
import { useData } from '@/lib/data/dataContext'

interface NewProductModalProps {
  isOpen: boolean
  onClose: () => void
}

export const NewProductModal: React.FC<NewProductModalProps> = ({ isOpen, onClose }) => {
  const { categories, addVariant } = useData()
  const [productName, setProductName] = useState('')
  const [category, setCategory] = useState(categories[0]?.name || 'Blazers')
  const [sku, setSku] = useState('')
  const [size, setSize] = useState('M')
  const [color, setColor] = useState('Negro')
  const [price, setPrice] = useState<number>(129)
  const [assigned, setAssigned] = useState<number>(5)
  const [threshold, setThreshold] = useState<number>(2)
  const [isPublished, setIsPublished] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!productName.trim()) {
      setError('Ingresa el nombre del producto.')
      return
    }
    if (!sku.trim()) {
      setError('Ingresa un SKU único para la variante.')
      return
    }

    setIsSubmitting(true)
    const res = await addVariant({
      product_name: productName.trim(),
      category,
      sku: sku.trim().toUpperCase(),
      size,
      color,
      price: Number(price),
      assigned: Number(assigned),
      reserved: 0,
      sold: 0,
      threshold: Number(threshold),
      is_published: isPublished
    })
    setIsSubmitting(false)

    if (res.success) {
      setProductName('')
      setSku('')
      onClose()
    } else {
      setError(res.error || 'Error al guardar el producto')
    }
  }

  // Auto-generate SKU helper
  const autoGenSku = () => {
    const pCode = productName.trim().slice(0, 3).toUpperCase() || 'PRD'
    const cCode = color.trim().slice(0, 3).toUpperCase() || 'COL'
    const sCode = size.toUpperCase()
    setSku(`${pCode}-${cCode}-${sCode}`)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Nuevo Producto / Variante</h2>
          <button className="btn" onClick={onClose} style={{ padding: '4px 8px' }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="fld">
            <label>Nombre del Producto</label>
            <input
              type="text"
              placeholder="Ej. Blazer vintage terciopelo"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </div>

          <div className="two">
            <div className="fld">
              <label>Categoría</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="fld">
              <label>Precio (S/)</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="two">
            <div className="fld">
              <label>Talla</label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="Ej. S, M, L, 28"
                required
              />
            </div>
            <div className="fld">
              <label>Color</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Ej. Beige, Negro"
                required
              />
            </div>
          </div>

          <div className="fld">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>SKU (Código único)</label>
              <button type="button" onClick={autoGenSku} className="btn" style={{ padding: '2px 6px', fontSize: '11px' }}>
                Auto-generar
              </button>
            </div>
            <input
              type="text"
              placeholder="Ej. BLZ-TER-M-NEG"
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
              required
            />
          </div>

          <div className="two">
            <div className="fld">
              <label>Stock inicial asignado</label>
              <input
                type="number"
                value={assigned}
                onChange={(e) => setAssigned(parseInt(e.target.value, 10))}
                required
              />
            </div>
            <div className="fld">
              <label>Umbral stock bajo</label>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value, 10))}
                required
              />
            </div>
          </div>

          <div className="fld" style={{ marginTop: '8px' }}>
            <label className="row" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              Publicar inmediatamente en la tienda
            </label>
          </div>

          {error && <p className="sub" style={{ color: 'var(--bad)', margin: '8px 0 0' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '18px' }}>
            <button type="button" className="btn" onClick={onClose} disabled={isSubmitting}>Cancelar</button>
            <button type="submit" className="btn p" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
