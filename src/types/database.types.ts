export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Variant {
  id: number | string
  product_name: string // p
  category: string     // cat
  sku: string          // sku
  size: string         // talla
  color: string        // color
  price: number        // precio
  assigned: number     // asig
  reserved: number     // res
  sold: number         // ven
  threshold: number    // umb
  is_published: boolean // pub
  created_at?: string
  updated_at?: string
}

export interface InventoryMovement {
  id?: number | string
  date: string        // f (YYYY-MM-DD HH:MM)
  sku: string         // s
  type: 'Entrada' | 'Ajuste' | 'Venta' | 'Reserva' // t
  quantity: number    // q
  reason: string      // m
  user: string        // u
  created_at?: string
}

export type SlideZone = 'main' | 'sub'
export type SlideType = 'video' | 'banner'
export type TextAlignment = 'left' | 'center' | 'right'

export interface HeroSlide {
  id: number | string
  type: SlideType     // t: 'video' | 'banner'
  zone: SlideZone     // z: 'main' | 'sub'
  title: string       // titulo
  subtitle: string    // sub
  button_text: string // btn
  link_url: string    // link
  media_url: string   // src
  overlay_opacity: number // ov (0-80)
  alignment: TextAlignment // al ('left' | 'center' | 'right')
  is_published: boolean    // pub
  order_index?: number
  created_at?: string
}

export interface CategoryItem {
  id: number | string
  name: string
  is_active: boolean
  description?: string
  created_at?: string
}

export interface ShippingZone {
  id: number | string
  name: string
  price: number
  estimated_delivery: string
  is_active: boolean
}
