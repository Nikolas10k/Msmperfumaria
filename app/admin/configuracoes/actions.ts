"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/guard";
import { fieldErrorsFromZod } from "@/lib/validation/zod-errors";
import type { ActionState } from "@/app/(auth)/actions";

const settingsSchema = z.object({
  whatsapp_number: z.string().trim().optional(),
  support_email: z.string().trim().optional(),
  instagram_url: z.string().trim().optional(),
  facebook_url: z.string().trim().optional(),
  tiktok_url: z.string().trim().optional(),
  footer_about: z.string().trim().optional(),
  footer_cnpj: z.string().trim().optional(),
  business_hours: z.string().trim().optional(),
});

export async function saveSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const parsed = settingsSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };

  const { error } = await supabase
    .from("store_settings")
    .update({
      whatsapp_number: parsed.data.whatsapp_number || null,
      support_email: parsed.data.support_email || null,
      instagram_url: parsed.data.instagram_url || null,
      facebook_url: parsed.data.facebook_url || null,
      tiktok_url: parsed.data.tiktok_url || null,
      footer_about: parsed.data.footer_about || null,
      footer_cnpj: parsed.data.footer_cnpj || null,
      business_hours: parsed.data.business_hours || null,
    })
    .eq("id", true);

  if (error) return { ok: false, message: "Não foi possível salvar. " + error.message };

  revalidatePath("/admin/configuracoes");
  revalidatePath("/");
  return { ok: true, message: "Configurações salvas." };
}
