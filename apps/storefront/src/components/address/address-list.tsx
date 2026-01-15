"use client";

"use client";

import { useState } from "react";
import { AddressForm } from "./address-form";
import { Button } from "@/components/ui/button";
import { Plus, MapPin } from "lucide-react";

interface Address {
  id: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  reference?: string | null;
}

interface AddressListProps {
  addresses: Address[];
  onAddressAdded?: () => void;
}

export function AddressList({ addresses, onAddressAdded }: AddressListProps) {
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = () => {
    setShowForm(false);
    if (onAddressAdded) {
      onAddressAdded();
    }
    // Recarrega a página para mostrar o novo endereço
    window.location.reload();
  };

  return (
    <div className="mt-6 bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Meus Endereços
        </h2>
        {!showForm && (
          <Button
            size="sm"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Endereço
          </Button>
        )}
      </div>

      {showForm ? (
        <div className="border-t pt-6">
          <AddressForm
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : (
        <>
          {addresses.length > 0 ? (
            <div className="space-y-3">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {address.street}, {address.number}
                      </p>
                      {address.complement && (
                        <p className="text-sm text-gray-600">
                          {address.complement}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        {address.neighborhood} - {address.city}/{address.state}
                      </p>
                      <p className="text-sm text-gray-500">
                        CEP: {address.zipCode}
                      </p>
                      {address.reference && (
                        <p className="text-sm text-gray-500 mt-1">
                          <span className="font-medium">Referência:</span>{" "}
                          {address.reference}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Você ainda não tem endereços cadastrados.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Endereço
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

