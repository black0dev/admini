'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Variant, InventoryMovement, HeroSlide, CategoryItem, ShippingZone } from '@/types/database.types'
import { INITIAL_VARIANTS, INITIAL_MOVEMENTS, INITIAL_SLIDES } from '@/lib/data/initialData'
import { supabase, isSupabaseConfigured, testSupabaseConnection } from '@/lib/supabase/client'

interface DataContextType {
  variants: Variant[]
  movements: InventoryMovement[]
  slides: HeroSlide[]
  categories: CategoryItem[]
  shippingZones: ShippingZone[]
  isLoading: boolean
  isSupabaseConnected: boolean
  connectionStatus: { success: boolean; message: string } | null
  theme: 'light' | 'dark'
  toggleTheme: () => void
  adjustStock: (variantId: number | string, delta: number, type: 'Entrada' | 'Ajuste', reason: string, user?: string) => Promise<{ success: boolean; error?: string }>
  updateSlides: (newSlides: HeroSlide[]) => Promise<{ success: boolean; error?: string }>
  addVariant: (variant: Omit<Variant, 'id'>) => Promise<{ success: boolean; error?: string }>
  deleteVariant: (variantId: number | string) => Promise<{ success: boolean; error?: string }>
  addCategory: (name: string, description?: string) => Promise<{ success: boolean; error?: string }>
  refreshData: () => Promise<void>
  checkConnection: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const STORAGE_KEYS = {
  VARIANTS: 'vintage29_variants',
  MOVEMENTS: 'vintage29_movements',
  SLIDES: 'vintage29_slides',
  THEME: 'vintage29_theme',
}

const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 1, name: 'Blazers', is_active: true, description: 'Blazers de lino y paño vintage' },
  { id: 2, name: 'Pantalones', is_active: true, description: 'Jeans mom fit, rectos y flare' },
  { id: 3, name: 'Blusas', is_active: true, description: 'Blusas en satén y seda' },
  { id: 4, name: 'Vestidos', is_active: true, description: 'Vestidos midi y de fiesta' },
  { id: 5, name: 'Faldas', is_active: true, description: 'Faldas plisadas y vintage' }
]

const INITIAL_SHIPPING: ShippingZone[] = [
  { id: 1, name: 'Lima Metropolitana (Express 24-48h)', price: 12.00, estimated_delivery: '1-2 días hábiles', is_active: true },
  { id: 2, name: 'Provincias / Nivel Nacional (Olva Courier)', price: 18.00, estimated_delivery: '3-5 días hábiles', is_active: true }
]

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [variants, setVariants] = useState<Variant[]>(INITIAL_VARIANTS)
  const [movements, setMovements] = useState<InventoryMovement[]>(INITIAL_MOVEMENTS)
  const [slides, setSlides] = useState<HeroSlide[]>(INITIAL_SLIDES)
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES)
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>(INITIAL_SHIPPING)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false)
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; message: string } | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // Theme initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark' | null
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const activeTheme = savedTheme || (prefersDark ? 'dark' : 'light')
      setTheme(activeTheme)
      document.documentElement.dataset.theme = activeTheme
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.THEME, nextTheme)
      document.documentElement.dataset.theme = nextTheme
    }
  }

  // Load Data function
  const loadData = useCallback(async () => {
    setIsLoading(true)

    if (isSupabaseConfigured && supabase) {
      try {
        const [varRes, movRes, sliRes, catRes, shipRes] = await Promise.all([
          supabase.from('variants').select('*').order('id', { ascending: true }),
          supabase.from('inventory_movements').select('*').order('created_at', { ascending: false }),
          supabase.from('hero_slides').select('*').order('order_index', { ascending: true }),
          supabase.from('categories').select('*').order('name', { ascending: true }),
          supabase.from('shipping_zones').select('*').order('id', { ascending: true })
        ])

        if (!varRes.error) {
          setVariants(varRes.data || [])
          setIsSupabaseConnected(true)
        } else {
          console.warn('Supabase fetch variants error, using local fallback:', varRes.error.message)
        }

        if (!movRes.error) {
          setMovements(movRes.data || [])
        }

        if (!sliRes.error) {
          setSlides(sliRes.data || [])
        }

        if (!catRes.error) {
          setCategories(catRes.data || [])
        }

        if (!shipRes.error) {
          setShippingZones(shipRes.data || [])
        }
      } catch (err) {
        console.error('Error fetching Supabase data:', err)
        loadFromLocalStorage()
      }
    } else {
      loadFromLocalStorage()
    }

    setIsLoading(false)
  }, [])

  const loadFromLocalStorage = () => {
    if (typeof window === 'undefined') return
    try {
      const savedVars = localStorage.getItem(STORAGE_KEYS.VARIANTS)
      const savedMovs = localStorage.getItem(STORAGE_KEYS.MOVEMENTS)
      const savedSlides = localStorage.getItem(STORAGE_KEYS.SLIDES)

      if (savedVars) setVariants(JSON.parse(savedVars))
      if (savedMovs) setMovements(JSON.parse(savedMovs))
      if (savedSlides) setSlides(JSON.parse(savedSlides))
    } catch (e) {
      console.warn('Error reading from localStorage', e)
    }
  }

  const checkConnection = async () => {
    const result = await testSupabaseConnection()
    setConnectionStatus(result)
    setIsSupabaseConnected(result.success)
    if (result.success) {
      await loadData()
    }
  }

  useEffect(() => {
    loadData()
    if (isSupabaseConfigured) {
      checkConnection()
    }
  }, [loadData])

  // Save to localStorage helper when offline
  const saveToLocal = (newVars?: Variant[], newMovs?: InventoryMovement[], newSlides?: HeroSlide[]) => {
    if (typeof window === 'undefined') return
    try {
      if (newVars) localStorage.setItem(STORAGE_KEYS.VARIANTS, JSON.stringify(newVars))
      if (newMovs) localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(newMovs))
      if (newSlides) localStorage.setItem(STORAGE_KEYS.SLIDES, JSON.stringify(newSlides))
    } catch (e) {
      console.warn('Error saving to localStorage', e)
    }
  }

  // Stock Adjustment Mutation
  const adjustStock = async (
    variantId: number | string,
    delta: number,
    type: 'Entrada' | 'Ajuste',
    reason: string,
    user: string = 'admin@vintage29'
  ): Promise<{ success: boolean; error?: string }> => {
    const variantIndex = variants.findIndex(v => v.id == variantId)
    if (variantIndex === -1) return { success: false, error: 'Variante no encontrada.' }

    const target = variants[variantIndex]
    const available = target.assigned - target.sold - target.reserved
    if (available + delta < 0) {
      return { success: false, error: 'El ajuste dejaría el stock disponible en negativo.' }
    }

    const updatedVariant = { ...target, assigned: target.assigned + delta }
    const newMovement: InventoryMovement = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      sku: target.sku,
      type,
      quantity: delta,
      reason,
      user
    }

    const newVariants = [...variants]
    newVariants[variantIndex] = updatedVariant

    const newMovements = [newMovement, ...movements]

    setVariants(newVariants)
    setMovements(newMovements)
    saveToLocal(newVariants, newMovements)

    // Sync with Supabase if online
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('variants')
          .update({ assigned: updatedVariant.assigned, updated_at: new Date().toISOString() })
          .eq('id', target.id)

        await supabase.from('inventory_movements').insert([
          {
            variant_id: target.id,
            sku: target.sku,
            type,
            quantity: delta,
            reason,
            user_email: user,
            date: newMovement.date
          }
        ])
      } catch (err) {
        console.error('Error syncing adjustment with Supabase:', err)
      }
    }

    return { success: true }
  }

  // Update Slides Mutation
  const updateSlides = async (newSlides: HeroSlide[]): Promise<{ success: boolean; error?: string }> => {
    setSlides(newSlides)
    saveToLocal(undefined, undefined, newSlides)

    if (isSupabaseConfigured && supabase) {
      try {
        // Reemplazo limpio en Supabase DB para evitar duplicados y mantener orden exacto
        await supabase.from('hero_slides').delete().neq('id', 0)

        const payloads = newSlides.map((s, idx) => ({
          type: s.type || 'banner',
          zone: s.zone || 'main',
          title: s.title || '',
          subtitle: s.subtitle || '',
          button_text: s.button_text || '',
          link_url: s.link_url || '',
          media_url: s.media_url || '',
          overlay_opacity: s.overlay_opacity ?? 30,
          alignment: s.alignment || 'center',
          is_published: s.is_published ?? true,
          order_index: idx
        }))

        if (payloads.length > 0) {
          const { data, error } = await supabase.from('hero_slides').insert(payloads).select()
          if (!error && data) {
            setSlides(data)
          }
        }
      } catch (err) {
        console.error('Error al sincronizar portadas con Supabase:', err)
      }
    }

    return { success: true }
  }

  // Add Variant Mutation
  const addVariant = async (variantData: Omit<Variant, 'id'>): Promise<{ success: boolean; error?: string }> => {
    const newId = Date.now()
    const newVariant: Variant = { ...variantData, id: newId }
    const updated = [...variants, newVariant]
    setVariants(updated)
    saveToLocal(updated)

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('variants').insert([variantData]).select()
        if (error) throw error
        if (data && data[0]) {
          setVariants(prev => prev.map(v => v.id === newId ? data[0] : v))
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        console.error('Error adding variant in Supabase:', errorMsg)
      }
    }

    return { success: true }
  }

  // Delete Variant Mutation
  const deleteVariant = async (variantId: number | string): Promise<{ success: boolean; error?: string }> => {
    const updated = variants.filter(v => v.id !== variantId)
    setVariants(updated)
    saveToLocal(updated)

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('variants').delete().eq('id', variantId)
      } catch (err) {
        console.error('Error deleting variant from Supabase:', err)
      }
    }

    return { success: true }
  }

  // Add Category Mutation
  const addCategory = async (name: string, description: string = ''): Promise<{ success: boolean; error?: string }> => {
    const newCat: CategoryItem = { id: Date.now(), name, is_active: true, description }
    setCategories(prev => [...prev, newCat])

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('categories').insert([{ name, description, is_active: true }])
      } catch (err) {
        console.error('Error adding category in Supabase:', err)
      }
    }

    return { success: true }
  }

  return (
    <DataContext.Provider
      value={{
        variants,
        movements,
        slides,
        categories,
        shippingZones,
        isLoading,
        isSupabaseConnected,
        connectionStatus,
        theme,
        toggleTheme,
        adjustStock,
        updateSlides,
        addVariant,
        deleteVariant,
        addCategory,
        refreshData: loadData,
        checkConnection
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData(): DataContextType {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
