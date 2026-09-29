'use client'

import React, { useState } from 'react'
import { HeroSlide, SlideZone, SlideType, TextAlignment } from '@/types/database.types'
import { useData } from '@/lib/data/dataContext'

const ZONE_INFO = {
  main: {
    title: 'Portada principal',
    desc: 'Video o imagen grande que se ve primero al entrar a la tienda.',
    note: 'Vista previa en formato 16:9. Si hay varios elementos, la tienda los muestra en carrusel.'
  },
  sub: {
    title: 'Sub portadas',
    desc: 'Bloques más pequeños debajo de la portada, por ejemplo para categorías u ofertas destacadas.',
    note: 'Vista previa de los bloques en cuadrícula. El bloque seleccionado tiene un borde resaltado.'
  }
}

export const HeroEditorView: React.FC = () => {
  const { slides, updateSlides } = useData()
  const [currentZone, setCurrentZone] = useState<SlideZone>('main')
  const [selectedId, setSelectedId] = useState<number | string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string>('')
  const [isSaving, setIsSaving] = useState<boolean>(false)

  // Filter slides by zone
  const zoneSlides = slides.filter(s => s.zone === currentZone)

  // Active slide
  const activeSlide = zoneSlides.find(s => s.id === selectedId) || zoneSlides[0] || null

  const handleSelectZone = (zone: SlideZone) => {
    setCurrentZone(zone)
    const firstInZone = slides.find(s => s.zone === zone)
    setSelectedId(firstInZone ? firstInZone.id : null)
  }

  const handleAddSlide = (type: SlideType) => {
    const newSlide: HeroSlide = {
      id: Date.now(),
      type,
      zone: currentZone,
      title: type === 'video' ? 'Nuevo video' : 'Nueva imagen',
      subtitle: '',
      button_text: 'Ver más',
      link_url: '/catalogo',
      media_url: '',
      overlay_opacity: 40,
      alignment: currentZone === 'sub' ? 'center' : 'left',
      is_published: false,
      order_index: slides.length
    }
    const updated = [...slides, newSlide]
    updateSlides(updated)
    setSelectedId(newSlide.id)
  }

  const handleUpdateActiveField = (field: keyof HeroSlide, value: any) => {
    if (!activeSlide) return
    const updated = slides.map(s => {
      if (s.id === activeSlide.id) {
        return { ...s, [field]: value }
      }
      return s
    })
    updateSlides(updated)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeSlide) return

    if (activeSlide.type === 'video') {
      const url = URL.createObjectURL(file)
      handleUpdateActiveField('media_url', url)
    } else {
      const reader = new FileReader()
      reader.onload = () => {
        handleUpdateActiveField('media_url', reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDeleteActive = () => {
    if (!activeSlide) return
    const updated = slides.filter(s => s.id !== activeSlide.id)
    updateSlides(updated)
    const remainingInZone = updated.filter(s => s.zone === currentZone)
    setSelectedId(remainingInZone[0]?.id || null)
  }

  const handleMove = (direction: 'up' | 'down') => {
    if (!activeSlide) return
    const currentIdx = zoneSlides.findIndex(s => s.id === activeSlide.id)
    if (direction === 'up' && currentIdx <= 0) return
    if (direction === 'down' && currentIdx >= zoneSlides.length - 1) return

    const targetIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1
    const targetSlide = zoneSlides[targetIdx]

    // Swap in main array
    const updated = [...slides]
    const idxA = updated.findIndex(s => s.id === activeSlide.id)
    const idxB = updated.findIndex(s => s.id === targetSlide.id)
    const temp = updated[idxA]
    updated[idxA] = updated[idxB]
    updated[idxB] = temp

    updateSlides(updated)
  }

  const handleSave = async () => {
    setIsSaving(true)
    await updateSlides(slides)
    setIsSaving(false)
    setSaveMessage('✓ Cambios guardados correctamente.')
    setTimeout(() => setSaveMessage(''), 3000)
  }

  // Render a Preview Tile
  const renderTile = (slide: HeroSlide, isSelected: boolean) => {
    return (
      <div
        key={slide.id}
        className={`tile ${isSelected ? 'sel' : ''}`}
        onClick={() => setSelectedId(slide.id)}
        style={{ cursor: 'pointer' }}
      >
        {slide.media_url ? (
          slide.type === 'video' ? (
            <video
              src={slide.media_url}
              className="pm"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={slide.media_url}
              alt={slide.title}
              className="pm"
            />
          )
        ) : (
          <div
            className="pm"
            style={{
              background: 'linear-gradient(135deg, #2b1f1a, #523b32)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '12px'
            }}
          >
            Sin archivo multimedia
          </div>
        )}

        <div
          className="po"
          style={{ background: `rgba(0, 0, 0, ${slide.overlay_opacity / 100})` }}
        />

        <div
          className="pc"
          style={{
            textAlign: slide.alignment,
            alignItems:
              slide.alignment === 'left'
                ? 'flex-start'
                : slide.alignment === 'right'
                ? 'flex-end'
                : 'center'
          }}
        >
          <h2>{slide.title || 'Título de ejemplo'}</h2>
          {slide.subtitle && <p>{slide.subtitle}</p>}
          {slide.button_text && <span className="pb">{slide.button_text}</span>}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="head">
        <div>
          <h1>Portada web</h1>
          <p className="sub">Edita lo que ven tus clientas al entrar a la tienda</p>
        </div>
        <button className="btn p" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      {saveMessage && (
        <div style={{ color: 'var(--ok)', fontWeight: 600, marginBottom: '14px', fontSize: '13.5px' }}>
          {saveMessage}
        </div>
      )}

      <div className="pgrid">
        {/* Left column: Controls and form */}
        <div className="card">
          <div className="row" role="group" aria-label="Zona de la portada" style={{ marginBottom: '16px' }}>
            <button
              className="btn"
              aria-pressed={currentZone === 'main'}
              onClick={() => handleSelectZone('main')}
            >
              Portada principal
            </button>
            <button
              className="btn"
              aria-pressed={currentZone === 'sub'}
              onClick={() => handleSelectZone('sub')}
            >
              Sub portadas
            </button>
          </div>

          <h2 style={{ fontSize: '18px', margin: '0 0 4px' }}>{ZONE_INFO[currentZone].title}</h2>
          <p className="sub" style={{ margin: '0 0 16px', fontSize: '13px' }}>
            {ZONE_INFO[currentZone].desc}
          </p>

          {/* Slide list */}
          <ul className="pl">
            {zoneSlides.length > 0 ? (
              zoneSlides.map((slide) => (
                <li key={slide.id}>
                  <button
                    className="pi"
                    aria-current={activeSlide?.id === slide.id}
                    onClick={() => setSelectedId(slide.id)}
                  >
                    <span className="badge">
                      {slide.type === 'video' ? '🎬 Video' : '🖼️ Imagen'}
                    </span>
                    <span style={{ fontWeight: 500, flex: 1, textAlign: 'left' }}>
                      {slide.title || 'Sin título'}
                    </span>
                    {!slide.is_published && <span className="badge warn">Oculto</span>}
                  </button>
                </li>
              ))
            ) : (
              <li className="empty">Aún no hay elementos en esta sección.</li>
            )}
          </ul>

          <div className="row" style={{ marginBottom: '20px' }}>
            <button className="btn" onClick={() => handleAddSlide('video')}>
              + Agregar video
            </button>
            <button className="btn" onClick={() => handleAddSlide('banner')}>
              + Agregar imagen
            </button>
          </div>

          {/* Active slide editor form */}
          {activeSlide ? (
            <div style={{ borderTop: '1px solid var(--bd)', paddingTop: '18px' }}>
              <div className="fld">
                <label htmlFor="p-file">
                  {activeSlide.type === 'video'
                    ? 'Archivo de video (MP4 o WebM)'
                    : 'Imagen (JPG, PNG o WebP)'}
                </label>
                <input
                  id="p-file"
                  type="file"
                  accept={activeSlide.type === 'video' ? 'video/*' : 'image/*'}
                  onChange={handleFileUpload}
                />
                <span className="pnote" style={{ margin: 0 }}>
                  {activeSlide.media_url ? 'Archivo o URL cargado.' : 'Aún no subiste un archivo.'}
                </span>
              </div>

              <div className="fld">
                <label htmlFor="p-url">O pega la dirección URL del recurso</label>
                <input
                  id="p-url"
                  type="url"
                  placeholder="https://..."
                  value={activeSlide.media_url}
                  onChange={(e) => handleUpdateActiveField('media_url', e.target.value)}
                />
              </div>

              <div className="fld">
                <label htmlFor="p-title">Título</label>
                <input
                  id="p-title"
                  type="text"
                  value={activeSlide.title}
                  onChange={(e) => handleUpdateActiveField('title', e.target.value)}
                />
              </div>

              <div className="fld">
                <label htmlFor="p-sub">Subtítulo</label>
                <input
                  id="p-sub"
                  type="text"
                  value={activeSlide.subtitle}
                  onChange={(e) => handleUpdateActiveField('subtitle', e.target.value)}
                />
              </div>

              <div className="two">
                <div className="fld">
                  <label htmlFor="p-btn">Texto del botón</label>
                  <input
                    id="p-btn"
                    type="text"
                    value={activeSlide.button_text}
                    onChange={(e) => handleUpdateActiveField('button_text', e.target.value)}
                  />
                </div>
                <div className="fld">
                  <label htmlFor="p-link">Enlace de destino</label>
                  <input
                    id="p-link"
                    type="text"
                    value={activeSlide.link_url}
                    onChange={(e) => handleUpdateActiveField('link_url', e.target.value)}
                  />
                </div>
              </div>

              <div className="two">
                <div className="fld">
                  <label htmlFor="p-al">Alineación del texto</label>
                  <select
                    id="p-al"
                    value={activeSlide.alignment}
                    onChange={(e) => handleUpdateActiveField('alignment', e.target.value as TextAlignment)}
                  >
                    <option value="left">Izquierda</option>
                    <option value="center">Centro</option>
                    <option value="right">Derecha</option>
                  </select>
                </div>
                <div className="fld">
                  <label htmlFor="p-ov">
                    Oscurecer fondo: <strong>{activeSlide.overlay_opacity}%</strong>
                  </label>
                  <input
                    id="p-ov"
                    type="range"
                    min="0"
                    max="80"
                    value={activeSlide.overlay_opacity}
                    onChange={(e) => handleUpdateActiveField('overlay_opacity', Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="row" style={{ justifyContent: 'space-between', marginTop: '14px' }}>
                <label className="row" style={{ cursor: 'pointer', fontSize: '13.5px' }}>
                  <input
                    type="checkbox"
                    checked={activeSlide.is_published}
                    onChange={(e) => handleUpdateActiveField('is_published', e.target.checked)}
                  />
                  Publicado en la tienda
                </label>

                <div className="row">
                  <button
                    className="btn"
                    onClick={() => handleMove('up')}
                    title="Subir en la lista"
                    aria-label="Subir en la lista"
                  >
                    ↑
                  </button>
                  <button
                    className="btn"
                    onClick={() => handleMove('down')}
                    title="Bajar en la lista"
                    aria-label="Bajar en la lista"
                  >
                    ↓
                  </button>
                  <button
                    className="btn danger"
                    onClick={handleDeleteActive}
                    title="Eliminar este elemento"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="empty">Selecciona o agrega un elemento para editar.</p>
          )}
        </div>

        {/* Right column: Sticky live preview */}
        <div className="psticky">
          <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '13.5px' }}>Vista previa en tiempo real</span>
            <span style={{ fontSize: '12px', color: 'var(--mut)' }}>Tienda Vintage 29</span>
          </div>

          <div id="prev" aria-label="Vista previa" className={currentZone === 'sub' ? 'pvn' : ''}>
            {currentZone === 'sub' ? (
              zoneSlides.map(slide => renderTile(slide, slide.id === activeSlide?.id))
            ) : (
              activeSlide ? renderTile(activeSlide, false) : (
                <div className="tile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  No hay portada configurada
                </div>
              )
            )}
          </div>

          <p className="pnote">{ZONE_INFO[currentZone].note}</p>
        </div>
      </div>
    </div>
  )
}
