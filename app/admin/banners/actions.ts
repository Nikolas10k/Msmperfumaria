"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/guard";
import { fieldErrorsFromZod } from "@/lib/validation/zod-errors";
import { uploadMediaFile } from "@/lib/storage/upload";
import type { ActionState } from "@/app/(auth)/actions";

const bannerSchema = z.object({
  title: z.string().trim().min(1, "Informe o título."),
  subtitle: z.string().trim().optional(),
  link_url: z.string().trim().optional(),
  placement: z.enum(["hero", "secondary", "category_top"]),
  position: z.coerce.number().int().default(0),
  starts_at: z.string().min(1, "Informe a data de início."),
  ends_at: z.string().trim().optional(),
  is_active: z.boolean(),
});

export async function saveBannerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const parsed = bannerSchema.safeParse({
    title: formData.get("title"),
    subtitle: formData.get("subtitle") || undefined,
    link_url: formData.get("link_url") || undefined,
    placement: formData.get("placement"),
    position: formData.get("position") || 0,
    starts_at: formData.get("starts_at"),
    ends_at: formData.get("ends_at") || undefined,
    is_active: formData.get("is_active") === "on",
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const id = formData.get("id") as string | null;
  const imageFile = formData.get("image_file") as File | null;

  let imageUrl = formData.get("existing_image_url") as string | null;
  if (imageFile && imageFile.size > 0) {
    imageUrl = await uploadMediaFile(supabase, "banners", imageFile);
  }

  if (!imageUrl) {
    return { ok: false, message: "Envie uma imagem para o banner." };
  }

  const payload = {
    title: parsed.data.title,
    subtitle: parsed.data.subtitle || null,
    image_url: imageUrl,
    link_url: parsed.data.link_url || null,
    placement: parsed.data.placement,
    position: parsed.data.position,
    starts_at: new Date(parsed.data.starts_at).toISOString(),
    ends_at: parsed.data.ends_at ? new Date(parsed.data.ends_at).toISOString() : null,
    is_active: parsed.data.is_active,
  };

  const { error } = id
    ? await supabase.from("banners").update(payload).eq("id", id)
    : await supabase.from("banners").insert(payload);

  if (error) {
    return { ok: false, message: "Não foi possível salvar o banner. " + error.message };
  }

  revalidatePath("/admin/banners");
  redirect("/admin/banners");
}

export async function deleteBannerAction(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("banners").delete().eq("id", id);
  revalidatePath("/admin/banners");
}
