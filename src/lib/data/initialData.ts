import { Variant, InventoryMovement, HeroSlide } from '@/types/database.types'

export const INITIAL_VARIANTS: Variant[] = [
  { id: 1, product_name: 'Blazer oversize lino', category: 'Blazers', sku: 'BLZ-LIN-M-BEI', size: 'M', color: 'Beige', price: 189, assigned: 6, reserved: 1, sold: 2, threshold: 2, is_published: true },
  { id: 2, product_name: 'Blazer oversize lino', category: 'Blazers', sku: 'BLZ-LIN-L-BEI', size: 'L', color: 'Beige', price: 189, assigned: 4, reserved: 0, sold: 4, threshold: 2, is_published: true },
  { id: 3, product_name: 'Jean mom fit', category: 'Pantalones', sku: 'JEA-MOM-28-AZU', size: '28', color: 'Azul', price: 139, assigned: 8, reserved: 2, sold: 4, threshold: 3, is_published: true },
  { id: 4, product_name: 'Jean mom fit', category: 'Pantalones', sku: 'JEA-MOM-30-AZU', size: '30', color: 'Azul', price: 139, assigned: 5, reserved: 0, sold: 3, threshold: 3, is_published: true },
  { id: 5, product_name: 'Blusa satén', category: 'Blusas', sku: 'BLU-SAT-S-NEG', size: 'S', color: 'Negro', price: 99, assigned: 10, reserved: 0, sold: 3, threshold: 2, is_published: true },
  { id: 6, product_name: 'Blusa satén', category: 'Blusas', sku: 'BLU-SAT-M-VIN', size: 'M', color: 'Vino', price: 99, assigned: 3, reserved: 1, sold: 2, threshold: 2, is_published: true },
  { id: 7, product_name: 'Vestido midi floral', category: 'Vestidos', sku: 'VES-FLO-S-VER', size: 'S', color: 'Verde', price: 159, assigned: 2, reserved: 0, sold: 0, threshold: 2, is_published: false },
  { id: 8, product_name: 'Falda plisada', category: 'Faldas', sku: 'FAL-PLI-M-CAM', size: 'M', color: 'Camel', price: 119, assigned: 4, reserved: 0, sold: 1, threshold: 2, is_published: true }
]

export const INITIAL_MOVEMENTS: InventoryMovement[] = [
  { id: 1, date: '2026-09-28 09:12', sku: 'BLU-SAT-M-VIN', type: 'Ajuste', quantity: -1, reason: 'Prenda con defecto', user: 'marketing@vintage29' },
  { id: 2, date: '2026-09-27 17:40', sku: 'JEA-MOM-28-AZU', type: 'Entrada', quantity: 4, reason: 'Reposición de bodega', user: 'admin@vintage29' },
  { id: 3, date: '2026-09-26 11:05', sku: 'BLZ-LIN-L-BEI', type: 'Venta', quantity: -1, reason: 'Pedido pagado', user: 'sistema' }
]

export const INITIAL_SLIDES: HeroSlide[] = [
  {
    id: 1,
    type: 'video',
    zone: 'main',
    title: 'Nueva colección de otoño',
    subtitle: 'Piezas vintage elegidas a mano',
    button_text: 'Ver colección',
    link_url: '/catalogo',
    media_url: '',
    overlay_opacity: 40,
    alignment: 'left',
    is_published: true,
    order_index: 0
  },
  {
    id: 2,
    type: 'banner',
    zone: 'main',
    title: 'Blazers de lino',
    subtitle: 'Últimas unidades disponibles',
    button_text: 'Comprar ahora',
    link_url: '/categoria/blazers',
    media_url: '',
    overlay_opacity: 30,
    alignment: 'center',
    is_published: true,
    order_index: 1
  },
  {
    id: 3,
    type: 'banner',
    zone: 'sub',
    title: 'Blazers',
    subtitle: '',
    button_text: 'Ver más',
    link_url: '/categoria/blazers',
    media_url: '',
    overlay_opacity: 30,
    alignment: 'center',
    is_published: true,
    order_index: 0
  },
  {
    id: 4,
    type: 'banner',
    zone: 'sub',
    title: 'Jeans',
    subtitle: '',
    button_text: 'Ver más',
    link_url: '/categoria/pantalones',
    media_url: '',
    overlay_opacity: 30,
    alignment: 'center',
    is_published: true,
    order_index: 1
  },
  {
    id: 5,
    type: 'banner',
    zone: 'sub',
    title: 'Blusas',
    subtitle: '',
    button_text: 'Ver más',
    link_url: '/categoria/blusas',
    media_url: '',
    overlay_opacity: 30,
    alignment: 'center',
    is_published: true,
    order_index: 2
  }
]

export function getAvailableStock(variant: Variant): number {
  return variant.assigned - variant.sold - variant.reserved
}

export function getStockStatus(variant: Variant): { label: 'Agotado' | 'Stock bajo' | 'Disponible'; badgeClass: 'bad' | 'warn' | 'ok' } {
  const disp = getAvailableStock(variant)
  if (disp <= 0) {
    return { label: 'Agotado', badgeClass: 'bad' }
  }
  if (disp <= variant.threshold) {
    return { label: 'Stock bajo', badgeClass: 'warn' }
  }
  return { label: 'Disponible', badgeClass: 'ok' }
}
