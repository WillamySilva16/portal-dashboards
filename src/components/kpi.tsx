// Card de indicador (equivalente aos cartões do Power BI)
export function Kpi({
  titulo,
  valor,
  cor,
  variacao,
}: {
  titulo: string;
  valor: string;
  cor: string; // cor de destaque do card
  variacao?: string;
}) {
  return (
    <div className="cartao relative overflow-hidden p-5">
      <span className="absolute inset-x-0 top-0 h-1" style={{ background: cor }} />
      <p className="flex items-center gap-2 text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">
        <span className="size-2 shrink-0 rounded-full" style={{ background: cor }} />
        {titulo}
      </p>
      <p className="mt-3 text-[32px] leading-none font-semibold tracking-tight text-zinc-900 tabular-nums">{valor}</p>
      {variacao && <p className="mt-2.5 text-xs text-zinc-500">{variacao}</p>}
    </div>
  );
}

export function Secao({ titulo, acao, children }: { titulo: string; acao?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="cartao p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-[15px] font-semibold text-zinc-900">{titulo}</h2>
        {acao}
      </div>
      {children}
    </section>
  );
}
