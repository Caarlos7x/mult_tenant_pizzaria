import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { resolve } from "path";

// Carrega .env do diretório packages/db
config({ path: resolve(__dirname, "../packages/db/.env") });

const prisma = new PrismaClient();

async function main() {
  console.log("🍺 Iniciando reorganização de bebidas...");

  // Busca todos os tenants
  const tenants = await prisma.tenant.findMany({
    where: { isActive: true },
  });

  for (const tenant of tenants) {
    console.log(`\n📦 Processando tenant: ${tenant.name} (${tenant.subdomain})`);

    // Busca a categoria "Bebidas"
    const categoriaBebidas = await prisma.category.findFirst({
      where: {
        tenantId: tenant.id,
        name: "Bebidas",
        isActive: true,
      },
    });

    if (!categoriaBebidas) {
      console.log("⚠️  Categoria 'Bebidas' não encontrada. Pulando...");
      continue;
    }

    // Busca ou cria a categoria "Bebidas Alcóolicas"
    const categoriaAlcoolicas = await prisma.category.upsert({
      where: {
        tenantId_name: {
          tenantId: tenant.id,
          name: "Bebidas Alcóolicas",
        },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        name: "Bebidas Alcóolicas",
        description: "Cervejas e outras bebidas alcóolicas",
        sortOrder: categoriaBebidas.sortOrder + 1, // Coloca logo após "Bebidas"
        isActive: true,
      },
    });

    console.log(`✅ Categoria 'Bebidas Alcóolicas' criada/encontrada`);

    // Busca todos os produtos de cerveja na categoria "Bebidas"
    const produtosCerveja = await prisma.product.findMany({
      where: {
        tenantId: tenant.id,
        categoryId: categoriaBebidas.id,
        name: {
          contains: "Cerveja",
          mode: "insensitive",
        },
      },
    });

    console.log(`📋 Encontrados ${produtosCerveja.length} produtos de cerveja`);

    // Move os produtos para a nova categoria
    if (produtosCerveja.length > 0) {
      await prisma.product.updateMany({
        where: {
          id: {
            in: produtosCerveja.map((p) => p.id),
          },
        },
        data: {
          categoryId: categoriaAlcoolicas.id,
        },
      });

      console.log(`✅ ${produtosCerveja.length} cerveja(s) movida(s) para 'Bebidas Alcóolicas'`);
      
      // Lista os produtos movidos
      produtosCerveja.forEach((produto) => {
        console.log(`   - ${produto.name}`);
      });
    } else {
      console.log("ℹ️  Nenhuma cerveja encontrada para mover");
    }
  }

  console.log("\n✅ Reorganização concluída!");
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

