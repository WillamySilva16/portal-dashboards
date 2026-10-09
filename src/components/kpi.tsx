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

// Esqueleto do painel enquanto os dados chegam: mesma forma da tela pronta,
// então trocar de aba mostra a estrutura na hora em vez de um "Carregando…".
export function EsqueletoPainel() {
  const bloco = "animate-pulse rounded-lg bg-zinc-100";
  return (
    <div aria-busy className="space-y-5" role="status" aria-label="Carregando">
      <div className="space-y-2">
        <div className={`${bloco} h-3 w-32`} />
        <div className={`${bloco} h-7 w-64`} />
        <div className={`${bloco} h-4 w-80`} />
      </div>
      <div className={`${bloco} h-10 w-96 max-w-full`} />
      <div className="cartao h-36 p-4" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="cartao space-y-3 p-5">
            <div className={`${bloco} h-3 w-24`} />
            <div className={`${bloco} h-8 w-16`} />
          </div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="cartao h-80 p-5"><div className={`${bloco} h-full`} /></div>
        <div className="cartao h-80 p-5"><div className={`${bloco} h-full`} /></div>
      </div>
    </div>
  );
}
