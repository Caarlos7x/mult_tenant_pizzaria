import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getTenant } from "@/lib/get-tenant";
import { TenantProvider } from "@/components/tenant-provider";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenant();

  return {
    title: tenant?.name || "Pizzaria",
    description: "Peça sua pizza online",
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenant();

  if (!tenant) {
    return (
      <html lang="pt-BR">
        <body className={inter.className}>
          <div className="flex min-h-screen items-center justify-center">
            <p>Pizzaria não encontrada</p>
          </div>
        </body>
      </html>
    );
  }

  // Converte cores hex para HSL para CSS variables
  const hexToHsl = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const primaryHsl = hexToHsl(tenant.primaryColor);
  const secondaryHsl = tenant.secondaryColor ? hexToHsl(tenant.secondaryColor) : primaryHsl;

  return (
    <html lang="pt-BR" style={{ fontFamily: tenant.font || "Inter, sans-serif" }}>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍕</text></svg>" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --primary: ${primaryHsl};
                --primary-foreground: 0 0% 100%;
                --secondary: ${secondaryHsl};
                --secondary-foreground: 0 0% 100%;
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <TenantProvider tenant={tenant}>{children}</TenantProvider>
        </Providers>
      </body>
    </html>
  );
}

