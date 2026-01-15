import { getTenant } from "@/lib/get-tenant";
import { prisma } from "@pizzaria/db";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/menu/product-card";
import { ProductCardSkeleton } from "@/components/skeletons/product-card-skeleton";
import { Suspense } from "react";

async function MenuContent({ tenantId }: { tenantId: string }) {
  // Busca categorias com produtos
  const categories = await prisma.category.findMany({
    where: {
      tenantId,
      isActive: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
    include: {
      products: {
        where: {
          status: "ACTIVE",
        },
        include: {
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
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  // Função para gerar um ID slug a partir do nome da categoria
  const getCategorySlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^a-z0-9]+/g, "-") // Substitui espaços e caracteres especiais por hífen
      .replace(/^-+|-+$/g, ""); // Remove hífens no início e fim
  };

  return (
    <div className="space-y-8 sm:space-y-12">
      {categories.map((category) => {
        const categorySlug = getCategorySlug(category.name);
        return (
          <section key={category.id} id={categorySlug} className="scroll-mt-24">
            <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-4">
              {category.imageUrl && (
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="h-10 sm:h-12 w-10 sm:w-12 rounded"
                />
              )}
              <h2 className="text-xl sm:text-2xl font-semibold">{category.name}</h2>
            </div>
          {category.description && (
            <p className="mb-3 sm:mb-4 text-sm sm:text-base text-muted-foreground">
              {category.description}
            </p>
          )}

            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {category.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default async function MenuPage() {
  const tenant = await getTenant();

  if (!tenant) {
    return <div>Pizzaria não encontrada</div>;
  }

  // Busca categorias com produtos
  const categories = await prisma.category.findMany({
    where: {
      tenantId: tenant.id,
      isActive: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
    include: {
      products: {
        where: {
          status: "ACTIVE",
        },
        include: {
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
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header tenant={tenant} />

      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl flex-1">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Cardápio Completo
          </h1>
          <p className="text-gray-600 mb-6">Explore todas as nossas delícias</p>
          
          {/* Menu de Navegação de Categorias */}
          {categories.length > 0 && (
            <nav className="flex flex-wrap gap-2 sm:gap-3 pb-4 border-b border-gray-200">
              {categories.map((category) => {
                const categorySlug = category.name
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-+|-+$/g, "");
                
                return (
                  <a
                    key={category.id}
                    href={`#${categorySlug}`}
                    className="px-3 sm:px-4 py-2 text-sm sm:text-base font-medium text-gray-700 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors duration-200"
                  >
                    {category.name}
                  </a>
                );
              })}
            </nav>
          )}
        </div>

        <Suspense
          fallback={
            <div className="space-y-8 sm:space-y-12">
              {[...Array(3)].map((_, i) => (
                <section key={i}>
                  <div className="mb-6">
                    <div className="h-8 w-48 bg-gray-200 rounded mb-2 animate-pulse" />
                    <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, j) => (
                      <ProductCardSkeleton key={j} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          }
        >
          <MenuContent tenantId={tenant.id} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

