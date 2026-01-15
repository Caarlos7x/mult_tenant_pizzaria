import { requireAdmin } from "@/lib/admin-auth";
import { getTenantId } from "@/lib/get-tenant";
import { prisma } from "@pizzaria/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, Download, FileSpreadsheet } from "lucide-react";
import { ProductImportForm } from "@/components/admin/product-import-form";

export default async function ImportProductsPage() {
  await requireAdmin();
  const tenantId = await getTenantId();

  if (!tenantId) {
    return <div>Tenant não encontrado</div>;
  }

  // Busca categorias para validação
  const categories = await prisma.category.findMany({
    where: { tenantId, isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <Link href="/admin/products">
        <Button variant="ghost" className="mb-4 gap-2 text-gray-700 hover:text-primary hover:bg-primary/10">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Produtos
        </Button>
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Importar Produtos</h1>
        <p className="text-gray-600 mt-2">
          Faça upload de uma planilha Excel para importar produtos em massa
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FileSpreadsheet className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Como usar a importação em massa
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Baixe o template Excel abaixo</li>
              <li>Preencha a planilha com os dados dos seus produtos</li>
              <li>Certifique-se de que os nomes das colunas estão corretos</li>
              <li>Faça upload da planilha preenchida</li>
              <li>Revise os produtos importados e corrija erros se necessário</li>
            </ol>
          </div>
        </div>

        <div className="flex gap-4">
          <a href="/api/admin/products/import/template" download>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Baixar Template Excel
            </Button>
          </a>
        </div>
      </div>

      <ProductImportForm categories={categories} />
    </div>
  );
}

