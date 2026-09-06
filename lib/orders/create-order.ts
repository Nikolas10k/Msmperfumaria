import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { getCartDetails } from "@/lib/cart/queries";
import { checkExpressDelivery, type ExpressRegion } from "@/lib/shipping/brasilia";
import { validateCoupon } from "@/lib/coupons/validate";
import type { CartLine } from "@/lib/cart/cart-context";

export interface NewAddressInput {
  label: string;
  recipientName: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface CreateOrderInput {
  customerId: string;
  cartLines: CartLine[];
  address: { existingId: string } | { new: NewAddressInput; save: boolean };
  shippingChoice: "express" | "standard";
  couponCode?: string;
  paymentMethod: "pix" | "credit_card" | "debit_card";
  notes?: string;
}

export type CreateOrderResult =
  | { ok: true; orderId: string; orderNumber: string }
  | { ok: false; message: string };

export async function createOrder(
  supabase: SupabaseClient<Database>,
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const cartDetails = await getCartDetails(supabase, input.cartLines);
  const validLines = cartDetails.filter((l) => l.isActive && l.availableStock >= l.quantity);

  if (validLines.length === 0) {
    return { ok: false, message: "Seu carrinho está vazio ou os itens não estão mais disponíveis." };
  }
  if (validLines.length !== cartDetails.length) {
    return {
      ok: false,
      message: "Algum item do carrinho ficou indisponível ou sem estoque suficiente. Revise o carrinho.",
    };
  }

  const subtotal = validLines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  // Endereço: usa existente do cliente ou cria um novo (com snapshot no pedido).
  let addressSnapshot: Record<string, string>;
  if ("existingId" in input.address) {
    const { data: address } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", input.address.existingId)
      .eq("customer_id", input.customerId)
      .maybeSingle();
    if (!address) return { ok: false, message: "Endereço não encontrado." };
    addressSnapshot = {
      recipient_name: address.recipient_name,
      cep: address.cep,
      street: address.street,
      number: address.number,
      complement: address.complement ?? "",
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
    };
  } else {
    const a = input.address.new;
    addressSnapshot = {
      recipient_name: a.recipientName,
      cep: a.cep,
      street: a.street,
      number: a.number,
      complement: a.complement ?? "",
      neighborhood: a.neighborhood,
      city: a.city,
      state: a.state,
    };
    if (input.address.save) {
      await supabase.from("addresses").insert({
        customer_id: input.customerId,
        label: a.label || "Principal",
        recipient_name: a.recipientName,
        cep: a.cep,
        street: a.street,
        number: a.number,
        complement: a.complement || null,
        neighborhood: a.neighborhood,
        city: a.city,
        state: a.state,
        is_default: false,
      });
    }
  }

  // Frete: reavaliado no servidor a partir do CEP real, nunca confiando em taxa vinda do client.
  let shippingFee = 0;
  let shippingMethodId: string | null = null;
  let shippingRegionId: string | null = null;

  if (input.shippingChoice === "express") {
    const { data: regionsData } = await supabase
      .from("shipping_regions")
      .select("*, shipping_methods!inner(id, type)")
      .eq("is_active", true)
      .eq("shipping_methods.type", "express_brasilia");

    const regions: ExpressRegion[] = (regionsData ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      cepRangeStart: r.cep_range_start,
      cepRangeEnd: r.cep_range_end,
      fee: Number(r.fee),
      deliveryDaysMin: r.delivery_days_min,
      deliveryDaysMax: r.delivery_days_max,
      cutoffTime: r.cutoff_time,
      activeWeekdays: r.active_weekdays,
      isActive: r.is_active,
    }));

    const check = checkExpressDelivery(addressSnapshot.cep, regions);
    if (!check.available) {
      return {
        ok: false,
        message: "A entrega expressa não está mais disponível para esse CEP/horário. Escolha o frete padrão.",
      };
    }
    shippingFee = check.region.fee;
    shippingRegionId = check.region.id;
    const matchedRegion = regionsData!.find((r) => r.id === check.region.id)!;
    shippingMethodId = (matchedRegion.shipping_methods as unknown as { id: string }).id;
  } else {
    const { data: standardMethod } = await supabase
      .from("shipping_methods")
      .select("*")
      .eq("type", "standard")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();
    shippingFee = standardMethod ? Number(standardMethod.base_price) : 0;
    shippingMethodId = standardMethod?.id ?? null;
  }

  // Cupom: revalidado no servidor.
  let discountTotal = 0;
  let couponId: string | null = null;
  if (input.couponCode) {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("*, coupon_usages(customer_id)")
      .ilike("code", input.couponCode.trim())
      .maybeSingle();

    if (coupon) {
      const usages = (coupon.coupon_usages as unknown as { customer_id: string }[]) ?? [];
      const customerUsageCount = usages.filter((u) => u.customer_id === input.customerId).length;
      const result = validateCoupon(
        {
          code: coupon.code,
          discountType: coupon.discount_type,
          discountValue: Number(coupon.discount_value),
          minOrderValue: Number(coupon.min_order_value),
          maxUses: coupon.max_uses,
          maxUsesPerCustomer: coupon.max_uses_per_customer,
          startsAt: coupon.starts_at,
          endsAt: coupon.ends_at,
          isActive: coupon.is_active,
          totalUses: usages.length,
        },
        subtotal,
        customerUsageCount,
      );
      if (result.valid) {
        discountTotal = result.discountAmount;
        couponId = coupon.id;
      }
    }
  }

  const total = Math.max(0, subtotal - discountTotal + shippingFee);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: input.customerId,
      status: "novo",
      subtotal,
      discount_total: discountTotal,
      shipping_fee: shippingFee,
      total,
      coupon_id: couponId,
      shipping_method_id: shippingMethodId,
      shipping_region_id: shippingRegionId,
      shipping_address: addressSnapshot,
      notes: input.notes || null,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    return { ok: false, message: "Não foi possível criar o pedido. Tente novamente." };
  }

  await supabase.from("order_items").insert(
    validLines.map((line) => ({
      order_id: order.id,
      variant_id: line.variantId,
      product_name: line.productName,
      brand_name: line.brandName,
      variant_label: `${line.volumeMl}ml`,
      sku: line.sku,
      unit_price: line.unitPrice,
      quantity: line.quantity,
      total: line.unitPrice * line.quantity,
    })),
  );

  await supabase.from("payments").insert({
    order_id: order.id,
    method: input.paymentMethod,
    status: "pending",
    amount: total,
    gateway: "mercadopago",
  });

  if (couponId) {
    await supabase.from("coupon_usages").insert({
      coupon_id: couponId,
      customer_id: input.customerId,
      order_id: order.id,
    });
  }

  // Decremento atômico (função no banco garante que não vende abaixo de zero
  // mesmo sob concorrência). Uma falha aqui é rara — checamos estoque acima —
  // e não desfaz o pedido já criado; fica para reconciliação manual no painel.
  for (const line of validLines) {
    await supabase.rpc("decrement_inventory", {
      p_variant_id: line.variantId,
      p_quantity: line.quantity,
    });
  }

  return { ok: true, orderId: order.id, orderNumber: order.order_number };
}
