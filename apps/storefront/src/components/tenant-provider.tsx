"use client";

import { createContext, useContext } from "react";
import type { Tenant } from "@pizzaria/db";

interface TenantContextType {
  tenant: Tenant;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({
  tenant,
  children,
}: {
  tenant: Tenant;
  children: React.ReactNode;
}) {
  return <TenantContext.Provider value={{ tenant }}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within TenantProvider");
  }
  return context;
}

