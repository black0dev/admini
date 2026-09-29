'use client'

import React, { useState } from 'react'
import { useData } from '@/lib/data/dataContext'

export const CategoriesView: React.FC = () => {
  const { variants, categories, addCategory } = useData()
  const [newCatName, setNewCatName] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  // Count variants per category
  const counts: Record<string, number> = {}
  variants.forEach(v => {
    counts[v.category] = (counts[v.category] || 0) + 1
  })

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return
    await addCategory(newCatName.trim())
    setNewCatName('')
    setShowAddForm(false)
  }

  return (
    <div>
      <div className="head">
        <div>
          <h1>Categorías</h1>
          <p className="sub">Cómo se agrupan y organizan los productos en la tienda</p>
        </div>
        <button className="btn p" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancelar' : '+ Nueva categoría'}
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <form onSubmit={handleCreateCategory} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Nombre de la categoría (ej. Accesorios)"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              style={{ minWidth: '260px' }}
              required
            />
            <button type="submit" className="btn p">Guardar categoría</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre de Categoría</th>
                <th>Descripción</th>
                <th className="r">Variantes asociadas</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td style={{ fontWeight: 600 }}>{cat.name}</td>
                  <td style={{ color: 'var(--mut)' }}>{cat.description || 'Sin descripción'}</td>
                  <td className="r" style={{ fontWeight: 600 }}>{counts[cat.name] || 0}</td>
                  <td>
                    <span className={`badge ${cat.is_active ? 'ok' : 'warn'}`}>
                      {cat.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
