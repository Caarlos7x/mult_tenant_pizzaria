import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  
  // Remove porta se houver
  const cleanHost = host.split(":")[0].toLowerCase();

  // Tenta encontrar por subdomínio primeiro
  const subdomain = cleanHost.split(".")[0];
  
  // Se for localhost ou IP, usa subdomain padrão para dev
  const isLocal = cleanHost === "localhost" || cleanHost.startsWith("127.0.0.1") || cleanHost.startsWith("192.168");
  const finalSubdomain = isLocal ? process.env.DEFAULT_SUBDOMAIN || "demo" : subdomain;

  // Adiciona subdomínio nos headers para uso nas rotas (sem acessar banco aqui)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-subdomain", finalSubdomain);
  requestHeaders.set("x-tenant-host", cleanHost);

  // Passa dados via header (será resolvido no layout que roda em Node.js runtime)
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

