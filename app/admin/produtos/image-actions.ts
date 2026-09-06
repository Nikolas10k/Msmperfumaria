"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/guard";
import { uploadMediaFile } from "@/lib/storage/upload";

export async function uploadProductImagesAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const productId = formData.get("product_id") as string;
  const files = formData.getAll("files") as File[];

  const { count } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  let hasPrimary = (count ?? 0) > 0;
  let position = count ?? 0;

  for (const file of files) {
    if (!file || file.size === 0) continue;
    const url = await uploadMediaFile(supabase, `products/${productId}`, file);
    await supabase.from("product_images").insert({
      product_id: productId,
      url,
      position: position++,
      is_primary: !hasPrimary,
    });
    hasPrimary = true;
  }

  revalidatePath(`/admin/produtos/${productId}`);
}

export async function setPrimaryImageAction(imageId: string, productId: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);
  await supabase.from("product_images").update({ is_primary: true }).eq("id", imageId);
  revalidatePath(`/admin/produtos/${productId}`);
}

export async function deleteImageAction(imageId: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("product_images").delete().eq("id", imageId);
  revalidatePath("/admin/produtos");
}
