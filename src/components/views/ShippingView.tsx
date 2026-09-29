'use client'

import React from 'react'
import { useData } from '@/lib/data/dataContext'

export const ShippingView: React.FC = () => {
  const { shippingZones } = useData()

  return (
    <div>
      <div className="head">
        <div>
          <h1>Envíos y Tarifas</h1>
          <p className="sub">Métodos de entrega y tarifas de envío por zona geográfica</p>
        </div>
        <span className="badge ok" style={{ padding: '6px 14px' }}>
          Etapa 1: En preparación
        </span>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', margin: '0 0 8px' }}>Zonas y Tarifas configuradas</h2>
        <p className="sub" style={{ fontSize: '13px', marginBottom: '16px' }}>
          Estas tarifas serán consumidas por el checkout de la tienda web mediante Supabase.
        </p>

        <div className="wrap">
          <table>
            <thead>
              <tr>
                <th>Zona / Cobertura</th>
                <th>Tiempo Estimado</th>
                <th className="r">Tarifa (S/)</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {shippingZones.map((z) => (
                <tr key={z.id}>
                  <td style={{ fontWeight: 600 }}>{z.name}</td>
                  <td>{z.estimated_delivery}</td>
                  <td className="r" style={{ fontWeight: 700 }}>S/ {Number(z.price).toFixed(2)}</td>
                  <td>
                    <span className="badge ok">Habilitada</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ background: 'var(--soft)', borderStyle: 'dashed' }}>
        <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--mut)' }}>
          💡 <strong>Nota del sistema:</strong> La cotización dinámica por código postal y operador logístico se activará en la etapa 2 con Supabase Edge Functions.
        </p>
      </div>
    </div>
  )
}
