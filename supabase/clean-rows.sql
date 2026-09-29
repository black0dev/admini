-- ==============================================================================
-- Script para limpiar todas las filas y dejar solo las tablas vacías
-- ==============================================================================

TRUNCATE TABLE 
    public.inventory_movements,
    public.hero_slides,
    public.variants,
    public.categories,
    public.shipping_zones
RESTART IDENTITY CASCADE;
