# Admin · Vintage 29 (Next.js + React + Supabase)

Panel de administración moderno para **Vintage 29**, transformado desde HTML/JS monolítico a una arquitectura modular con **React**, **Next.js (App Router)**, **TypeScript** y **Supabase**.

---

## 🚀 Inicio Rápido

### 1. Iniciar servidor de desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## ⚡ Conexión con Supabase

La aplicación funciona en **modo offline/local reactivo** de inmediato y se sincroniza automáticamente en cuanto configures tus credenciales.

### Paso 1: Configura tus variables de entorno
Edita o crea el archivo [`.env.local`](file:///c:/admin/.env.local) en la raíz:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-publica
```

### Paso 2: Ejecuta el Script SQL en Supabase
1. Ingresa a tu panel en [Supabase Dashboard](https://supabase.com/dashboard).
2. Ve a la sección **SQL Editor** -> **New Query**.
3. Copia y pega el contenido de [`supabase/schema.sql`](file:///c:/admin/supabase/schema.sql) y pulsa **Run**.

Este script creará:
- Tablas: `variants`, `inventory_movements`, `hero_slides`, `categories`, `shipping_zones`.
- Índices de rendimiento para búsquedas por SKU, categoría y orden.
- Políticas de seguridad (Row Level Security - RLS).
- Datos iniciales (seed data).

### Paso 3: Comprueba el estado
En el panel superior de la aplicación, haz clic en la píldora **"Supabase: Configurar / Conectado"** para ejecutar la prueba de conexión en tiempo real.

---

## 📁 Estructura del Proyecto

```
admin/
├── src/
│   ├── app/
│   │   ├── globals.css         # Tokens de diseño, temas claro/oscuro y estilos globales
│   │   ├── layout.tsx          # Layout con fuentes Inter y DataProvider reactivo
│   │   └── page.tsx            # Punto de entrada principal
│   ├── components/
│   │   ├── AdminApp.tsx        # Contenedor orquestador
│   │   ├── Header.tsx          # Barra superior, navegación por pestañas y selector de tema
│   │   ├── NewProductModal.tsx # Modal para crear nuevos productos/variantes
│   │   ├── StockAdjustmentModal.tsx # Modal interactivo para ajuste de stock y kardex
│   │   ├── SupabaseModal.tsx   # Modal de diagnóstico y conexión con Supabase
│   │   └── views/
│   │       ├── DashboardView.tsx   # Pestaña Resumen con métricas y últimos movimientos
│   │       ├── HeroEditorView.tsx  # Editor visual de portada y subportadas con live preview
│   │       ├── ProductsView.tsx    # Listado, búsqueda y filtros de catálogo
│   │       ├── InventoryView.tsx   # Gestión de stock disponible/reservado/vendido
│   │       ├── MovementsView.tsx   # Kardex y auditoría de movimientos
│   │       ├── CategoriesView.tsx  # Gestión de categorías
│   │       └── ShippingView.tsx    # Tarifas y zonas de envío
│   ├── lib/
│   │   ├── data/
│   │   │   ├── dataContext.tsx # Contexto con sincronización híbrida (Supabase + LocalStorage)
│   │   │   └── initialData.ts  # Datos iniciales y helpers de cálculo de stock
│   │   └── supabase/
│   │       └── client.ts       # Cliente Supabase tipado y función de test
│   └── types/
│       └── database.types.ts   # Tipos e interfaces de base de datos
├── supabase/
│   └── schema.sql              # Esquema DDL + RLS + Seed Data
├── .env.local.example          # Plantilla de variables de entorno
└── .env.local                  # Archivo local de configuración
```
