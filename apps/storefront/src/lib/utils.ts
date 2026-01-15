import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata uma data de forma consistente entre servidor e cliente
 * para evitar erros de hidratação
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

/**
 * Formata um CEP de forma consistente entre servidor e cliente
 * para evitar erros de hidratação
 * Aceita CEPs com ou sem formatação e sempre retorna no formato 00000-000
 * Retorna null se não houver CEP válido
 * Esta função é determinística e sempre retorna o mesmo resultado para a mesma entrada
 */
export function formatCEP(cep: string | number | null | undefined): string | null {
  // Trata valores falsy
  if (cep === null || cep === undefined || cep === "") {
    return null;
  }
  
  // Converte para string e remove todos os caracteres não numéricos
  const cepStr = String(cep).replace(/\D/g, "");
  
  // Valida se tem exatamente 8 dígitos
  if (cepStr.length !== 8) {
    return null;
  }
  
  // Formata no padrão 00000-000
  return `${cepStr.slice(0, 5)}-${cepStr.slice(5)}`;
}

