/**
 * Script para criar um usuario admin generico para testes
 * 
 * Uso:
 *   pnpm --filter @pizzaria/db exec tsx prisma/create-admin.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { resolve } from "path";

// Carrega .env
config({ path: resolve(__dirname, "../.env") });
config({ path: resolve(__dirname, "../../.env") });

const prisma = new PrismaClient();

async function main() {
  const subdomain = process.env.DEFAULT_SUBDOMAIN || "demo";
  const email = "admin@demo.com";
  const password = "admin123";
  const name = "Administrador";

  console.log("🔐 Criando usuario admin...");
  console.log(`   Subdomain: ${subdomain}`);
  console.log(`   Email: ${email}`);
  console.log(`   Senha: ${password}`);

  try {
    // 1. Buscar tenant
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain },
    });

    if (!tenant) {
      console.error(`❌ Tenant com subdomain "${subdomain}" não encontrado!`);
      console.error("   Execute primeiro: pnpm db:seed");
      process.exit(1);
    }

    console.log(`✅ Tenant encontrado: ${tenant.name}`);

    // 2. Verificar se usuario ja existe
    const existingUser = await prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        email,
      },
    });

    if (existingUser) {
      // Atualizar usuario existente para admin
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          role: "ADMIN",
          password: hashedPassword,
          name: name || existingUser.name,
        },
      });

      console.log("✅ Usuario atualizado para ADMIN");
      console.log(`   ID: ${updatedUser.id}`);
      console.log(`   Email: ${updatedUser.email}`);
      console.log(`   Role: ${updatedUser.role}`);
    } else {
      // Criar novo usuario admin
      const hashedPassword = await bcrypt.hash(password, 10);

      const admin = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email,
          password: hashedPassword,
          role: "ADMIN",
          name,
        },
      });

      console.log("✅ Usuario admin criado com sucesso!");
      console.log(`   ID: ${admin.id}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
    }

    console.log("\n🎉 Pronto para testar!");
    console.log("\n📋 Credenciais:");
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${password}`);
    console.log(`\n🌐 Acesse:`);
    console.log(`   http://${subdomain}.localhost:3000/login`);
    console.log(`   Depois acesse: http://${subdomain}.localhost:3000/admin`);
    console.log("\n⚠️  IMPORTANTE: Altere a senha em produção!");

  } catch (error: any) {
    if (error.code === "P2002") {
      console.error("❌ Erro: Email já existe para outro tenant!");
    } else {
      console.error("❌ Erro ao criar usuario admin:", error);
    }
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

