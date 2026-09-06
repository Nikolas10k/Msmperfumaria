"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/guard";
import { slugify } from "@/lib/utils";
import { fieldErrorsFromZod } from "@/lib/validation/zod-errors";
import type { ActionState } from "@/app/(auth)/actions";
import type { CampaignTargetType } from "@/lib/types/database";

const campaignSchema = z
  .object({
    name: z.string().trim().min(1, "Informe o nome da campanha."),
    description: z.string().trim().optional(),
    discount_type: z.enum(["percentage", "fixed_amount"]),
    discount_value: z.coerce.number().positive("Informe um valor de desconto válido."),
    scope: z.enum(["all", "products", "categories", "brands"]),
    starts_at: z.string().min(1, "Informe a data de início."),
    ends_at: z.string().min(1, "Informe a data de término."),
    is_active: z.boolean(),
  })
  .refine((data) => new Date(data.starts_at) < new Date(data.ends_at), {
    message: "A data de término deve ser depois do início.",
    path: ["ends_at"],
  });

export async function saveCampaignAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const parsed = campaignSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    discount_type: formData.get("discount_type"),
    discount_value: formData.get("discount_value"),
    scope: formData.get("scope"),
    starts_at: formData.get("starts_at"),
    ends_at: formData.get("ends_at"),
    is_active: formData.get("is_active") === "on",
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const id = formData.get("id") as string | null;
  const targetIds = formData.getAll("target_ids") as string[];

  const payload = {
    name: parsed.data.name,
    slug: slugify(parsed.data.name),
    description: parsed.data.description || null,
    discount_type: parsed.data.discount_type,
    discount_value: parsed.data.discount_value,
    scope: parsed.data.scope,
    starts_at: new Date(parsed.data.starts_at).toISOString(),
    ends_at: new Date(parsed.data.ends_at).toISOString(),
    is_active: parsed.data.is_active,
  };

  let campaignId = id;
  if (id) {
    const { error } = await supabase.from("campaigns").update(payload).eq("id", id);
    if (error) return { ok: false, message: "Não foi possível salvar a campanha. " + error.message };
  } else {
    const { data, error } = await supabase.from("campaigns").insert(payload).select("id").single();
    if (error) return { ok: false, message: "Não foi possível criar a campanha. " + error.message };
    campaignId = data.id;
  }

  await supabase.from("campaign_targets").delete().eq("campaign_id", campaignId!);
  if (parsed.data.scope !== "all" && targetIds.length > 0) {
    const targetType: CampaignTargetType =
      parsed.data.scope === "products" ? "product" : parsed.data.scope === "categories" ? "category" : "brand";
    await supabase.from("campaign_targets").insert(
      targetIds.map((target_id) => ({ campaign_id: campaignId!, target_type: targetType, target_id })),
    );
  }

  revalidatePath("/admin/campanhas");
  redirect("/admin/campanhas");
}

export async function deleteCampaignAction(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("campaigns").delete().eq("id", id);
  revalidatePath("/admin/campanhas");
}
