"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Upload, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import type { Category } from "@pizzaria/db";

interface ProductImportFormProps {
  categories: Category[];
}

export function ProductImportForm({ categories }: ProductImportFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    imported: number;
    total: number;
    errors: string[];
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Valida se é um arquivo Excel
      const validExtensions = [".xlsx", ".xls"];
      const fileExtension = selectedFile.name
        .substring(selectedFile.name.lastIndexOf("."))
        .toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        toast.error("Formato inválido", {
          description: "Por favor, selecione um arquivo Excel (.xlsx ou .xls)",
        });
        return;
      }
      
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error("Arquivo não selecionado", {
        description: "Por favor, selecione um arquivo Excel para importar",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/products/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao importar produtos");
      }

      setResult({
        success: true,
        imported: data.imported || 0,
        total: data.total || 0,
        errors: data.errors || [],
      });

      // Mostra toast de sucesso
      toast.success("Importação concluída!", {
        description: `${data.imported || 0} de ${data.total || 0} produtos importados com sucesso`,
      });

      // Abre o modal de sucesso
      setIsModalOpen(true);
      
      // Revalida a página de forma não-bloqueante
      startTransition(() => {
        router.refresh();
      });
    } catch (error: any) {
      setResult({
        success: false,
        imported: 0,
        total: 0,
        errors: [error.message || "Erro desconhecido"],
      });
      toast.error("Erro ao importar produtos", {
        description: error.message || "Ocorreu um erro ao processar o arquivo",
      });
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="file" className="text-base font-semibold text-gray-900 mb-2 block">
            Selecione o arquivo Excel
          </Label>
          <div className="flex items-center gap-4">
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={isLoading}
              className="flex-1"
            />
            {file && (
              <span className="text-sm text-gray-600">
                {file.name}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Formatos aceitos: .xlsx, .xls
          </p>
        </div>


        <div className="flex justify-end gap-4">
          <Link href="/admin/products">
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading || !file}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Importar Produtos
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Modal de Resultado */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          if (result?.success) {
            // Redireciona após fechar o modal de sucesso
            setTimeout(() => {
              router.push("/admin/products");
              router.refresh();
            }, 300);
          }
        }}
        title={result?.success ? "Importação Concluída" : "Erro na Importação"}
      >
        {result && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {result.success ? (
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              ) : (
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              )}
              <div className="flex-1">
                <p
                  className={`text-lg font-semibold ${
                    result.success ? "text-green-900" : "text-red-900"
                  }`}
                >
                  {result.success
                    ? `${result.imported} produtos importados com sucesso!`
                    : "Erro ao importar produtos"}
                </p>
                {result.success && result.errors.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {result.errors.length} erro(s) encontrado(s) durante a importação.
                  </p>
                )}
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="mt-4 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Erros encontrados ({result.errors.length}):
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  {result.errors.slice(0, 20).map((error, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                      <span>{error}</span>
                    </li>
                  ))}
                  {result.errors.length > 20 && (
                    <li className="text-gray-500">
                      ... e mais {result.errors.length - 20} erro(s)
                    </li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  if (result?.success) {
                    setTimeout(() => {
                      router.push("/admin/products");
                      router.refresh();
                    }, 300);
                  }
                }}
                className="min-w-[100px]"
              >
                OK
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

