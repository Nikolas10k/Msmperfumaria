"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/admin/guard";
import type { OrderStatus } from "@/lib/types/database";

const VALID_STATUSES: OrderStatus[] = [
  "novo",
  "pagamento_pendente",
  "pago",
  "em_preparacao",
  "enviado",
  "saiu_para_entrega",
  "entregue",
  "cancelado",
];

export async function updateOrderStatusAction(orderId: string, status: string) {
  if (!VALID_STATUSES.includes(status as OrderStatus)) return;
  const { supabase } = await requireStaff();
  await supabase.from("orders").update({ status: status as OrderStatus }).eq("id", orderId);
  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/admin/pedidos");
}
