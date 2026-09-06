"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/guard";
import { slugify } from "@/lib/utils";
import { fieldErrorsFromZod } from "@/lib/validation/zod-errors";
import type { ActionState } from "@/app/(auth)/actions";

const brandSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da marca."),
  logo_url: z.string().trim().optional(),
  description: z.string().trim().optional(),
  is_active: z.boolean(),
});

export async function saveBrandAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const parsed = brandSchema.safeParse({
    name: formData.get("name"),
    logo_url: formData.get("logo_url") || undefined,
    description: formData.get("description") || undefined,
    is_active: formData.get("is_active") === "on",
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const id = formData.get("id") as string | null;
  const payload = {
    name: parsed.data.name,
    slug: slugify(parsed.data.name),
    logo_url: parsed.data.logo_url || null,
    description: parsed.data.description || null,
    is_active: parsed.data.is_active,
  };

  const { error } = id
    ? await supabase.from("brands").update(payload).eq("id", id)
    : await supabase.from("brands").insert(payload);

  if (error) {
    return { ok: false, message: "Não foi possível salvar a marca. " + error.message };
  }

  revalidatePath("/admin/marcas");
  redirect("/admin/marcas");
}

export async function deleteBrandAction(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("brands").delete().eq("id", id);
  revalidatePath("/admin/marcas");
}
