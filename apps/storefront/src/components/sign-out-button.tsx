"use client";

import { signOut as nextAuthSignOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      className="w-full sm:w-auto"
      onClick={() => nextAuthSignOut({ redirectTo: "/" })}
    >
      Sair da Conta
    </Button>
  );
}

