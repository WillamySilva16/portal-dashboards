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

// Corpo de tabela em que clicar numa linha filtra pela vaga dela (lida do
// data-vaga da linha). Um só componente no navegador, em vez de um por linha.
export function CorpoFiltro({ children }: { children: React.ReactNode }) {
  const fc = useFiltroCruzado();
  return (
    <tbody
      className="divide-y divide-zinc-100 [&>tr]:cursor-pointer [&>tr:hover]:bg-blue-50/60"
      title={fc ? "Clique numa linha pra filtrar o dashboard por aquela vaga" : undefined}
      onClick={(e) => {
        const vaga = (e.target as HTMLElement).closest("tr")?.dataset.vaga;
        if (fc && vaga) fc.alternar({ vaga });
      }}
    >
      {children}
    </tbody>
  );
}
