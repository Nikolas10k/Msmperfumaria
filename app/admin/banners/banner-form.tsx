"use client";

import { useActionState } from "react";
import Image from "next/image";
import { saveBannerAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import type { ActionState } from "@/app/(auth)/actions";
import type { Database } from "@/lib/types/database";

const initialState: ActionState = { ok: false };

type Banner = Database["public"]["Tables"]["banners"]["Row"];

function toLocalInput(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function BannerForm({ banner }: { banner?: Banner }) {
  const [state, formAction, pending] = useActionState(saveBannerAction, initialState);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      {banner && <input type="hidden" name="id" value={banner.id} />}
      <input type="hidden" name="existing_image_url" value={banner?.image_url ?? ""} />
      {state.message && <p className="text-sm text-danger">{state.message}</p>}

      {banner?.image_url && (
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-sm border border-border bg-surface-2">
          <Image src={banner.image_url} alt="" fill className="object-cover" unoptimized />
        </div>
      )}

      <div>
        <Label htmlFor="image_file">Imagem {banner ? "(deixe em branco para manter)" : ""}</Label>
        <input
          id="image_file"
          name="image_file"
          type="file"
          accept="image/*"
          className="text-sm text-text-secondary file:mr-3 file:rounded-sm file:border-0 file:bg-rose file:px-3 file:py-2 file:text-ink"
        />
      </div>

      <div>
        <Label htmlFor="title">Título</Label>
        <Input id="title" name="title" defaultValue={banner?.title} required />
        {state.fieldErrors?.title && <p className="mt-1 text-xs text-danger">{state.fieldErrors.title}</p>}
      </div>

      <div>
        <Label htmlFor="subtitle">Subtítulo</Label>
        <Input id="subtitle" name="subtitle" defaultValue={banner?.subtitle ?? ""} />
      </div>

      <div>
        <Label htmlFor="link_url">Link (opcional)</Label>
        <Input id="link_url" name="link_url" defaultValue={banner?.link_url ?? ""} placeholder="/perfumes/ofertas" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="placement">Posição</Label>
          <Select id="placement" name="placement" defaultValue={banner?.placement ?? "hero"}>
            <option value="hero">Hero (topo)</option>
            <option value="secondary">Seção secundária</option>
            <option value="category_top">Topo de categoria</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="position">Ordem</Label>
          <Input id="position" name="position" type="number" defaultValue={banner?.position ?? 0} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="starts_at">Exibir a partir de</Label>
          <Input id="starts_at" name="starts_at" type="datetime-local" defaultValue={toLocalInput(banner?.starts_at)} required />
        </div>
        <div>
          <Label htmlFor="ends_at">Exibir até (opcional)</Label>
          <Input id="ends_at" name="ends_at" type="datetime-local" defaultValue={toLocalInput(banner?.ends_at)} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-text-secondary">
        <input type="checkbox" name="is_active" defaultChecked={banner?.is_active ?? true} />
        Banner ativo
      </label>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : "Salvar banner"}
      </Button>
    </form>
  );
}
