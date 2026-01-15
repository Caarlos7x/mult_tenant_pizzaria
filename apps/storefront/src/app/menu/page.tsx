import { getTenant } from "@/lib/get-tenant";
import { prisma } from "@pizzaria/db";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/menu/product-card";
import { ProductCardSkeleton } from "@/components/skeletons/product-card-skeleton";
import { ScrollToTop } from "@/components/scroll-to-top";
import { MenuPagination } from "@/components/menu/menu-pagination";
import { Suspense } from "react";

const PRODUCTS_PER_PAGE = 12; // Número de produtos por página em cada categoria

async function MenuContent({ 
  tenantId, 
  searchParams 
}: { 
  tenantId: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
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
        const pageParam = `page_${categorySlug}`;
        const currentPage = parseInt(
          (searchParams[pageParam] as string) || "1",
          10
        );
        
        // Paginação dos produtos da categoria
        const totalProducts = category.products.length;
        const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
        const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
        const endIndex = startIndex + PRODUCTS_PER_PAGE;
        const paginatedProducts = category.products.slice(startIndex, endIndex);

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

            {paginatedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-6">
                    <MenuPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={totalProducts}
                      itemsPerPage={PRODUCTS_PER_PAGE}
                      categorySlug={categorySlug}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-500 text-sm sm:text-base">
                  Nenhum produto disponível nesta categoria no momento.
                </p>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

interface MenuPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
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
          <MenuContent tenantId={tenant.id} searchParams={searchParams} />
        </Suspense>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}

