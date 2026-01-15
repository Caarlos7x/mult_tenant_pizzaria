import { requireAdmin } from "@/lib/admin-auth";
import { getTenantId } from "@/lib/get-tenant";
import { prisma } from "@pizzaria/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  await requireAdmin();
  const tenantId = await getTenantId();

  if (!tenantId) {
    return <div>Tenant não encontrado</div>;
  }

  const categories = await prisma.category.findMany({
    where: { tenantId },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/products">
          <Button variant="ghost" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Produtos
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Novo Produto</h1>
        <p className="text-gray-600 mt-2">
          Adicione um novo produto ao seu cardápio
        </p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}

