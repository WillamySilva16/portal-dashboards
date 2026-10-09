// Peças visuais reaproveitadas nas telas de admin
export const input = "campo";
export const botao = "h-9 rounded-lg bg-marca px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#21456a]";
export const botaoLeve = "h-8 rounded-lg bg-white px-3 text-sm text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50";
export const th = "px-3 py-2.5 font-semibold whitespace-nowrap";
export const cabecaTabela = "cabeca-tabela";
export const td = "px-3 py-2 align-middle";

export function Cartao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="cartao p-5">
      <h2 className="mb-4 text-[15px] font-semibold text-zinc-900">{titulo}</h2>
      {children}
    </section>
  );
}

export async function Erro({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { erro } = await searchParams;
  if (!erro) return null;
  return <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">{String(erro)}</p>;
}

export const dataHora = (d: Date | null) =>
  d ? d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" }) : "—";
