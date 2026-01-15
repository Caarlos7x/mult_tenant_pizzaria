import { requireAdmin } from "@/lib/admin-auth";
import { getTenant } from "@/lib/get-tenant";
import { TenantSettingsForm } from "@/components/admin/tenant-settings-form";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const tenant = await getTenant();

  if (!tenant) {
    return <div>Tenant não encontrado</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-2">
          Personalize sua pizzaria: cores, logo, banner e informações de contato
        </p>
      </div>

      <TenantSettingsForm tenant={tenant} />
    </div>
  );
}

