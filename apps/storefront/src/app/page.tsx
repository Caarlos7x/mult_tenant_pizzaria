import { getTenant } from "@/lib/get-tenant";
import { prisma } from "@pizzaria/db";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/menu/product-card";
import { ProductCardSkeleton } from "@/components/skeletons/product-card-skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Pizzaria não encontrada</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header tenant={tenant} />

      {/* Banner Hero */}
      <section className="relative w-full h-[25rem] sm:h-[31.25rem] lg:h-[37.5rem] overflow-hidden">
        {tenant.coverUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${tenant.coverUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
        )}
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 h-full flex items-center justify-center text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 drop-shadow-lg">
              {tenant.name}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 drop-shadow-md max-w-2xl mx-auto">
              A melhor pizza da cidade, feita com ingredientes frescos e muito amor
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/menu">
                <Button size="lg" className="text-base sm:text-lg px-8 py-6 h-auto bg-white text-primary hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all">
                  Ver Cardápio
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="w-full h-12 sm:h-16 lg:h-20 text-gray-50"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 C150,80 350,80 600,40 C850,0 1050,0 1200,40 L1200,120 L0,120 Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </section>

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

