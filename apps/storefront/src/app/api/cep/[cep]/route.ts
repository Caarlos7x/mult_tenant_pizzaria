import { NextRequest, NextResponse } from "next/server";

interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { cep: string } }
) {
  try {
    const cep = params.cep.replace(/\D/g, ""); // Remove caracteres não numéricos

    if (cep.length !== 8) {
      return NextResponse.json(
        { error: "CEP deve ter 8 dígitos" },
        { status: 400 }
      );
    }

    // Busca CEP na API ViaCEP (gratuita e sem autenticação)
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      next: { revalidate: 86400 }, // Cache por 24 horas
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Erro ao buscar CEP" },
        { status: 500 }
      );
    }

    const data: ViaCEPResponse = await response.json();

    if (data.erro) {
      return NextResponse.json(
        { error: "CEP não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      street: data.logradouro,
      neighborhood: data.bairro,
      city: data.localidade,
      state: data.uf,
      zipCode: cep,
    });
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}
