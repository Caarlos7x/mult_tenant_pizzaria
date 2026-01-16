import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@pizzaria/db";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import type { NextAuthConfig } from "next-auth";

async function getTenantIdFromHeaders(): Promise<string | null> {
  const headersList = await headers();
  const subdomain = headersList.get("x-tenant-subdomain");
  
  if (!subdomain) {
    return null;
  }

  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
    select: { id: true },
  });

  return tenant?.id || null;
}

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        phone: { label: "Telefone", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials) return null;

          const tenantId = await getTenantIdFromHeaders();
          if (!tenantId) {
            console.error("Tenant ID not found in headers");
            return null;
          }

          // Busca usuário por email ou telefone
          const user = await prisma.user.findFirst({
            where: {
              tenantId,
              OR: [
                { email: credentials.email },
                { phone: credentials.phone },
              ],
            },
          });

          if (!user || !user.password) {
            return null;
          }

          // Verifica senha
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role,
          };
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.phone = (user as any).phone;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Permite redirecionamento para URLs relativas
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Permite redirecionamento para URLs do mesmo domínio
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, token }) {
      try {
        if (token && session) {
          if (!session.user) {
            session.user = {
              id: "",
              email: "",
              name: null,
              role: "",
            } as any;
          }
          if (token.id) {
            (session.user as any).id = token.id as string;
          }
          if (token.role) {
            (session.user as any).role = token.role as string;
          }
          if (token.phone) {
            (session.user as any).phone = token.phone as string;
          }
          if (token.email) {
            session.user.email = token.email as string;
          }
          if (token.name) {
            session.user.name = token.name as string | null;
          }
        }
        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        return session;
      }
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "fallback-secret-key-change-in-production",
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

