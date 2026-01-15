import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { resolve } from "path";

// Carrega .env do diretório packages/db
config({ path: resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // Criar tenant demo
  const tenant = await prisma.tenant.upsert({
    where: { subdomain: "demo" },
    update: {},
    create: {
      subdomain: "demo",
      name: "Pizzaria Demo",
      slug: "demo",
      primaryColor: "#ef4444",
      secondaryColor: "#f97316",
      isActive: true,
    },
  });

  console.log("✅ Tenant criado:", tenant.name);

  // Criar categorias
  const categoriaPizzas = await prisma.category.upsert({
    where: { id: "cat-pizzas" },
    update: {},
    create: {
      id: "cat-pizzas",
      tenantId: tenant.id,
      name: "Pizzas",
      description: "Nossas deliciosas pizzas",
      sortOrder: 1,
    },
  });

  const categoriaBebidas = await prisma.category.upsert({
    where: { id: "cat-bebidas" },
    update: {},
    create: {
      id: "cat-bebidas",
      tenantId: tenant.id,
      name: "Bebidas",
      description: "Refrigerantes e sucos",
      sortOrder: 2,
    },
  });

  console.log("✅ Categorias criadas");

  // Criar modificadores (adicionais)
  const modificadorBorda = await prisma.modifier.upsert({
    where: { id: "mod-borda" },
    update: {},
    create: {
      id: "mod-borda",
      tenantId: tenant.id,
      name: "Borda",
      isRequired: false,
      minOptions: 0,
      maxOptions: 1,
      sortOrder: 1,
      options: {
        create: [
          {
            name: "Borda Recheada Catupiry",
            price: 5.0,
            sortOrder: 1,
          },
          {
            name: "Borda Recheada Cheddar",
            price: 5.0,
            sortOrder: 2,
          },
        ],
      },
    },
  });

  const modificadorAdicionais = await prisma.modifier.upsert({
    where: { id: "mod-adicionais" },
    update: {},
    create: {
      id: "mod-adicionais",
      tenantId: tenant.id,
      name: "Adicionais",
      isRequired: false,
      minOptions: 0,
      maxOptions: 10,
      sortOrder: 2,
      options: {
        create: [
          {
            name: "Extra Queijo",
            price: 3.0,
            sortOrder: 1,
          },
          {
            name: "Bacon",
            price: 4.0,
            sortOrder: 2,
          },
          {
            name: "Azeitona",
            price: 2.0,
            sortOrder: 3,
          },
        ],
      },
    },
  });

  console.log("✅ Modificadores criados");

  // Criar produtos (pizzas)
  const pizzaMargherita = await prisma.product.upsert({
    where: { id: "pizza-margherita" },
    update: {},
    create: {
      id: "pizza-margherita",
      tenantId: tenant.id,
      name: "Margherita",
      description: "Molho de tomate, mussarela e manjericão",
      type: "PIZZA",
      status: "ACTIVE",
      basePrice: 25.0,
      categoryId: categoriaPizzas.id,
      sortOrder: 1,
      variants: {
        create: [
          {
            name: "Pequena",
            price: 0,
            isDefault: true,
            sortOrder: 1,
          },
          {
            name: "Média",
            price: 10.0,
            sortOrder: 2,
          },
          {
            name: "Grande",
            price: 20.0,
            sortOrder: 3,
          },
        ],
      },
      modifiers: {
        create: [
          {
            modifierId: modificadorBorda.id,
          },
          {
            modifierId: modificadorAdicionais.id,
          },
        ],
      },
    },
  });

  const pizzaCalabresa = await prisma.product.upsert({
    where: { id: "pizza-calabresa" },
    update: {},
    create: {
      id: "pizza-calabresa",
      tenantId: tenant.id,
      name: "Calabresa",
      description: "Molho de tomate, mussarela, calabresa e cebola",
      type: "PIZZA",
      status: "ACTIVE",
      basePrice: 28.0,
      categoryId: categoriaPizzas.id,
      sortOrder: 2,
      variants: {
        create: [
          {
            name: "Pequena",
            price: 0,
            isDefault: true,
            sortOrder: 1,
          },
          {
            name: "Média",
            price: 10.0,
            sortOrder: 2,
          },
          {
            name: "Grande",
            price: 20.0,
            sortOrder: 3,
          },
        ],
      },
      modifiers: {
        create: [
          {
            modifierId: modificadorBorda.id,
          },
          {
            modifierId: modificadorAdicionais.id,
          },
        ],
      },
    },
  });

  // Criar bebida
  const cocaCola = await prisma.product.upsert({
    where: { id: "bebida-coca" },
    update: {},
    create: {
      id: "bebida-coca",
      tenantId: tenant.id,
      name: "Coca-Cola 2L",
      description: "Refrigerante Coca-Cola 2 litros",
      type: "DRINK",
      status: "ACTIVE",
      basePrice: 8.0,
      categoryId: categoriaBebidas.id,
      sortOrder: 1,
    },
  });

  console.log("✅ Produtos criados");

  // Criar horários da pizzaria
  const daysOfWeek = [0, 1, 2, 3, 4, 5, 6]; // Domingo a Sábado
  for (const day of daysOfWeek) {
    await prisma.storeHours.upsert({
      where: {
        tenantId_dayOfWeek: {
          tenantId: tenant.id,
          dayOfWeek: day,
        },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        dayOfWeek: day,
        openTime: "18:00",
        closeTime: "23:00",
        isOpen: true,
      },
    });
  }

  console.log("✅ Horários criados");

  // Criar zona de entrega
  await prisma.deliveryZone.upsert({
    where: { id: "zone-centro" },
    update: {},
    create: {
      id: "zone-centro",
      tenantId: tenant.id,
      name: "Centro",
      description: "Zona central da cidade",
      fee: 5.0,
      minOrder: 20.0,
      estimatedTime: 45,
      isActive: true,
    },
  });

  console.log("✅ Zona de entrega criada");

  console.log("\n🎉 Seed concluído com sucesso!");
  console.log(`\nAcesse: http://demo.localhost:3000 (ou http://localhost:3000)`);
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

