import { atom, computed } from 'nanostores';

/**
 * Cart item schema:
 * {
 *   cartKey: string,         // Unique key: id + sorted extras fingerprint + aclaracion
 *   id_producto: string,
 *   nombre: string,
 *   precioBase: number,
 *   cantidad: number,
 *   extras: Array<{ nombre: string, precio: number }>,
 *   aclaracion: string,      // Per-product note (e.g. "sin cebolla")
 *   subtotalItem: number     // (precioBase + sum of extras) * cantidad
 * }
 */

/** @type {import('nanostores').WritableAtom<Array>} */
export const cartItems = atom([]);

export const cartTotal = computed(cartItems, (items) =>
    items.reduce((sum, item) => sum + item.subtotalItem, 0)
);

export const cartCount = computed(cartItems, (items) =>
    items.reduce((sum, item) => sum + item.cantidad, 0)
);

/**
 * Generates a unique cart key for the product + extras + aclaracion combination.
 * This way, the same product with different extras or aclaracion becomes a separate line.
 */
function generateCartKey(productId, extras = [], aclaracion = '') {
    const extrasFingerprint = extras
        .map(e => `${e.nombre}:${e.precio}`)
        .sort()
        .join('|');
    const aclNorm = aclaracion.trim().toLowerCase();
    const parts = [productId];
    if (extrasFingerprint) parts.push(extrasFingerprint);
    if (aclNorm) parts.push(`acl:${aclNorm}`);
    return parts.join('__');
}

/**
 * Calculates the subtotal for an item: (precioBase + sum of extras) * cantidad
 */
function calcSubtotal(precioBase, extras, cantidad) {
    const extrasTotal = extras.reduce((sum, e) => sum + e.precio, 0);
    return (precioBase + extrasTotal) * cantidad;
}

/**
 * @param {{ id: string, nombre: string, precio: number, extras?: Array<{ nombre: string, precio: number }>, aclaracion?: string }} product
 */
export function addToCart(product) {
    const extras = product.extras || [];
    const aclaracion = product.aclaracion || '';
    const cartKey = generateCartKey(product.id, extras, aclaracion);
    const current = cartItems.get();
    const existing = current.find((i) => i.cartKey === cartKey);

    if (existing) {
        const newQty = existing.cantidad + 1;
        cartItems.set(
            current.map((i) =>
                i.cartKey === cartKey
                    ? {
                        ...i,
                        cantidad: newQty,
                        subtotalItem: calcSubtotal(i.precioBase, i.extras, newQty)
                    }
                    : i
            )
        );
    } else {
        cartItems.set([
            ...current,
            {
                cartKey,
                id_producto: product.id,
                nombre: product.nombre,
                precioBase: product.precio,
                cantidad: 1,
                extras,
                aclaracion,
                subtotalItem: calcSubtotal(product.precio, extras, 1)
            }
        ]);
    }
}

/**
 * @param {string} cartKey
 */
export function removeFromCart(cartKey) {
    const current = cartItems.get();
    const existing = current.find((i) => i.cartKey === cartKey);
    if (!existing) return;
    if (existing.cantidad === 1) {
        cartItems.set(current.filter((i) => i.cartKey !== cartKey));
    } else {
        const newQty = existing.cantidad - 1;
        cartItems.set(
            current.map((i) =>
                i.cartKey === cartKey
                    ? {
                        ...i,
                        cantidad: newQty,
                        subtotalItem: calcSubtotal(i.precioBase, i.extras, newQty)
                    }
                    : i
            )
        );
    }
}

export function clearCart() {
    cartItems.set([]);
}
