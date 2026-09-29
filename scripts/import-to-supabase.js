const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envText = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envText.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) envVars[k.trim()] = v.join('=').trim();
});

const url = envVars.NEXT_PUBLIC_SUPABASE_URL;
const key = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Faltan credenciales de Supabase en .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);

function getCategoryForProduct(name) {
  const n = name.toLowerCase();
  if (n.includes('pant') || n.includes('culotte') || n.includes('palazo') || n.includes('palazzo') || n.includes('jean')) {
    return 'Pantalones';
  }
  if (n.includes('vestido')) {
    return 'Vestidos';
  }
  if (n.includes('top')) {
    return 'Tops';
  }
  if (n.includes('blusa')) {
    return 'Blusas';
  }
  if (n.includes('falda')) {
    return 'Faldas';
  }
  if (n.includes('blazer')) {
    return 'Blazers';
  }
  return 'General';
}

function generateSku(name, index) {
  const words = name.replace(/[^a-zA-Z0-9 ]/g, '').split(/\s+/).filter(Boolean);
  const prefix = words.slice(0, 3).map(w => w.substring(0, 3).toUpperCase()).join('-');
  return `${prefix || 'PROD'}-${String(index + 1).padStart(3, '0')}`;
}

async function main() {
  console.log('--- Iniciando Importación a Supabase DB ---');

  // 1. Cargar json original para extraer datos de productos y portada
  const jsonPath = path.join(__dirname, '..', 'vintage-29-tienda', 'productos.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('No se encontró el archivo productos.json en', jsonPath);
    process.exit(1);
  }
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const catalogData = JSON.parse(raw);

  // 2. Limpiar filas anteriores en Supabase
  console.log('Limpiando tablas en Supabase...');
  await supabase.from('inventory_movements').delete().neq('id', 0);
  await supabase.from('hero_slides').delete().neq('id', 0);
  await supabase.from('variants').delete().neq('id', 0);
  await supabase.from('categories').delete().neq('id', 0);

  // 3. Insertar Categorías
  const categoriesList = ['Pantalones', 'Vestidos', 'Tops', 'Blusas', 'Faldas', 'Blazers'];
  console.log('Insertando categorías...');
  for (const catName of categoriesList) {
    const { error } = await supabase.from('categories').insert({
      name: catName,
      is_active: true,
      description: `Colección de ${catName.toLowerCase()} Vintage 29`
    });
    if (error && error.code !== '23505') {
      console.warn(`Error al insertar categoría ${catName}:`, error.message);
    }
  }

  // 4. Insertar Productos en la tabla 'variants'
  console.log('Insertando productos en la tabla "variants"...');
  const jsonProducts = catalogData.productos || [];
  let count = 0;
  for (let i = 0; i < jsonProducts.length; i++) {
    const prod = jsonProducts[i];
    const category = getCategoryForProduct(prod.nombre);
    const sku = generateSku(prod.nombre, i);
    const price = 129 + (i % 5) * 20; // Precios variados (129, 149, 169, 189, 209)

    const { data, error } = await supabase.from('variants').insert({
      product_name: prod.nombre,
      category: category,
      sku: sku,
      size: 'ESTÁNDAR',
      color: 'Denim / Varios',
      price: price,
      assigned: 12,
      reserved: 0,
      sold: 0,
      threshold: 2,
      is_published: true
    }).select();

    if (error) {
      console.error(`Error al insertar producto ${prod.nombre}:`, error.message);
    } else {
      count++;
      console.log(`[${count}/${jsonProducts.length}] Producto importado a DB: "${prod.nombre}" (SKU: ${sku}, Categoría: ${category}, Precio: S/ ${price})`);
    }
  }

  // 5. Insertar Hero Slides en la tabla 'hero_slides'
  console.log('Insertando slides de portada en "hero_slides"...');
  const jsonPortada = catalogData.portada || [];
  for (let j = 0; j < jsonPortada.length; j++) {
    const item = jsonPortada[j];
    const mediaUrl = `/api/media/${item.ruta.replace(/\\/g, '/')}`;
    const titles = [
      'Vístete con actitud',
      'Nueva Colección Otoño',
      'Edición Vintage Exclusiva'
    ];
    const subtitles = [
      'Tu próximo look favorito está por aquí.',
      'Piezas seleccionadas a mano.',
      'Estilo atemporal y denim premium.'
    ];

    const { error } = await supabase.from('hero_slides').insert({
      type: 'banner',
      zone: 'main',
      title: titles[j] || `Portada ${j + 1}`,
      subtitle: subtitles[j] || '',
      button_text: 'VER NOVEDADES',
      link_url: '/collections/new-arrivals',
      media_url: mediaUrl,
      overlay_opacity: 30,
      alignment: 'center',
      is_published: true,
      order_index: item.orden || (j + 1)
    });

    if (error) {
      console.error(`Error al insertar hero slide ${item.archivo}:`, error.message);
    } else {
      console.log(`Hero Slide ${j + 1} importado: "${item.archivo}" -> ${mediaUrl}`);
    }
  }

  console.log('--- Importación Completada Exitosamente ---');
}

main().catch(err => {
  console.error('Error fatal durante la importación:', err);
  process.exit(1);
});
