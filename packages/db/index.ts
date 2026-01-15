import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Helper para queries com tenant_id
export function withTenant<T>(
  tenantId: string,
  query: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  return query(prisma);
}

// Tipos úteis
export type {
  Tenant,
  User,
  Product,
  Order,
  OrderItem,
  ProductVariant,
  ProductModifier,
  Modifier,
  ModifierOption,
  Category,
  Address,
  DeliveryZone,
  OrderStatusHistory,
} from "@prisma/client";

// Export enums como valores (não tipos, pois são valores em runtime)
export { OrderStatus, PaymentMethod, PaymentStatus, ProductType, ProductStatus, UserRole } from "@prisma/client";

