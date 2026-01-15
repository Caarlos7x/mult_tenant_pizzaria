/**
 * Script para criar um novo tenant (cliente) no sistema
 * 
 * Uso:
 *   pnpm tsx scripts/create-tenant.ts
 * 
 * Ou com parametros:
 *   pnpm tsx scripts/create-tenant.ts --subdomain cliente1 --name "Pizzaria Cliente 1"
 */

import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { resolve } from "path";

// Carrega .env
config({ path: resolve(__dirname, "../packages/db/.env") });
config({ path: resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

interface CreateTenantOptions {
  subdomain: string;
  name: string;
  slug?: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  coverUrl?: string;
  domain?: string;
  currency?: string;
  timezone?: string;
}

async function createTenant(options: CreateTenantOptions) {
  const {
    subdomain,
    name,
    slug = subdomain,
    primaryColor = "#ef4444",
    secondaryColor = "#f97316",
    logoUrl,
    coverUrl,
    domain,
    currency = "BRL",
    timezone = "America/Sao_Paulo",
  } = options;

  console.log("🚀 Criando novo tenant...");
  console.log(`   Subdomain: ${subdomain}`);
  console.log(`   Nome: ${name}`);

  try {
    // 1. Criar tenant
    const tenant = await prisma.tenant.create({
      data: {
        subdomain,
        name,
        slug,
        primaryColor,
        secondaryColor,
        logoUrl,
        coverUrl,
        domain,
        currency,
        timezone,
        isActive: true,
      },
    });

    console.log("✅ Tenant criado:", tenant.id);

    // 2. Criar categorias padrao
    const categoriaPizzas = await prisma.category.create({
      data: {
        tenantId: tenant.id,
        name: "Pizzas",
        description: "Nossas deliciosas pizzas",
        sortOrder: 1,
      },
    });

    const categoriaBebidas = await prisma.category.create({
      data: {
        tenantId: tenant.id,
        name: "Bebidas",
        description: "Refrigerantes e sucos",
        sortOrder: 2,
      },
    });

    console.log("✅ Categorias criadas");

    // 3. Criar produtos exemplo
    const pizzaMargherita = await prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: categoriaPizzas.id,
        name: "Margherita",
        description: "Molho de tomate, mussarela e manjericão",
        type: "PIZZA",
        status: "ACTIVE",
        basePrice: 34.0,
        sortOrder: 1,
      },
    });

    const pizzaCalabresa = await prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: categoriaPizzas.id,
        name: "Calabresa",
        description: "Molho de tomate, mussarela, calabresa e cebola",
        type: "PIZZA",
        status: "ACTIVE",
        basePrice: 35.0,
        sortOrder: 2,
      },
    });

    const cocaCola = await prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: categoriaBebidas.id,
        name: "Coca-Cola 2L",
        description: "Refrigerante Coca-Cola 2 litros",
        type: "DRINK",
        status: "ACTIVE",
        basePrice: 8.0,
        sortOrder: 1,
      },
    });

    console.log("✅ Produtos exemplo criados");

    // 4. Criar zona de entrega padrao
    const zonaEntrega = await prisma.deliveryZone.create({
      data: {
        tenantId: tenant.id,
        name: "Zona Central",
        description: "Entrega na zona central",
        deliveryFee: 5.0,
        minOrderValue: 20.0,
        estimatedTime: 45,
        isActive: true,
      },
    });

    console.log("✅ Zona de entrega criada");

    // 5. Criar horarios de funcionamento padrao
    const diasSemana = [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
    ];

    for (const day of diasSemana) {
      await prisma.storeHours.create({
        data: {
          tenantId: tenant.id,
          dayOfWeek: day as any,
          openTime: "18:00",
          closeTime: "23:00",
          isOpen: true,
        },
      });
    }

    // Sabado
    await prisma.storeHours.create({
      data: {
        tenantId: tenant.id,
        dayOfWeek: "SATURDAY",
        openTime: "18:00",
        closeTime: "00:00",
        isOpen: true,
      },
    });

    // Domingo
    await prisma.storeHours.create({
      data: {
        tenantId: tenant.id,
        dayOfWeek: "SUNDAY",
        openTime: "18:00",
        closeTime: "23:00",
        isOpen: true,
      },
    });

    console.log("✅ Horarios de funcionamento criados");

    console.log("\n🎉 Tenant criado com sucesso!");
    console.log("\n📋 Informacoes:");
    console.log(`   ID: ${tenant.id}`);
    console.log(`   Subdomain: ${subdomain}`);
    console.log(`   URL: http://${subdomain}.localhost:3000 (dev)`);
    if (domain) {
      console.log(`   Dominio proprio: ${domain}`);
    }
    console.log(`\n💡 Proximos passos:`);
    console.log(`   1. Configure o DNS para o subdominio`);
    console.log(`   2. Faça upload do logo e imagem de capa`);
    console.log(`   3. Ajuste as cores se necessario`);
    console.log(`   4. Adicione mais produtos e categorias`);

    return tenant;
  } catch (error: any) {
    if (error.code === "P2002") {
      console.error("❌ Erro: Subdomain ou slug já existe!");
      console.error("   Escolha outro subdomain.");
    } else {
      console.error("❌ Erro ao criar tenant:", error);
    }
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  // Pegar argumentos da linha de comando
  const args = process.argv.slice(2);
  const options: Partial<CreateTenantOptions> = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace("--", "");
    const value = args[i + 1];
    if (key && value) {
      (options as any)[key] = value;
    }
  }

  // Validação mínima
  if (!options.subdomain || !options.name) {
    console.error("❌ Erro: subdomain e name sao obrigatorios");
    console.error("\nUso:");
    console.error("  pnpm tsx scripts/create-tenant.ts --subdomain cliente1 --name 'Pizzaria Cliente 1'");
    console.error("\nParametros opcionais:");
    console.error("  --primaryColor '#dc2626'");
    console.error("  --secondaryColor '#ea580c'");
    console.error("  --logoUrl 'https://...'");
    console.error("  --coverUrl 'https://...'");
    console.error("  --domain 'pizzaria-cliente1.com.br'");
    process.exit(1);
  }

  createTenant(options as CreateTenantOptions)
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

export { createTenant };

