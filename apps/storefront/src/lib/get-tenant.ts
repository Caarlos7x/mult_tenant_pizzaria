import { headers } from "next/headers";
import { prisma } from "@pizzaria/db";
import type { Tenant } from "@pizzaria/db";

/**
 * Obtém o tenant atual a partir dos headers do middleware
 * Resolve o tenant aqui (Node.js runtime) ao invés do middleware (Edge runtime)
 */
export async function getTenant(): Promise<Tenant | null> {
  const headersList = await headers();
  const subdomain = headersList.get("x-tenant-subdomain");
  const host = headersList.get("x-tenant-host");

  if (!subdomain) {
    return null;
  }

  // Busca tenant por subdomínio
  let tenant = await prisma.tenant.findUnique({
    where: { subdomain },
  });

  // Se não encontrou, tenta por domínio próprio
  if (!tenant && host) {
    tenant = await prisma.tenant.findUnique({
      where: { domain: host },
    });
  }

  if (!tenant || !tenant.isActive) {
    return null;
  }

  return tenant;
}

/**
 * Obtém o tenantId a partir dos headers (para uso em API routes)
 */
export async function getTenantId(): Promise<string | null> {
  const tenant = await getTenant();
  return tenant?.id || null;
}

