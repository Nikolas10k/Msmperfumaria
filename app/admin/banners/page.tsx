import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteBannerAction } from "./actions";

export const metadata: Metadata = { title: "Banners" };
export const dynamic = "force-dynamic";

export default async function BannersPage() {
  const { supabase } = await requireStaff();
  const { data: banners } = await supabase.from("banners").select("*").order("position");

  const now = new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif-display text-2xl text-text-primary">Banners</h1>
        <Link href="/admin/banners/novo">
          <Button>Novo banner</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(banners ?? []).map((banner) => {
          const starts = new Date(banner.starts_at);
          const ends = banner.ends_at ? new Date(banner.ends_at) : null;
          const isLive = banner.is_active && starts <= now && (!ends || now <= ends);

          return (
            <div key={banner.id} className="overflow-hidden rounded-md border border-border">
              <div className="relative aspect-[21/9] bg-surface-2">
                <Image src={banner.image_url} alt="" fill className="object-cover" unoptimized />
                <Badge variant={isLive ? "success" : "dark"} className="absolute left-2 top-2">
                  {isLive ? "No ar" : "Fora do ar"}
                </Badge>
              </div>
              <div className="space-y-2 p-3">
                <p className="text-sm text-text-primary">{banner.title}</p>
                <p className="text-xs text-text-muted capitalize">{banner.placement.replace("_", " ")}</p>
                <div className="flex justify-between text-sm">
                  <Link href={`/admin/banners/${banner.id}`} className="text-gold hover:text-gold-light">
                    Editar
                  </Link>
                  <DeleteButton id={banner.id} action={deleteBannerAction} />
                </div>
              </div>
            </div>
          );
        })}
        {(banners ?? []).length === 0 && (
          <p className="col-span-full text-center text-text-muted">Nenhum banner cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}
