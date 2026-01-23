const { prisma } = require('../lib/prisma');

function normalizePrice(value) {
  return typeof value === 'number' ? value : Number(value);
}

function getEffectivePrice(product) {
  if (product.salePrice !== null && product.salePrice !== undefined) {
    return normalizePrice(product.salePrice);
  }
  return normalizePrice(product.price);
}

function calculateTotals(cart) {
  const subtotal = (cart.items || []).reduce((sum, item) => {
    return sum + normalizePrice(item.priceSnapshot) * item.qty;
  }, 0);

  return {
    subtotal,
    totalItems: (cart.items || []).reduce((sum, item) => sum + item.qty, 0)
  };
}

async function getCartForUser(userId) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: 'asc' } }
            }
          }
        }
      }
    }
  });
}

async function addItemToCart(userId, { productId, qty }) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== 'ACTIVE') {
    const error = new Error('Product not available');
    error.status = 404;
    throw error;
  }

  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId }
  });

  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId }
  });

  const nextQty = (existing?.qty || 0) + qty;

  if (nextQty > product.stock) {
    const error = new Error('Insufficient stock');
    error.status = 400;
    throw error;
  }

  const priceSnapshot = getEffectivePrice(product);

  if (existing) {
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { qty: nextQty, priceSnapshot }
    });
  }

  return prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      qty,
      priceSnapshot
    }
  });
}

async function updateCartItem(userId, itemId, qty) {
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cart: { userId } },
    include: { product: true }
  });

  if (!item) {
    const error = new Error('Cart item not found');
    error.status = 404;
    throw error;
  }

  if (qty > item.product.stock) {
    const error = new Error('Insufficient stock');
    error.status = 400;
    throw error;
  }

  const priceSnapshot = getEffectivePrice(item.product);

  return prisma.cartItem.update({
    where: { id: item.id },
    data: { qty, priceSnapshot }
  });
}

async function removeCartItem(userId, itemId) {
  const result = await prisma.cartItem.deleteMany({
    where: { id: itemId, cart: { userId } }
  });

  if (result.count === 0) {
    const error = new Error('Cart item not found');
    error.status = 404;
    throw error;
  }
}

module.exports = {
  getCartForUser,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  calculateTotals,
  getEffectivePrice,
  normalizePrice
};
