import { getTenant } from "@/lib/get-tenant";
import { prisma } from "@pizzaria/db";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/menu/product-card";
import { ProductCardSkeleton } from "@/components/skeletons/product-card-skeleton";
import { Suspense } from "react";

async function FeaturedProducts({ tenantId }: { tenantId: string }) {
  // Busca produtos em destaque
  const featuredProducts = await prisma.product.findMany({
    where: {
      tenantId,
      status: "ACTIVE",
    },
    take: 6,
    orderBy: {
      sortOrder: "asc",
    },
    include: {
      category: true,
      variants: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      modifiers: {
        include: {
          modifier: {
            include: {
              options: {
                where: {
                  isActive: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return (
    <section className="mb-8 sm:mb-12">
      <div className="mb-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Destaques
        </h2>
        <p className="text-gray-600">Os mais pedidos da casa</p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const tenant = await getTenant();

  if (!tenant) {
    return <div>Pizzaria não encontrada</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header com branding */}
      {tenant.coverUrl && (
        <div
          className="h-48 sm:h-64 w-full bg-cover bg-center relative"
          style={{ backgroundImage: `url(${tenant.coverUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
        </div>
      )}

      <Header tenant={tenant} />

      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl flex-1">
        <Suspense
          fallback={
            <section className="mb-8 sm:mb-12">
              <div className="mb-6">
                <div className="h-10 w-48 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-5 w-64 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </section>
          }
        >
          <FeaturedProducts tenantId={tenant.id} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

