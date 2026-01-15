import { requireAdmin } from "@/lib/admin-auth";
import { getTenantId } from "@/lib/get-tenant";
import { prisma } from "@pizzaria/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";

export default async function AdminProductsPage() {
  await requireAdmin();
  const tenantId = await getTenantId();

  if (!tenantId) {
    return <div>Tenant não encontrado</div>;
  }

  const products = await prisma.product.findMany({
    where: { tenantId },
    include: {
      category: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600 mt-2">
            Gerencie seus produtos e preços
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
          <p className="text-gray-600 mb-4">Nenhum produto cadastrado ainda</p>
          <Link href="/admin/products/new">
            <Button>Criar Primeiro Produto</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                  Produto
                </th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                  Categoria
                </th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                  Preço
                </th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="text-right py-3 px-6 text-sm font-semibold text-gray-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-12 w-12 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {product.name}
                        </p>
                        {product.description && (
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {product.category?.name || "-"}
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-gray-900">
                      R$ {Number(product.basePrice).toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : product.status === "OUT_OF_STOCK"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {product.status === "ACTIVE"
                        ? "Ativo"
                        : product.status === "OUT_OF_STOCK"
                        ? "Sem Estoque"
                        : "Inativo"}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Edit className="h-4 w-4" />
                          Editar
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

