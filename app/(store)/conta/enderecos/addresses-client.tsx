"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { AddressForm } from "./address-form";
import { deleteAddressAction } from "./actions";
import type { Database } from "@/lib/types/database";

type Address = Database["public"]["Tables"]["addresses"]["Row"];

export function AddressesClient({ addresses }: { addresses: Address[] }) {
  const [showForm, setShowForm] = useState(addresses.length === 0);

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <div key={address.id} className="flex items-center justify-between rounded-md border border-border bg-surface p-4">
          <div>
            <p className="text-sm text-text-primary">
              {address.label} {address.is_default && <Badge className="ml-2">Padrão</Badge>}
            </p>
            <p className="text-sm text-text-secondary">
              {address.street}, {address.number} — {address.city}/{address.state}
            </p>
          </div>
          <DeleteButton id={address.id} action={deleteAddressAction} />
        </div>
      ))}

      {showForm ? (
        <AddressForm onSaved={() => setShowForm(false)} />
      ) : (
        <Button variant="secondary" onClick={() => setShowForm(true)}>
          + Adicionar novo endereço
        </Button>
      )}
    </div>
  );
}
