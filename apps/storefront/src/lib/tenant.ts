import { prisma } from "@pizzaria/db";
import type { Tenant } from "@pizzaria/db";

export interface TenantContext {
  tenant: Tenant;
  tenantId: string;
}

/**
 * Resolve tenant por host/subdomínio
 */
export async function resolveTenant(host: string): Promise<TenantContext | null> {
  // Remove porta se houver
  const cleanHost = host.split(":")[0].toLowerCase();

  // Tenta encontrar por subdomínio primeiro
  const subdomain = cleanHost.split(".")[0];
  
  // Se for localhost ou IP, usa subdomain padrão para dev
  const isLocal = cleanHost === "localhost" || cleanHost.startsWith("127.0.0.1") || cleanHost.startsWith("192.168");
  const finalSubdomain = isLocal ? process.env.DEFAULT_SUBDOMAIN || "demo" : subdomain;

  // Busca tenant por subdomínio
  let tenant = await prisma.tenant.findUnique({
    where: { subdomain: finalSubdomain },
  });

  // Se não encontrou, tenta por domínio próprio
  if (!tenant) {
    tenant = await prisma.tenant.findUnique({
      where: { domain: cleanHost },
    });
  }

  if (!tenant || !tenant.isActive) {
    return null;
  }

  return {
    tenant,
    tenantId: tenant.id,
  };
}

/**
 * Helper para queries com tenant_id
 */
export function withTenantFilter<T extends { tenantId: string }>(
  tenantId: string,
  data: Omit<T, "tenantId">
): T {
  return {
    ...data,
    tenantId,
  } as T;
}

