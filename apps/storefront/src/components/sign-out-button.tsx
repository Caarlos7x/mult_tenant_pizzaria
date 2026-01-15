"use client";

import { signOut as nextAuthSignOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SignOutButtonProps {
  className?: string;
}

export function SignOutButton({ className }: SignOutButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn("w-full sm:w-auto", className)}
      onClick={() => nextAuthSignOut({ redirectTo: "/" })}
    >
      Sair da Conta
    </Button>
  );
}

