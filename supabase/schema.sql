-- ==============================================================================
-- Schema SQL para Tienda Vintage 29 en Supabase (Solo Estructura)
-- ==============================================================================

-- 1. Tabla de Categorías
CREATE TABLE IF NOT EXISTS public.categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabla de Variantes / Productos
CREATE TABLE IF NOT EXISTS public.variants (
    id BIGSERIAL PRIMARY KEY,
    product_name TEXT NOT NULL,
    category TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    assigned INTEGER NOT NULL DEFAULT 0,
    reserved INTEGER NOT NULL DEFAULT 0,
    sold INTEGER NOT NULL DEFAULT 0,
    threshold INTEGER NOT NULL DEFAULT 2,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabla de Movimientos de Inventario (Auditoría / Kardex)
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id BIGSERIAL PRIMARY KEY,
    variant_id BIGINT REFERENCES public.variants(id) ON DELETE SET NULL,
    date TEXT NOT NULL DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI'),
    sku TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Entrada', 'Ajuste', 'Venta', 'Reserva')),
    quantity INTEGER NOT NULL,
    reason TEXT NOT NULL,
    user_email TEXT NOT NULL DEFAULT 'admin@vintage29',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Tabla de Portada Web (Hero & Subportadas)
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id BIGSERIAL PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('video', 'banner')),
    zone TEXT NOT NULL CHECK (zone IN ('main', 'sub')),
    title TEXT NOT NULL DEFAULT '',
    subtitle TEXT DEFAULT '',
    button_text TEXT DEFAULT '',
    link_url TEXT DEFAULT '',
    media_url TEXT DEFAULT '',
    overlay_opacity INTEGER NOT NULL DEFAULT 30 CHECK (overlay_opacity >= 0 AND overlay_opacity <= 100),
    alignment TEXT NOT NULL DEFAULT 'center' CHECK (alignment IN ('left', 'center', 'right')),
    is_published BOOLEAN NOT NULL DEFAULT true,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Tabla de Zonas de Envío
CREATE TABLE IF NOT EXISTS public.shipping_zones (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    estimated_delivery TEXT DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para optimizar búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_variants_sku ON public.variants(sku);
CREATE INDEX IF NOT EXISTS idx_variants_category ON public.variants(category);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_sku ON public.inventory_movements(sku);
CREATE INDEX IF NOT EXISTS idx_hero_slides_zone ON public.hero_slides(zone, order_index);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública para el catálogo y portada
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Lectura pública de variantes') THEN
        CREATE POLICY "Lectura pública de variantes" ON public.variants FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Lectura pública de slides') THEN
        CREATE POLICY "Lectura pública de slides" ON public.hero_slides FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Lectura pública de categorias') THEN
        CREATE POLICY "Lectura pública de categorias" ON public.categories FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Lectura pública de envios') THEN
        CREATE POLICY "Lectura pública de envios" ON public.shipping_zones FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Lectura pública de movimientos') THEN
        CREATE POLICY "Lectura pública de movimientos" ON public.inventory_movements FOR SELECT USING (true);
    END IF;
END $$;

-- Políticas de administración con clave anon / autenticada
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Acceso total a variantes') THEN
        CREATE POLICY "Acceso total a variantes" ON public.variants FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Acceso total a movimientos') THEN
        CREATE POLICY "Acceso total a movimientos" ON public.inventory_movements FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Acceso total a slides') THEN
        CREATE POLICY "Acceso total a slides" ON public.hero_slides FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Acceso total a categorias') THEN
        CREATE POLICY "Acceso total a categorias" ON public.categories FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Acceso total a envios') THEN
        CREATE POLICY "Acceso total a envios" ON public.shipping_zones FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;
