// Peças visuais reaproveitadas nas telas de admin
export const input = "h-9 rounded-lg border border-zinc-300 bg-white px-2 text-sm text-zinc-900";
export const botao = "h-9 rounded-lg bg-marca px-3 text-sm font-medium text-white hover:opacity-90";
export const botaoLeve = "h-8 rounded-lg px-2 text-sm text-zinc-600 ring-1 ring-zinc-300 hover:bg-zinc-50";
export const th = "px-3 py-2 font-medium whitespace-nowrap";
export const td = "px-3 py-2 align-middle";

export function Cartao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl bg-white p-4 ring-1 ring-zinc-200">
      <h2 className="mb-3 text-sm font-semibold text-zinc-700">{titulo}</h2>
      {children}
    </section>
  );
}

export async function Erro({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { erro } = await searchParams;
  if (!erro) return null;
  return <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{String(erro)}</p>;
}

export const dataHora = (d: Date | null) =>
  d ? d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" }) : "—";
