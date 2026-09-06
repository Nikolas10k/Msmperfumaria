"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/guard";
import { fieldErrorsFromZod } from "@/lib/validation/zod-errors";
import type { ActionState } from "@/app/(auth)/actions";

const couponSchema = z
  .object({
    code: z.string().trim().min(2, "Informe um código.").toUpperCase(),
    discount_type: z.enum(["percentage", "fixed_amount"]),
    discount_value: z.coerce.number().positive("Informe um valor de desconto válido."),
    min_order_value: z.coerce.number().nonnegative().default(0),
    max_uses: z.coerce.number().int().positive().optional(),
    max_uses_per_customer: z.coerce.number().int().positive().default(1),
    starts_at: z.string().min(1, "Informe a data de início."),
    ends_at: z.string().min(1, "Informe a data de término."),
    is_active: z.boolean(),
  })
  .refine((data) => new Date(data.starts_at) < new Date(data.ends_at), {
    message: "A data de término deve ser depois do início.",
    path: ["ends_at"],
  });

export async function saveCouponAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const parsed = couponSchema.safeParse({
    code: formData.get("code"),
    discount_type: formData.get("discount_type"),
    discount_value: formData.get("discount_value"),
    min_order_value: formData.get("min_order_value") || 0,
    max_uses: formData.get("max_uses") || undefined,
    max_uses_per_customer: formData.get("max_uses_per_customer") || 1,
    starts_at: formData.get("starts_at"),
    ends_at: formData.get("ends_at"),
    is_active: formData.get("is_active") === "on",
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const id = formData.get("id") as string | null;
  const payload = {
    code: parsed.data.code,
    discount_type: parsed.data.discount_type,
    discount_value: parsed.data.discount_value,
    min_order_value: parsed.data.min_order_value,
    max_uses: parsed.data.max_uses ?? null,
    max_uses_per_customer: parsed.data.max_uses_per_customer,
    starts_at: new Date(parsed.data.starts_at).toISOString(),
    ends_at: new Date(parsed.data.ends_at).toISOString(),
    is_active: parsed.data.is_active,
  };

  const { error } = id
    ? await supabase.from("coupons").update(payload).eq("id", id)
    : await supabase.from("coupons").insert(payload);

  if (error) {
    const message = error.code === "23505" ? "Já existe um cupom com esse código." : error.message;
    return { ok: false, message: "Não foi possível salvar o cupom. " + message };
  }

  revalidatePath("/admin/cupons");
  redirect("/admin/cupons");
}

export async function deleteCouponAction(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("coupons").delete().eq("id", id);
  revalidatePath("/admin/cupons");
}
