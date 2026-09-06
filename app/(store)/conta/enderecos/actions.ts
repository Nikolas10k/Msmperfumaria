"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { onlyDigits } from "@/lib/utils";
import { fieldErrorsFromZod } from "@/lib/validation/zod-errors";
import type { ActionState } from "@/app/(auth)/actions";

const addressSchema = z.object({
  label: z.string().trim().min(1).default("Principal"),
  recipient_name: z.string().trim().min(1, "Informe o nome do destinatário."),
  cep: z.string().min(8, "CEP inválido."),
  street: z.string().trim().min(1, "Informe a rua."),
  number: z.string().trim().min(1, "Informe o número."),
  complement: z.string().trim().optional(),
  neighborhood: z.string().trim().min(1, "Informe o bairro."),
  city: z.string().trim().min(1, "Informe a cidade."),
  state: z.string().length(2, "UF inválida."),
  is_default: z.boolean(),
});

export async function saveAddressAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sessão expirada." };

  const parsed = addressSchema.safeParse({
    label: formData.get("label") || "Principal",
    recipient_name: formData.get("recipient_name"),
    cep: onlyDigits(String(formData.get("cep") ?? "")),
    street: formData.get("street"),
    number: formData.get("number"),
    complement: formData.get("complement") || undefined,
    neighborhood: formData.get("neighborhood"),
    city: formData.get("city"),
    state: formData.get("state"),
    is_default: formData.get("is_default") === "on",
  });

  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };

  const id = formData.get("id") as string | null;
  const payload = { ...parsed.data, complement: parsed.data.complement || null, customer_id: user.id };

  if (parsed.data.is_default) {
    await supabase.from("addresses").update({ is_default: false }).eq("customer_id", user.id);
  }

  const { error } = id
    ? await supabase.from("addresses").update(payload).eq("id", id).eq("customer_id", user.id)
    : await supabase.from("addresses").insert(payload);

  if (error) return { ok: false, message: "Não foi possível salvar o endereço." };

  revalidatePath("/conta/enderecos");
  return { ok: true, message: "Endereço salvo." };
}

export async function deleteAddressAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("addresses").delete().eq("id", id).eq("customer_id", user.id);
  revalidatePath("/conta/enderecos");
}
