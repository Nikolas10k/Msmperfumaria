"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/guard";
import { onlyDigits } from "@/lib/utils";
import { fieldErrorsFromZod } from "@/lib/validation/zod-errors";
import type { ActionState } from "@/app/(auth)/actions";

const methodSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome."),
  description: z.string().trim().optional(),
  type: z.enum(["standard", "express_brasilia"]),
  base_price: z.coerce.number().nonnegative().default(0),
  is_active: z.boolean(),
});

export async function saveMethodAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const parsed = methodSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    type: formData.get("type"),
    base_price: formData.get("base_price") || 0,
    is_active: formData.get("is_active") === "on",
  });

  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };

  const id = formData.get("id") as string | null;
  const payload = {
    name: parsed.data.name,
    description: parsed.data.description || null,
    type: parsed.data.type,
    base_price: parsed.data.base_price,
    is_active: parsed.data.is_active,
  };

  const { error } = id
    ? await supabase.from("shipping_methods").update(payload).eq("id", id)
    : await supabase.from("shipping_methods").insert(payload);

  if (error) return { ok: false, message: "Não foi possível salvar. " + error.message };

  revalidatePath("/admin/entrega");
  return { ok: true, message: "Método de entrega salvo." };
}

export async function deleteMethodAction(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("shipping_methods").delete().eq("id", id);
  revalidatePath("/admin/entrega");
}

const regionSchema = z.object({
  shipping_method_id: z.string().uuid("Selecione o método de entrega."),
  name: z.string().trim().min(1, "Informe o nome da região."),
  cep_range_start: z.string().min(8, "CEP inicial inválido."),
  cep_range_end: z.string().min(8, "CEP final inválido."),
  fee: z.coerce.number().nonnegative().default(0),
  delivery_days_min: z.coerce.number().int().min(0).default(0),
  delivery_days_max: z.coerce.number().int().min(0).default(1),
  cutoff_time: z.string().min(1, "Informe o horário-limite."),
  is_active: z.boolean(),
});

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

export async function saveRegionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const parsed = regionSchema.safeParse({
    shipping_method_id: formData.get("shipping_method_id"),
    name: formData.get("name"),
    cep_range_start: onlyDigits(String(formData.get("cep_range_start") ?? "")),
    cep_range_end: onlyDigits(String(formData.get("cep_range_end") ?? "")),
    fee: formData.get("fee") || 0,
    delivery_days_min: formData.get("delivery_days_min") || 0,
    delivery_days_max: formData.get("delivery_days_max") || 1,
    cutoff_time: formData.get("cutoff_time"),
    is_active: formData.get("is_active") === "on",
  });

  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };

  const activeWeekdays = WEEKDAYS.filter((day) => formData.get(`weekday_${day}`) === "on");
  if (activeWeekdays.length === 0) {
    return { ok: false, message: "Selecione ao menos um dia da semana atendido." };
  }

  const id = formData.get("id") as string | null;
  const payload = {
    shipping_method_id: parsed.data.shipping_method_id,
    name: parsed.data.name,
    cep_range_start: parsed.data.cep_range_start.padStart(8, "0"),
    cep_range_end: parsed.data.cep_range_end.padStart(8, "0"),
    fee: parsed.data.fee,
    delivery_days_min: parsed.data.delivery_days_min,
    delivery_days_max: parsed.data.delivery_days_max,
    cutoff_time: parsed.data.cutoff_time,
    active_weekdays: activeWeekdays,
    is_active: parsed.data.is_active,
  };

  const { error } = id
    ? await supabase.from("shipping_regions").update(payload).eq("id", id)
    : await supabase.from("shipping_regions").insert(payload);

  if (error) return { ok: false, message: "Não foi possível salvar a região. " + error.message };

  revalidatePath("/admin/entrega");
  return { ok: true, message: "Região de entrega salva." };
}

export async function deleteRegionAction(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("shipping_regions").delete().eq("id", id);
  revalidatePath("/admin/entrega");
}
