import { requireAdmin } from "@/lib/admin-auth";
import { getTenantId } from "@/lib/get-tenant";
import { prisma } from "@pizzaria/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Upload } from "lucide-react";
import { CreateAlcoholicCategoryButton } from "@/components/admin/create-alcoholic-category-button";
import { CreateCategoryButton } from "@/components/admin/create-category-button";
import { Beer, Cake } from "lucide-react";
import { ProductsFilter } from "@/components/admin/products-filter";
import { ProductsPagination } from "@/components/admin/products-pagination";
import { Suspense } from "react";

const ITEMS_PER_PAGE = 10;

interface AdminProductsPageProps {
  searchParams: {
    page?: string;
    category?: string;
  };
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  await requireAdmin();
  const tenantId = await getTenantId();

  if (!tenantId) {
    return <div>Tenant não encontrado</div>;
  }

  const params = searchParams;
  const currentPage = parseInt(params.page || "1", 10);
  const categoryId = params.category || null;

  // Busca todas as categorias para o filtro
  const categories = await prisma.category.findMany({
    where: {
      tenantId,
      isActive: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

  // Monta o where clause
  const where: any = { tenantId };
  if (categoryId) {
    where.categoryId = categoryId;
  }

  // Busca produtos com paginação
  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600 mt-2">
            Gerencie seus produtos e preços
            {totalCount > 0 && (
              <span className="ml-2 text-gray-500">
                ({totalCount} {totalCount === 1 ? "produto" : "produtos"})
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Botões para criar categorias se não existirem */}
          {!categories.find((c) => c.name === "Bebidas Alcóolicas") && (
            <CreateCategoryButton
              categoryName="Bebidas Alcóolicas"
              description="Cervejas e outras bebidas alcóolicas"
              icon={<Beer className="h-4 w-4" />}
            />
          )}
          {!categories.find((c) => c.name === "Doces") && (
            <CreateCategoryButton
              categoryName="Doces"
              description="Sobremesas e doces"
              icon={<Cake className="h-4 w-4" />}
            />
          )}
          <Link href="/admin/products/import">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Importar
            </Button>
          </Link>
          <Link href="/admin/products/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Produto
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtros */}
      {categories.length > 0 && (
        <Suspense fallback={<div className="h-20 bg-gray-100 rounded-lg animate-pulse mb-6" />}>
          <ProductsFilter categories={categories} />
        </Suspense>
      )}

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

      {/* Paginação */}
      {totalPages > 1 && (
        <ProductsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalCount}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      )}
    </div>
  );
}

