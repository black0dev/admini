'use client'

import React, { useState } from 'react'
import { Header, TabName } from '@/components/Header'
import { SupabaseModal } from '@/components/SupabaseModal'
import { StockAdjustmentModal } from '@/components/StockAdjustmentModal'
import { NewProductModal } from '@/components/NewProductModal'
import { DashboardView } from '@/components/views/DashboardView'
import { HeroEditorView } from '@/components/views/HeroEditorView'
import { ProductsView } from '@/components/views/ProductsView'
import { InventoryView } from '@/components/views/InventoryView'
import { MovementsView } from '@/components/views/MovementsView'
import { CategoriesView } from '@/components/views/CategoriesView'
import { ShippingView } from '@/components/views/ShippingView'
import { Variant } from '@/types/database.types'

export const AdminApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabName>('Resumen')
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false)
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false)
  const [selectedVariantForAdjustment, setSelectedVariantForAdjustment] = useState<Variant | null>(null)

  const handleAdjustVariant = (variant: Variant) => {
    setSelectedVariantForAdjustment(variant)
  }

  return (
    <>
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      <main>
        {currentTab === 'Resumen' && (
          <DashboardView onNavigateTab={setCurrentTab} />
        )}
        {currentTab === 'Portada web' && (
          <HeroEditorView />
        )}
        {currentTab === 'Productos' && (
          <ProductsView
            onOpenNewProduct={() => setIsNewProductModalOpen(true)}
            onAdjustVariant={handleAdjustVariant}
          />
        )}
        {currentTab === 'Inventario' && (
          <InventoryView onAdjustVariant={handleAdjustVariant} />
        )}
        {currentTab === 'Movimientos' && (
          <MovementsView />
        )}
        {currentTab === 'Categorías' && (
          <CategoriesView />
        )}
        {currentTab === 'Envíos' && (
          <ShippingView />
        )}
      </main>

      {/* Modals */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      <StockAdjustmentModal
        variant={selectedVariantForAdjustment}
        onClose={() => setSelectedVariantForAdjustment(null)}
      />

      <NewProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
      />
    </>
  )
}
