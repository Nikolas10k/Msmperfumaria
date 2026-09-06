"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/cart-context";
import { getCartDetailsAction } from "@/lib/cart/actions";
import { checkExpressDeliveryAction } from "@/lib/shipping/actions";
import { checkoutAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { formatBRL, formatCep, onlyDigits } from "@/lib/utils";
import type { CartDetailLine } from "@/lib/cart/queries";
import type { ExpressCheckResult } from "@/lib/shipping/brasilia";
import type { Database } from "@/lib/types/database";

type Address = Database["public"]["Tables"]["addresses"]["Row"];

const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export function CheckoutForm({ addresses, initialCoupon }: { addresses: Address[]; initialCoupon?: string }) {
  const router = useRouter();
  const { items, clear } = useCart();
  const [details, setDetails] = useState<CartDetailLine[]>([]);
  const [addressMode, setAddressMode] = useState<"existing" | "new">(addresses.length > 0 ? "existing" : "new");
  const [existingAddressId, setExistingAddressId] = useState(addresses[0]?.id ?? "");
  const [newAddress, setNewAddress] = useState({
    label: "Principal",
    recipientName: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "DF",
  });
  const [saveNewAddress, setSaveNewAddress] = useState(true);
  const [shippingChoice, setShippingChoice] = useState<"express" | "standard">("standard");
  const [expressCheck, setExpressCheck] = useState<ExpressCheckResult | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit_card">("pix");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    getCartDetailsAction(items).then(setDetails);
  }, [items]);

  const currentCep =
    addressMode === "existing"
      ? addresses.find((a) => a.id === existingAddressId)?.cep ?? ""
      : newAddress.cep;

  useEffect(() => {
    const digits = onlyDigits(currentCep);
    if (digits.length !== 8) {
      setExpressCheck(null);
      return;
    }
    checkExpressDeliveryAction(digits).then((result) => {
      setExpressCheck(result);
      if (!result.available && shippingChoice === "express") setShippingChoice("standard");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCep]);

  const subtotal = details.reduce((s, d) => s + d.unitPrice * d.quantity, 0);
  const shippingFee = shippingChoice === "express" && expressCheck?.available ? expressCheck.region.fee : 0;
  const total = useMemo(() => subtotal + shippingFee, [subtotal, shippingFee]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (addressMode === "new") {
      const required = [newAddress.recipientName, newAddress.cep, newAddress.street, newAddress.number, newAddress.neighborhood, newAddress.city];
      if (required.some((f) => !f.trim())) {
        setError("Preencha todos os campos obrigatórios do endereço.");
        return;
      }
    } else if (!existingAddressId) {
      setError("Selecione um endereço de entrega.");
      return;
    }

    startTransition(async () => {
      const result = await checkoutAction({
        cartLines: items,
        addressMode,
        existingAddressId: addressMode === "existing" ? existingAddressId : undefined,
        newAddress: addressMode === "new" ? { ...newAddress, cep: onlyDigits(newAddress.cep) } : undefined,
        saveNewAddress,
        shippingChoice,
        couponCode: initialCoupon,
        paymentMethod,
        notes,
      });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      clear();
      router.push(`/checkout/confirmacao/${result.orderId}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-text-secondary">
          1. Endereço de entrega
        </h2>

        {addresses.length > 0 && (
          <div className="mb-4 flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" checked={addressMode === "existing"} onChange={() => setAddressMode("existing")} />
              Usar endereço salvo
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={addressMode === "new"} onChange={() => setAddressMode("new")} />
              Novo endereço
            </label>
          </div>
        )}

        {addressMode === "existing" ? (
          <Select value={existingAddressId} onChange={(e) => setExistingAddressId(e.target.value)}>
            {addresses.map((a) => (
              <option key={a.id} value={a.id}>
                {a.street}, {a.number} — {a.city}/{a.state} ({formatCep(a.cep)})
              </option>
            ))}
          </Select>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Nome do destinatário</Label>
              <Input
                value={newAddress.recipientName}
                onChange={(e) => setNewAddress((s) => ({ ...s, recipientName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>CEP</Label>
              <Input
                value={newAddress.cep}
                onChange={(e) => setNewAddress((s) => ({ ...s, cep: formatCep(e.target.value) }))}
                maxLength={9}
                required
              />
            </div>
            <div>
              <Label>Cidade</Label>
              <Input value={newAddress.city} onChange={(e) => setNewAddress((s) => ({ ...s, city: e.target.value }))} required />
            </div>
            <div className="sm:col-span-2">
              <Label>Rua</Label>
              <Input value={newAddress.street} onChange={(e) => setNewAddress((s) => ({ ...s, street: e.target.value }))} required />
            </div>
            <div>
              <Label>Número</Label>
              <Input value={newAddress.number} onChange={(e) => setNewAddress((s) => ({ ...s, number: e.target.value }))} required />
            </div>
            <div>
              <Label>Complemento</Label>
              <Input value={newAddress.complement} onChange={(e) => setNewAddress((s) => ({ ...s, complement: e.target.value }))} />
            </div>
            <div>
              <Label>Bairro</Label>
              <Input value={newAddress.neighborhood} onChange={(e) => setNewAddress((s) => ({ ...s, neighborhood: e.target.value }))} required />
            </div>
            <div>
              <Label>UF</Label>
              <Select value={newAddress.state} onChange={(e) => setNewAddress((s) => ({ ...s, state: e.target.value }))}>
                {BRAZILIAN_STATES.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm text-text-secondary sm:col-span-2">
              <input type="checkbox" checked={saveNewAddress} onChange={(e) => setSaveNewAddress(e.target.checked)} />
              Salvar este endereço na minha conta
            </label>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-text-secondary">2. Entrega</h2>
        <div className="space-y-2">
          <label className="flex items-center justify-between rounded-sm border border-border p-3 text-sm">
            <span className="flex items-center gap-2">
              <input type="radio" checked={shippingChoice === "standard"} onChange={() => setShippingChoice("standard")} />
              Frete padrão (envio para todo o Brasil)
            </span>
          </label>
          <label
            className={`flex items-center justify-between rounded-sm border p-3 text-sm ${
              expressCheck?.available ? "border-gold-hairline" : "border-border opacity-50"
            }`}
          >
            <span className="flex items-center gap-2">
              <input
                type="radio"
                checked={shippingChoice === "express"}
                disabled={!expressCheck?.available}
                onChange={() => setShippingChoice("express")}
              />
              ⚡ Entrega expressa em Brasília
              {expressCheck?.available && ` — ${expressCheck.deliveryEstimateLabel}`}
            </span>
            {expressCheck?.available && <span>{formatBRL(expressCheck.region.fee)}</span>}
          </label>
          {!expressCheck?.available && currentCep && (
            <p className="text-xs text-text-muted">Informe um CEP de Brasília elegível para ver a opção expressa.</p>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-text-secondary">3. Pagamento</h2>
        <div className="space-y-2">
          <label className="flex items-center gap-2 rounded-sm border border-border p-3 text-sm">
            <input type="radio" checked={paymentMethod === "pix"} onChange={() => setPaymentMethod("pix")} />
            PIX (aprovação rápida)
          </label>
          <label className="flex items-center gap-2 rounded-sm border border-border p-3 text-sm">
            <input type="radio" checked={paymentMethod === "credit_card"} onChange={() => setPaymentMethod("credit_card")} />
            Cartão de crédito
          </label>
        </div>

        <div className="mt-4">
          <Label>Observações (opcional)</Label>
          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-text-secondary">Resumo</h2>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-text-secondary">
            <span>Subtotal</span>
            <span>{formatBRL(subtotal)}</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>Frete</span>
            <span>{formatBRL(shippingFee)}</span>
          </div>
          <div className="flex justify-between text-base text-text-primary">
            <span>Total</span>
            <span>{formatBRL(total)}</span>
          </div>
        </div>
      </Card>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Processando…" : "Confirmar pedido"}
      </Button>
    </form>
  );
}
