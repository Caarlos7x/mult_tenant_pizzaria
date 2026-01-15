"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Product, Category } from "@pizzaria/db";

const productSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  type: z.enum(["PIZZA", "DRINK", "COMBO", "DESSERT", "OTHER"]),
  status: z.enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK"]),
  categoryId: z.string().optional().nullable(),
  basePrice: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0,
    "Preço inválido"
  ),
  imageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  sortOrder: z.string().refine(
    (val) => !isNaN(Number(val)),
    "Ordem inválida"
  ),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product & {
    category?: Category | null;
  };
  categories: Category[];
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isEditing = !!product;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description || "",
          type: product.type,
          status: product.status,
          categoryId: product.categoryId || "",
          basePrice: Number(product.basePrice).toFixed(2),
          imageUrl: product.imageUrl || "",
          sortOrder: product.sortOrder.toString(),
        }
      : {
          type: "PIZZA",
          status: "ACTIVE",
          basePrice: "0.00",
          sortOrder: "0",
        },
  });

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const url = isEditing
        ? `/api/admin/products/${product.id}`
        : "/api/admin/products";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          basePrice: Number(data.basePrice),
          sortOrder: Number(data.sortOrder),
          categoryId: data.categoryId || null,
          imageUrl: data.imageUrl || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao salvar produto");
      }

      setSuccess(true);
      router.refresh();
      
      if (!isEditing) {
        router.push("/admin/products");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao salvar produto");
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
                Nome do Produto *
              </label>
              <input
                {...register("name")}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ex: Pizza Margherita"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Descreva o produto..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo *
                </label>
                <select
                  {...register("type")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="PIZZA">Pizza</option>
                  <option value="DRINK">Bebida</option>
                  <option value="COMBO">Combo</option>
                  <option value="DESSERT">Sobremesa</option>
                  <option value="OTHER">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  {...register("categoryId")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Sem categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Preço e Status */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Preço e Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço Base (R$) *
              </label>
              <input
                {...register("basePrice")}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0.00"
              />
              {errors.basePrice && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.basePrice.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                {...register("status")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
                <option value="OUT_OF_STOCK">Sem Estoque</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordem de Exibição
              </label>
              <input
                {...register("sortOrder")}
                type="number"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Imagem */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Imagem</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL da Imagem
            </label>
            <input
              {...register("imageUrl")}
              type="url"
              placeholder="https://cdn.exemplo.com/produto.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.imageUrl && (
              <p className="mt-1 text-sm text-red-600">
                {errors.imageUrl.message}
              </p>
            )}
            {product?.imageUrl && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Imagem atual:</p>
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-32 w-32 rounded-lg object-cover border border-gray-200"
                />
              </div>
            )}
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
            Produto {isEditing ? "atualizado" : "criado"} com sucesso!
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-end gap-4">
          <Link href="/admin/products">
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading} className="min-w-[120px]">
            {isLoading
              ? "Salvando..."
              : isEditing
              ? "Salvar Alterações"
              : "Criar Produto"}
          </Button>
        </div>
      </form>
    </div>
  );
}

