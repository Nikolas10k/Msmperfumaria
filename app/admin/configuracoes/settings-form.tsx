"use client";

import { useActionState } from "react";
import { saveSettingsAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import type { ActionState } from "@/app/(auth)/actions";
import type { Database } from "@/lib/types/database";

const initialState: ActionState = { ok: false };

export function SettingsForm({
  settings,
}: {
  settings: Database["public"]["Tables"]["store_settings"]["Row"];
}) {
  const [state, formAction, pending] = useActionState(saveSettingsAction, initialState);

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      {state.message && (
        <p className={state.ok ? "text-sm text-success" : "text-sm text-danger"}>{state.message}</p>
      )}

      <div>
        <Label htmlFor="whatsapp_number">WhatsApp comercial (DDI+DDD+número)</Label>
        <Input id="whatsapp_number" name="whatsapp_number" defaultValue={settings.whatsapp_number ?? ""} placeholder="5561999999999" />
      </div>

      <div>
        <Label htmlFor="support_email">E-mail de atendimento</Label>
        <Input id="support_email" name="support_email" type="email" defaultValue={settings.support_email ?? ""} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="instagram_url">Instagram</Label>
          <Input id="instagram_url" name="instagram_url" defaultValue={settings.instagram_url ?? ""} />
        </div>
        <div>
          <Label htmlFor="facebook_url">Facebook</Label>
          <Input id="facebook_url" name="facebook_url" defaultValue={settings.facebook_url ?? ""} />
        </div>
        <div>
          <Label htmlFor="tiktok_url">TikTok</Label>
          <Input id="tiktok_url" name="tiktok_url" defaultValue={settings.tiktok_url ?? ""} />
        </div>
      </div>

      <div>
        <Label htmlFor="business_hours">Horário de atendimento</Label>
        <Input id="business_hours" name="business_hours" defaultValue={settings.business_hours ?? ""} placeholder="Seg a sex, 9h às 18h" />
      </div>

      <div>
        <Label htmlFor="footer_about">Texto institucional (rodapé)</Label>
        <Textarea id="footer_about" name="footer_about" rows={3} defaultValue={settings.footer_about ?? ""} />
      </div>

      <div>
        <Label htmlFor="footer_cnpj">CNPJ</Label>
        <Input id="footer_cnpj" name="footer_cnpj" defaultValue={settings.footer_cnpj ?? ""} />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : "Salvar configurações"}
      </Button>
    </form>
  );
}
