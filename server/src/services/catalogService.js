const { prisma } = require('../lib/prisma');
const { slugify } = require('../lib/slugify');

async function ensureUniqueSlug(baseSlug, model, slugField) {
  let slug = baseSlug;
  let attempt = 1;

  while (true) {
    const existing = await prisma[model].findUnique({
      where: { [slugField]: slug }
    });

    if (!existing) {
      return slug;
    }

    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }
}

async function createCategory({ name, slug }) {
  const baseSlug = slug ? slugify(slug) : slugify(name);
  const uniqueSlug = await ensureUniqueSlug(baseSlug, 'category', 'slug');

  return prisma.category.create({
    data: { name, slug: uniqueSlug }
  });
}

async function updateCategory(id, { name, slug }) {
  const data = {};
  if (name) {
    data.name = name;
  }

  if (slug || name) {
    const baseSlug = slug ? slugify(slug) : slugify(name);
    data.slug = await ensureUniqueSlug(baseSlug, 'category', 'slug');
  }

  return prisma.category.update({
    where: { id },
    data
  });
}

async function createProduct(payload) {
  const baseSlug = payload.slug ? slugify(payload.slug) : slugify(payload.title);
  const uniqueSlug = await ensureUniqueSlug(baseSlug, 'product', 'slug');

  return prisma.product.create({
    data: {
      title: payload.title,
      slug: uniqueSlug,
      description: payload.description,
      price: payload.price,
      salePrice: payload.salePrice,
      stock: payload.stock,
      status: payload.status,
      categories: payload.categoryIds?.length
        ? {
            createMany: {
              data: payload.categoryIds.map((categoryId) => ({ categoryId }))
            }
          }
        : undefined
    },
    include: {
      categories: { include: { category: true } },
      images: true
    }
  });
}

async function updateProduct(id, payload) {
  const data = {
    title: payload.title,
    description: payload.description,
    price: payload.price,
    salePrice: payload.salePrice,
    stock: payload.stock,
    status: payload.status
  };

  if (payload.slug || payload.title) {
    const baseSlug = payload.slug ? slugify(payload.slug) : slugify(payload.title);
    data.slug = await ensureUniqueSlug(baseSlug, 'product', 'slug');
  }

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.update({
      where: { id },
      data,
      include: { images: true }
    });

    if (payload.categoryIds) {
      await tx.productCategory.deleteMany({ where: { productId: id } });
      if (payload.categoryIds.length) {
        await tx.productCategory.createMany({
          data: payload.categoryIds.map((categoryId) => ({ productId: id, categoryId }))
        });
      }
    }

    const updated = await tx.product.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        images: true
      }
    });

    return updated;
  });
}

module.exports = {
  ensureUniqueSlug,
  createCategory,
  updateCategory,
  createProduct,
  updateProduct
};
