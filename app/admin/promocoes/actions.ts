"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/guard";
import { fieldErrorsFromZod } from "@/lib/validation/zod-errors";
import type { ActionState } from "@/app/(auth)/actions";

const promotionSchema = z
  .object({
    variant_id: z.string().uuid("Selecione um produto/variante."),
    promo_price: z.coerce.number().nonnegative("Informe um preço promocional válido."),
    starts_at: z.string().min(1, "Informe a data de início."),
    ends_at: z.string().min(1, "Informe a data de término."),
    is_active: z.boolean(),
  })
  .refine((data) => new Date(data.starts_at) < new Date(data.ends_at), {
    message: "A data de término deve ser depois do início.",
    path: ["ends_at"],
  });

export async function savePromotionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const parsed = promotionSchema.safeParse({
    variant_id: formData.get("variant_id"),
    promo_price: formData.get("promo_price"),
    starts_at: formData.get("starts_at"),
    ends_at: formData.get("ends_at"),
    is_active: formData.get("is_active") === "on",
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const id = formData.get("id") as string | null;
  const payload = {
    variant_id: parsed.data.variant_id,
    promo_price: parsed.data.promo_price,
    starts_at: new Date(parsed.data.starts_at).toISOString(),
    ends_at: new Date(parsed.data.ends_at).toISOString(),
    is_active: parsed.data.is_active,
  };

  const { error } = id
    ? await supabase.from("promotions").update(payload).eq("id", id)
    : await supabase.from("promotions").insert(payload);

  if (error) {
    return { ok: false, message: "Não foi possível salvar a promoção. " + error.message };
  }

  revalidatePath("/admin/promocoes");
  redirect("/admin/promocoes");
}

export async function deletePromotionAction(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("promotions").delete().eq("id", id);
  revalidatePath("/admin/promocoes");
}
