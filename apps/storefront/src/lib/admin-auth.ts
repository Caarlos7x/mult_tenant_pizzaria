/**
 * Helpers para autenticacao e autorizacao de admin
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Verifica se o usuario atual e admin e retorna o tenant
 * Redireciona para login se nao autenticado
 * Redireciona para home se nao for admin
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?redirect=/admin");
  }

  const userRole = (session.user as any)?.role;

  if (userRole !== "ADMIN") {
    redirect("/");
  }

  return {
    user: session.user,
    tenantId: (session.user as any)?.id ? undefined : null, // Será obtido via getTenantId
  };
}

/**
 * Verifica se o usuario e admin (sem redirecionar)
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  const userRole = (session.user as any)?.role;
  return userRole === "ADMIN";
}

