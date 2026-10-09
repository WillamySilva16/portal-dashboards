// Etiqueta colorida de situação/SLA. Serve no servidor e no navegador.
const COR: Record<string, string> = {
  "Fora do prazo": "bg-red-50 text-red-700",
  "Em alerta": "bg-amber-50 text-amber-800",
  "Dentro do prazo": "bg-green-50 text-green-800",
  "Concluída": "bg-green-50 text-green-800",
  "CONCLUÍDA": "bg-green-50 text-green-800",
  "Cancelada": "bg-zinc-100 text-zinc-600",
  "EXCLUÍDA": "bg-red-50 text-red-700",
  "Em andamento": "bg-blue-50 text-blue-800",
  "Outra situação": "bg-amber-50 text-amber-800",
  "Fechada": "bg-green-50 text-green-800",
  "Pendente": "bg-amber-50 text-amber-800",
  "Excluída": "bg-red-50 text-red-700",
  "Não preenchida": "bg-zinc-100 text-zinc-600",
  "EM ANDAMENTO": "bg-blue-50 text-blue-800",
};

export function Tag({ texto }: { texto: string | null }) {
  if (!texto) return <span className="text-zinc-400">—</span>;
  return <span className={`rounded px-1.5 py-0.5 text-xs whitespace-nowrap ${COR[texto] ?? "bg-zinc-100 text-zinc-700"}`}>{texto}</span>;
}
