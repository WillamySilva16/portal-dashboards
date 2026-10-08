// Colunas das tabelas do Dashboard de Vagas. As mesmas definições servem
// pra tela (cabeçalho que ordena) e pra planilha baixada.
import type { Coluna, Linha, VagaTabela } from "@/lib/vagas";

export const dataBR = (d: Date) => d.toLocaleDateString("pt-BR", { timeZone: "UTC" });

export const COLUNAS_VAGAS: Coluna<VagaTabela>[] = [
  { id: "data", titulo: "Data", valor: (v) => v.data, numero: true },
  { id: "vaga", titulo: "Vaga", valor: (v) => v.vaga, numero: true },
  { id: "supervisao", titulo: "Supervisão", valor: (v) => v.supervisao },
  { id: "cargo", titulo: "Cargo", valor: (v) => v.cargo },
  { id: "local", titulo: "Local", valor: (v) => v.local },
  { id: "base", titulo: "Base", valor: (v) => v.base },
  { id: "dias", titulo: "Dias", valor: (v) => v.diasMax, numero: true },
  { id: "situacao", titulo: "Situação", valor: (v) => v.situacao },
  { id: "sla", titulo: "SLA", valor: (v) => v.sla },
];

// Só na planilha
export const EXTRAS_VAGAS: Coluna<VagaTabela>[] = [
  { id: "posicoes", titulo: "Posições", valor: (v) => v.posicoes, numero: true },
  { id: "categoria", titulo: "Categoria", valor: (v) => v.categoria },
  { id: "cliente", titulo: "Cliente", valor: (v) => v.cliente },
  { id: "segmento", titulo: "Segmento", valor: (v) => v.segmento },
  { id: "solicitante", titulo: "Solicitante", valor: (v) => v.solicitante },
];

export const COLUNAS_POSICOES: Coluna<Linha>[] = [
  { id: "vaga", titulo: "Vaga", valor: (l) => l.vaga, numero: true },
  { id: "posicao", titulo: "Posição", valor: (l) => l.posicao, numero: true },
  { id: "cargo", titulo: "Cargo", valor: (l) => l.cargo },
  { id: "local", titulo: "Local", valor: (l) => l.local },
  { id: "dias", titulo: "Dias", valor: (l) => l.dias, numero: true },
  { id: "statusRS", titulo: "Status R&S", valor: (l) => l.statusRS },
  { id: "etapa", titulo: "Etapa R&S", valor: (l) => l.etapaRS },
  { id: "solicitante", titulo: "Solicitante", valor: (l) => l.solicitante },
  { id: "data", titulo: "Data", valor: (l) => l.data, numero: true },
];

export const EXTRAS_POSICOES: Coluna<Linha>[] = [
  { id: "situacao", titulo: "Situação da vaga", valor: (l) => l.situacao },
  { id: "sla", titulo: "SLA", valor: (l) => l.sla },
  { id: "categoria", titulo: "Categoria", valor: (l) => l.categoria },
  { id: "cliente", titulo: "Cliente", valor: (l) => l.cliente },
  { id: "base", titulo: "Base", valor: (l) => l.base },
  { id: "supervisao", titulo: "Supervisão", valor: (l) => l.supervisao },
];

// Valor como texto pra planilha
export function textoCelula(v: string | number | Date | null | undefined) {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return dataBR(v);
  return v;
}
