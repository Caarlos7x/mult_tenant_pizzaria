"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const addressSchema = z.object({
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  street: z.string().min(3, "Rua deve ter pelo menos 3 caracteres"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().length(2, "Estado deve ter 2 caracteres"),
  reference: z.string().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddressForm({ onSuccess, onCancel }: AddressFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  const zipCode = watch("zipCode");

  // Máscara de CEP
  useEffect(() => {
    if (zipCode) {
      const cleaned = zipCode.replace(/\D/g, "");
      if (cleaned.length <= 8) {
        const formatted = cleaned.replace(/(\d{5})(\d{3})/, "$1-$2");
        if (formatted !== zipCode) {
          setValue("zipCode", formatted);
        }
      }
    }
  }, [zipCode, setValue]);

  // Busca CEP quando tiver 9 caracteres (com hífen)
  useEffect(() => {
    const fetchCEP = async () => {
      if (zipCode && zipCode.replace(/\D/g, "").length === 8) {
        setIsLoadingCEP(true);
        setError(null);

        try {
          const cleanedCEP = zipCode.replace(/\D/g, "");
          const response = await fetch(`/api/cep/${cleanedCEP}`);

          if (response.ok) {
            const data = await response.json();
            setValue("street", data.street || "");
            setValue("neighborhood", data.neighborhood || "");
            setValue("city", data.city || "");
            setValue("state", data.state || "");
          } else {
            const errorData = await response.json();
            setError(errorData.error || "CEP não encontrado");
          }
        } catch (err) {
          setError("Erro ao buscar CEP");
        } finally {
          setIsLoadingCEP(false);
        }
      }
    };

    const timeoutId = setTimeout(fetchCEP, 500); // Debounce de 500ms
    return () => clearTimeout(timeoutId);
  }, [zipCode, setValue]);

  const onSubmit = async (data: AddressFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/addresses/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Erro ao salvar endereço");
      } else {
        if (onSuccess) {
          onSuccess();
        }
        // Reset form
        setValue("zipCode", "");
        setValue("street", "");
        setValue("number", "");
        setValue("complement", "");
        setValue("neighborhood", "");
        setValue("city", "");
        setValue("state", "");
        setValue("reference", "");
      }
    } catch (err) {
      setError("Erro ao processar endereço");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CEP */}
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
            CEP *
          </label>
          <div className="relative">
            <input
              id="zipCode"
              type="text"
              {...register("zipCode")}
              placeholder="00000-000"
              maxLength={9}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {isLoadingCEP && (
              <div className="absolute right-3 top-2.5">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            )}
          </div>
          {errors.zipCode && (
            <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>
          )}
        </div>

        {/* Rua */}
        <div>
          <label htmlFor="street" className="block text-sm font-medium mb-1">
            Rua *
          </label>
          <input
            id="street"
            type="text"
            {...register("street")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.street && (
            <p className="text-red-500 text-sm mt-1">{errors.street.message}</p>
          )}
        </div>

        {/* Número */}
        <div>
          <label htmlFor="number" className="block text-sm font-medium mb-1">
            Número *
          </label>
          <input
            id="number"
            type="text"
            {...register("number")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.number && (
            <p className="text-red-500 text-sm mt-1">{errors.number.message}</p>
          )}
        </div>

        {/* Complemento */}
        <div>
          <label htmlFor="complement" className="block text-sm font-medium mb-1">
            Complemento
          </label>
          <input
            id="complement"
            type="text"
            {...register("complement")}
            placeholder="Apto, Bloco, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Bairro */}
        <div>
          <label htmlFor="neighborhood" className="block text-sm font-medium mb-1">
            Bairro *
          </label>
          <input
            id="neighborhood"
            type="text"
            {...register("neighborhood")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.neighborhood && (
            <p className="text-red-500 text-sm mt-1">
              {errors.neighborhood.message}
            </p>
          )}
        </div>

        {/* Cidade */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium mb-1">
            Cidade *
          </label>
          <input
            id="city"
            type="text"
            {...register("city")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
          )}
        </div>

        {/* Estado */}
        <div>
          <label htmlFor="state" className="block text-sm font-medium mb-1">
            Estado (UF) *
          </label>
          <input
            id="state"
            type="text"
            {...register("state")}
            maxLength={2}
            placeholder="SP"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary uppercase"
            style={{ textTransform: "uppercase" }}
          />
          {errors.state && (
            <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
          )}
        </div>

        {/* Referência */}
        <div className="md:col-span-2">
          <label htmlFor="reference" className="block text-sm font-medium mb-1">
            Ponto de Referência
          </label>
          <input
            id="reference"
            type="text"
            {...register("reference")}
            placeholder="Ex: Próximo ao mercado, em frente à escola..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Endereço"
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}

