'use client'

import React, { useState, useEffect } from 'react'
import { Variant } from '@/types/database.types'
import { useData } from '@/lib/data/dataContext'
import { getAvailableStock } from '@/lib/data/initialData'

interface StockAdjustmentModalProps {
  variant: Variant | null
  onClose: () => void
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ variant, onClose }) => {
  const { adjustStock } = useData()
  const [type, setType] = useState<'Entrada' | 'Ajuste'>('Entrada')
  const [qty, setQty] = useState<number>(1)
  const [reason, setReason] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  useEffect(() => {
    if (variant) {
      setType('Entrada')
      setQty(1)
      setReason('')
      setError('')
    }
  }, [variant])

  if (!variant) return null

  const currentAvailable = getAvailableStock(variant)
  const previewAvailable = currentAvailable + (isNaN(qty) ? 0 : qty)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const delta = Number(qty)
    if (isNaN(delta) || delta === 0) {
      setError('Ingresa una cantidad distinta de 0.')
      return
    }

    if (type === 'Entrada' && delta < 0) {
      setError('Una entrada debe ser positiva. Usa "Ajuste" para restar unidades.')
      return
    }

    if (!reason.trim()) {
      setError('Escribe el motivo del ajuste.')
      return
    }

    if (currentAvailable + delta < 0) {
      setError(`El ajuste dejaría el stock disponible en negativo (${currentAvailable + delta}).`)
      return
    }

    setIsSubmitting(true)
    const res = await adjustStock(variant.id, delta, type, reason.trim())
    setIsSubmitting(false)

    if (res.success) {
      onClose()
    } else {
      setError(res.error || 'Error al guardar el ajuste')
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700 }}>Ajustar stock</h2>
        <p className="sub" style={{ fontSize: '13px', marginBottom: '16px' }}>
          {variant.product_name} · {variant.size} · {variant.color} (<strong>{variant.sku}</strong>)
        </p>

        {/* Stock preview badge card */}
        <div style={{
          background: 'var(--soft)',
          padding: '12px 14px',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--mut)' }}>Stock disponible actual</div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>{currentAvailable} uds</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: 'var(--mut)' }}>Stock posterior</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: previewAvailable < 0 ? 'var(--bad)' : 'var(--ok)' }}>
              {previewAvailable} uds
            </div>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="fld">
            <label htmlFor="modal-tipo">Tipo de movimiento</label>
            <select
              id="modal-tipo"
              value={type}
              onChange={(e) => setType(e.target.value as 'Entrada' | 'Ajuste')}
            >
              <option value="Entrada">Entrada (Sumar stock)</option>
              <option value="Ajuste">Ajuste manual (Puede sumar o restar)</option>
            </select>
          </div>

          <div className="fld">
            <label htmlFor="modal-qty">Cantidad</label>
            <input
              id="modal-qty"
              type="number"
              step="1"
              value={qty}
              onChange={(e) => setQty(parseInt(e.target.value, 10))}
              placeholder="Ej. 5 o -2"
              required
            />
          </div>

          <div className="fld">
            <label htmlFor="modal-mot">Motivo</label>
            <input
              id="modal-mot"
              type="text"
              placeholder="Ej. reposición de bodega, prenda defectuosa"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="sub" style={{ color: 'var(--bad)', margin: '10px 0 0', fontWeight: 500 }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" className="btn" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="btn p" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar ajuste'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
