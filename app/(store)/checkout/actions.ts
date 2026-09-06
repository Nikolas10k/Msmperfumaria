"use server";

import { createClient } from "@/lib/supabase/server";
import { createOrder, type CreateOrderInput, type NewAddressInput } from "@/lib/orders/create-order";
import type { CartLine } from "@/lib/cart/cart-context";

export interface CheckoutPayload {
  cartLines: CartLine[];
  addressMode: "existing" | "new";
  existingAddressId?: string;
  newAddress?: NewAddressInput;
  saveNewAddress?: boolean;
  shippingChoice: "express" | "standard";
  couponCode?: string;
  paymentMethod: "pix" | "credit_card" | "debit_card";
  notes?: string;
}

export async function checkoutAction(payload: CheckoutPayload) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, message: "Sua sessão expirou. Entre novamente para finalizar a compra." };
  }

  if (payload.cartLines.length === 0) {
    return { ok: false as const, message: "Seu carrinho está vazio." };
  }

  const address: CreateOrderInput["address"] =
    payload.addressMode === "existing" && payload.existingAddressId
      ? { existingId: payload.existingAddressId }
      : { new: payload.newAddress!, save: payload.saveNewAddress ?? false };

  return createOrder(supabase, {
    customerId: user.id,
    cartLines: payload.cartLines,
    address,
    shippingChoice: payload.shippingChoice,
    couponCode: payload.couponCode,
    paymentMethod: payload.paymentMethod,
    notes: payload.notes,
  });
}
