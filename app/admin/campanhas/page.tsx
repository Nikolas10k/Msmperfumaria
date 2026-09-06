import Link from "next/link";
import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteCampaignAction } from "./actions";

export const metadata: Metadata = { title: "Campanhas" };
export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const { supabase } = await requireStaff();
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .order("starts_at", { ascending: false });

  const now = new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif-display text-2xl text-text-primary">Campanhas</h1>
          <p className="text-sm text-text-muted">
            Descontos por período aplicados a produtos, categorias ou marcas selecionadas.
          </p>
        </div>
        <Link href="/admin/campanhas/nova">
          <Button>Nova campanha</Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-text-muted">
            <tr>
              <th className="px-4 py-3">Campanha</th>
              <th className="px-4 py-3">Desconto</th>
              <th className="px-4 py-3">Vigência</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(campaigns ?? []).map((campaign) => {
              const starts = new Date(campaign.starts_at);
              const ends = new Date(campaign.ends_at);
              const isLive = campaign.is_active && starts <= now && now <= ends;
              return (
                <tr key={campaign.id} className="border-t border-border">
                  <td className="px-4 py-3 text-text-primary">{campaign.name}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {campaign.discount_type === "percentage"
                      ? `${campaign.discount_value}%`
                      : `R$ ${campaign.discount_value}`}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {starts.toLocaleDateString("pt-BR")} – {ends.toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={isLive ? "success" : "dark"}>{isLive ? "No ar" : campaign.is_active ? "Agendada/expirada" : "Inativa"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/campanhas/${campaign.id}`} className="text-gold hover:text-gold-light">
                        Editar
                      </Link>
                      <DeleteButton id={campaign.id} action={deleteCampaignAction} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {(campaigns ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-text-muted">
                  Nenhuma campanha criada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
