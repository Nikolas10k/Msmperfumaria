"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/guard";
import { slugify } from "@/lib/utils";
import { fieldErrorsFromZod } from "@/lib/validation/zod-errors";
import type { ActionState } from "@/app/(auth)/actions";

const categorySchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da categoria."),
  image_url: z.string().trim().optional(),
  description: z.string().trim().optional(),
  position: z.coerce.number().int().default(0),
  is_active: z.boolean(),
});

export async function saveCategoryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    image_url: formData.get("image_url") || undefined,
    description: formData.get("description") || undefined,
    position: formData.get("position") || 0,
    is_active: formData.get("is_active") === "on",
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const id = formData.get("id") as string | null;
  const payload = {
    name: parsed.data.name,
    slug: slugify(parsed.data.name),
    image_url: parsed.data.image_url || null,
    description: parsed.data.description || null,
    position: parsed.data.position,
    is_active: parsed.data.is_active,
  };

  const { error } = id
    ? await supabase.from("categories").update(payload).eq("id", id)
    : await supabase.from("categories").insert(payload);

  if (error) {
    return { ok: false, message: "Não foi possível salvar a categoria. " + error.message };
  }

  revalidatePath("/admin/categorias");
  redirect("/admin/categorias");
}

export async function deleteCategoryAction(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categorias");
}
