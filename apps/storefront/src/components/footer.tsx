import { getTenant } from "@/lib/get-tenant";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export async function Footer() {
  const tenant = await getTenant();

  if (!tenant) return null;

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sobre */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {tenant.logoUrl && (
                <img
                  src={tenant.logoUrl}
                  alt={tenant.name}
                  className="h-8 w-auto"
                />
              )}
              <h3 className="text-xl font-bold text-white">{tenant.name}</h3>
            </div>
            <p className="text-sm text-gray-400">
              A melhor pizza da cidade, feita com ingredientes frescos e muito amor.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="text-white font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/menu" className="hover:text-white transition-colors">
                  Cardápio
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-white transition-colors">
                  Meus Pedidos
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  Minha Conta
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contato</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span>📞</span>
                <span>(00) 0000-0000</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📧</span>
                <span>contato@{tenant.subdomain}.com</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span>
                <span>Sua Cidade, Estado</span>
              </li>
            </ul>
          </div>

          {/* Redes Sociais */}
          <div>
            <h4 className="text-white font-semibold mb-4">Siga-nos</h4>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Facebook"
              >
                <span className="text-lg">📘</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Instagram"
              >
                <span className="text-lg">📷</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="WhatsApp"
              >
                <span className="text-lg">💬</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>
            © {new Date().getFullYear()} {tenant.name}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

