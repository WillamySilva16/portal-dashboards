"use client";
// Filtro cruzado, como no Power BI: clicar numa barra ou linha filtra o
// dashboard inteiro. Os filtros continuam na URL (dá pra compartilhar o link),
// e clicar de novo no que já está selecionado tira o filtro.
import { createContext, use, useTransition } from "react";
import { useRouter } from "next/navigation";

export type Valores = Record<string, string | undefined>;

const Ctx = createContext<{ alternar: (v: Valores) => void } | null>(null);

export function FiltroCruzado({ base, filtros, children }: { base: string; filtros: Valores; children: React.ReactNode }) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();

  function alternar(v: Valores) {
    const jaAtivo = Object.entries(v).every(([k, x]) => filtros[k] === x);
    const novo = { ...filtros };
    for (const [k, x] of Object.entries(v)) novo[k] = jaAtivo ? undefined : x;
    const p = new URLSearchParams();
    for (const [k, x] of Object.entries(novo)) if (x) p.set(k, x);
    const s = p.toString();
    iniciar(() => router.push(s ? `${base}?${s}` : base, { scroll: false }));
  }

  return (
    <Ctx value={{ alternar }}>
      <div aria-busy={pendente} className={`space-y-4 transition-opacity ${pendente ? "opacity-60" : ""}`}>
        {children}
      </div>
    </Ctx>
  );
}

export function useFiltroCruzado() {
  return use(Ctx);
}

// Linha de tabela que filtra pelo valor dela ao ser clicada
export function LinhaFiltro({ valores, children }: { valores: Valores; children: React.ReactNode }) {
  const fc = useFiltroCruzado();
  return (
    <tr
      onClick={fc ? () => fc.alternar(valores) : undefined}
      title={fc ? "Clique pra filtrar o dashboard por esta vaga" : undefined}
      className="cursor-pointer hover:bg-blue-50/60"
    >
      {children}
    </tr>
  );
}
