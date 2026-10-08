// Card de indicador (equivalente aos cartões do Power BI)
export function Kpi({
  titulo,
  valor,
  cor,
  variacao,
}: {
  titulo: string;
  valor: string;
  cor: string; // cor da faixa lateral
  variacao?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-white p-4 pl-5 ring-1 ring-zinc-200">
      <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: cor }} />
      <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">{titulo}</p>
      <p className="mt-1 text-3xl font-semibold text-zinc-900 tabular-nums">{valor}</p>
      {variacao && <p className="mt-1 text-xs text-zinc-500">{variacao}</p>}
    </div>
  );
}

export function Secao({ titulo, acao, children }: { titulo: string; acao?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl bg-white p-4 ring-1 ring-zinc-200">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-zinc-700">{titulo}</h2>
        {acao}
      </div>
      {children}
    </section>
  );
}
