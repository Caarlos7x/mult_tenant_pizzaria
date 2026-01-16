"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { Tenant } from "@pizzaria/db";

const tenantSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida (use formato #RRGGBB)"),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida (use formato #RRGGBB)").optional().or(z.literal("")),
  logoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  coverUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  phone: z.string().optional(),
  currency: z.string().min(1, "Moeda é obrigatória"),
  timezone: z.string().min(1, "Fuso horário é obrigatório"),
});

type TenantFormData = z.infer<typeof tenantSchema>;

interface TenantSettingsFormProps {
  tenant: Tenant;
}

export function TenantSettingsForm({ tenant }: TenantSettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: tenant.name,
      primaryColor: tenant.primaryColor,
      secondaryColor: tenant.secondaryColor || "",
      logoUrl: tenant.logoUrl || "",
      coverUrl: tenant.coverUrl || "",
      phone: (tenant as any).phone || "",
      currency: tenant.currency,
      timezone: tenant.timezone,
    },
  });

  const onSubmit = async (data: TenantFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/admin/tenant/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          secondaryColor: data.secondaryColor || null,
          logoUrl: data.logoUrl || null,
          coverUrl: data.coverUrl || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar configurações");
      }

      setSuccess(true);
      
      // Mostra toast de sucesso
      toast.success("Configurações atualizadas", {
        description: "As alterações foram salvas com sucesso",
      });
      
      // Revalida a página de forma não-bloqueante
      startTransition(() => {
        router.refresh();
      });

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      const errorMessage = err.message || "Erro ao atualizar configurações";
      setError(errorMessage);
      toast.error("Erro ao atualizar configurações", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Informações Básicas
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Pizzaria
              </label>
              <input
                {...register("name")}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                {...register("phone")}
                type="text"
                placeholder="(00) 00000-0000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Branding */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Branding</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor Primária
                </label>
                <div className="flex gap-2">
                  <input
                    {...register("primaryColor")}
                    type="color"
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    {...register("primaryColor")}
                    type="text"
                    placeholder="#ef4444"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                {errors.primaryColor && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.primaryColor.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor Secundária
                </label>
                <div className="flex gap-2">
                  <input
                    {...register("secondaryColor")}
                    type="color"
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    {...register("secondaryColor")}
                    type="text"
                    placeholder="#f97316"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                {errors.secondaryColor && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.secondaryColor.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL do Logo
              </label>
              <input
                {...register("logoUrl")}
                type="url"
                placeholder="https://cdn.exemplo.com/logo.png"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {errors.logoUrl && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.logoUrl.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL da Imagem de Capa (Banner)
              </label>
              <input
                {...register("coverUrl")}
                type="url"
                placeholder="https://cdn.exemplo.com/banner.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {errors.coverUrl && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.coverUrl.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Configurações */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Configurações
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moeda
              </label>
              <select
                {...register("currency")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="BRL">BRL - Real Brasileiro</option>
                <option value="USD">USD - Dólar Americano</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fuso Horário
              </label>
              <select
                {...register("timezone")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="America/Sao_Paulo">America/Sao_Paulo</option>
                <option value="America/Manaus">America/Manaus</option>
                <option value="America/Rio_Branco">America/Rio_Branco</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mensagens de Erro/Sucesso */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            Configurações atualizadas com sucesso!
          </div>
        )}

        {/* Botão Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="min-w-[120px]">
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
}

