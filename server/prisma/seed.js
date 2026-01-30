require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set');

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/** Basic slug helper */
function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function upsertCategory({ name, slug }) {
  return prisma.category.upsert({
    where: { slug },
    update: { name },
    create: { name, slug },
  });
}

async function upsertProduct({
  title,
  slug,
  description,
  price,
  salePrice = null,
  stock,
  status = 'ACTIVE',
}) {
  return prisma.product.upsert({
    where: { slug },
    update: {
      title,
      description,
      price,
      salePrice,
      stock,
      status,
    },
    create: {
      title,
      slug,
      description,
      price,
      salePrice,
      stock,
      status,
    },
  });
}

async function linkProductToCategory(productId, categoryId) {
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: { productId, categoryId },
    },
    update: {},
    create: { productId, categoryId },
  });
}

async function main() {
  // 1) Categories
  const categories = [
    { name: 'LED TV Parts', slug: 'led-tv-parts' },
    { name: 'Tools', slug: 'tools' },
    { name: 'Remotes', slug: 'remotes' },
    { name: 'Audio Boards', slug: 'audio-boards' },
    { name: 'Other Items', slug: 'other-items' },
  ];

  const categoryMap = {};
  for (const c of categories) {
    const created = await upsertCategory(c);
    categoryMap[c.slug] = created;
  }

  // 2) Products (Hindi -> English)
  // NOTE: Set your real prices/stocks later. These are seed-safe defaults.
  const productsByCategory = [
    // LED TV Parts
    {
      categorySlug: 'led-tv-parts',
      items: [
        { title: 'Smart Board', description: 'LED TV smart board (main board)' },
        { title: 'Non-Smart Board', description: 'LED TV non-smart main board' },
        { title: 'T-Con Board', description: 'Timing controller board' },
        { title: 'Power Supply Board', description: 'SMPS / power supply board' },
        { title: 'LVDS Cable', description: 'LVDS cable for panel connection' }, // user wrote LBDS, usually LVDS
        { title: 'FFC Cable', description: 'Flat flexible cable' },
        { title: 'Speaker', description: 'LED TV speaker' }, // स्पीकर
        { title: 'Backlight', description: 'LED TV backlight strip / set' }, // बैक लाइट
        { title: 'Audio Board', description: 'LED TV audio board' }, // ऑडियो बोर्ड
        { title: 'Inverter Board', description: 'Backlight inverter board (if applicable)' }, // इनवर्टर बोर्ड
      ],
    },

    // Tools
    {
      categorySlug: 'tools',
      items: [
        { title: 'Multimeter', description: 'Digital/analog multimeter' }, // मल्टी मीटर
        { title: 'Soldering Iron', description: 'Soldering iron' }, // soldring iron
        { title: 'Solder Wire', description: 'Solder wire' }, // solder
        { title: 'Solder Paste', description: 'Solder paste / flux paste' }, // pest
        { title: 'Liquid Flux', description: 'Liquid flux' }, // likvid pest
        { title: 'Continuity Tester', description: 'Continuity tester' }, // कंटीन्यूटी टेस्टर
        { title: 'Cutter', description: 'Wire cutter' }, // कटर
        { title: 'Pliers', description: 'Pliers' }, // प्लास
        { title: 'Screwdriver', description: 'Screwdriver set' }, // पेचकस
      ],
    },

    // Remotes
    {
      categorySlug: 'remotes',
      items: [
        { title: 'LED TV Remote', description: 'Remote for LED TV' },
        { title: 'Set-Top Box Remote', description: 'Remote for set-top box' }, // सेटअप बॉक्स
        { title: 'AC Remote', description: 'Remote for air conditioner' },
        { title: 'Home Theatre Remote', description: 'Remote for home theatre system' },
      ],
    },

    // Audio Boards
    {
      categorySlug: 'audio-boards',
      items: [
        { title: 'Class D Amplifier Board', description: 'Class D audio amplifier board' },
        { title: 'TDA5200 Amplifier Board', description: '5200 series amplifier board' }, // 5200 board
        { title: 'TDA7294 Amplifier Board', description: '7294 amplifier board' }, // 7294 board
        { title: '2N3055 Amplifier Board', description: '3055 transistor amplifier board' }, // 3055 board
        { title: 'TDA2030 Amplifier Board', description: '2030 amplifier board' }, // 2030 board
        { title: 'Bass Treble Tone Control Board', description: 'Bass/treble tone control board' }, // base trable board
      ],
    },

    // Other Items
    {
      categorySlug: 'other-items',
      items: [
        { title: 'Lithium Cell', description: 'Lithium battery cell' }, // लिथियम सैल
        { title: 'Cell Charger', description: 'Battery/cell charger' }, // सेल चार्जर
        { title: 'Battery', description: 'Battery pack/battery' }, // बैटरी
        { title: 'Speaker', description: 'General purpose speaker' }, // स्पीकर (also in tv parts)
        { title: 'Tweeter', description: 'Tweeter speaker' }, // ट्यूटर (assumed tweeter)
        { title: 'Heatsink', description: 'Heatsink for electronics' }, // हाइस (assumed heatsink)
        { title: 'Capacitor', description: 'Electronic capacitor' }, // कंडेंसर
        { title: 'IC', description: 'Integrated circuit' }, // ic
        { title: 'Video Converter', description: 'Audio/video converter' }, // video converter
        { title: 'Transformer', description: 'Electronic transformer' }, // ट्रांसफार्मर
        { title: 'LNB', description: 'Satellite LNB' }, // LNB
        { title: 'Microphone', description: 'Mic / microphone' }, // mic
        { title: 'Adapter', description: 'Power adapter' }, // adopter
      ],
    },
  ];

  // 3) Insert products + link to categories
  // defaults (change these later)
  const DEFAULT_PRICE = '0.00';
  const DEFAULT_STOCK = 10;

  let productCount = 0;

  for (const group of productsByCategory) {
    const category = categoryMap[group.categorySlug];
    if (!category) throw new Error(`Missing category: ${group.categorySlug}`);

    for (const item of group.items) {
      const slug = slugify(item.title);

      const product = await upsertProduct({
        title: item.title,
        slug,
        description: item.description || item.title,
        price: DEFAULT_PRICE,
        salePrice: null,
        stock: DEFAULT_STOCK,
        status: 'ACTIVE',
      });

      await linkProductToCategory(product.id, category.id);
      productCount += 1;
    }
  }

  console.log(`Seed complete ✅ Categories: ${categories.length}, Products: ${productCount}`);
}

main()
  .catch((error) => {
    console.error('Seed failed ❌', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
