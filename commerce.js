(function () {
  'use strict';

  const constants = Object.freeze({
    freeShippingThresholdCents: 5000,
    shippingCents: 370,
    welcomeDiscountPerItemCents: 1000,
    welcomeDurationMs: 600000
  });

  function calculateCart(cart, products, offerActive = false) {
    const productsById = new Map(products.map(product => [product.id, product]));
    let quantity = 0;
    let subtotalCents = 0;
    let discountCents = 0;

    for (const item of cart) {
      const product = productsById.get(item.id);
      if (!product) throw new Error(`Prodotto non valido: ${item.id}`);
      if (!Number.isSafeInteger(item.quantity) || item.quantity < 1) {
        throw new Error('La quantità deve essere un intero positivo.');
      }
      if (!Number.isFinite(product.price) || product.price < 0) {
        throw new Error(`Prezzo non valido: ${item.id}`);
      }

      const priceCents = Math.round((product.price + Number.EPSILON) * 100);
      quantity += item.quantity;
      subtotalCents += priceCents * item.quantity;
      if (offerActive) {
        discountCents += Math.min(priceCents, constants.welcomeDiscountPerItemCents) * item.quantity;
      }
    }

    if (![quantity, subtotalCents, discountCents].every(Number.isSafeInteger)) {
      throw new Error('Il totale del carrello supera il limite supportato.');
    }

    const merchandiseCents = subtotalCents - discountCents;
    const freeShipping = quantity > 0 && merchandiseCents >= constants.freeShippingThresholdCents;
    const shippingCents = quantity === 0 || freeShipping ? 0 : constants.shippingCents;

    return {
      quantity,
      subtotalCents,
      discountCents,
      merchandiseCents,
      shippingCents,
      totalCents: merchandiseCents + shippingCents,
      remainingForFreeShippingCents: Math.max(0, constants.freeShippingThresholdCents - merchandiseCents),
      freeShippingProgress: Math.min(100, merchandiseCents / constants.freeShippingThresholdCents * 100),
      freeShipping
    };
  }

  window.RealPieceCommerce = Object.freeze({ constants, calculateCart });
})();
