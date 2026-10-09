"use client";
// Filtro cruzado, como no Power BI: clicar numa barra ou linha filtra o
// dashboard inteiro. Os filtros continuam na URL (dá pra compartilhar o link),
// e clicar de novo no que já está selecionado tira o filtro.
// Toda troca de filtro dentro daqui (selects, atalhos, chips, ordenação) vira
// uma navegação em transição: a tela atual fica visível, meio apagada, até a
// nova chegar, em vez de piscar ou recarregar a página inteira.
import { createContext, use, useTransition } from "react";
import { useRouter } from "next/navigation";

export type Valores = Record<string, string | undefined>;

const Ctx = createContext<{ alternar: (v: Valores) => void; navegar: (url: string) => void } | null>(null);

export function FiltroCruzado({ base, filtros, children }: { base: string; filtros: Valores; children: React.ReactNode }) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();

  function navegar(url: string) {
    iniciar(() => router.push(url, { scroll: false }));
  }

  function alternar(v: Valores) {
    const jaAtivo = Object.entries(v).every(([k, x]) => filtros[k] === x);
    const novo = { ...filtros };
    for (const [k, x] of Object.entries(v)) novo[k] = jaAtivo ? undefined : x;
    const p = new URLSearchParams();
    for (const [k, x] of Object.entries(novo)) if (x) p.set(k, x);
    const s = p.toString();
    navegar(s ? `${base}?${s}` : base);
  }

  return (
    <Ctx value={{ alternar, navegar }}>
      <div
        aria-busy={pendente}
        className={`space-y-5 transition-opacity ${pendente ? "cursor-progress opacity-60" : ""}`}
        onClick={(e) => {
          // Links internos do painel (atalhos de período, chips, ordenar tabela)
          const a = (e.target as HTMLElement).closest("a");
          if (!a || a.target || a.hasAttribute("download") || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
          const url = new URL(a.href);
          if (url.origin !== location.origin || url.pathname !== base) return;
          e.preventDefault();
          navegar(url.pathname + url.search);
        }}
      >
        {children}
      </div>
      {pendente && (
        <div role="status" className="fixed top-20 left-1/2 z-50 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-superficie px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-md ring-1 ring-zinc-200">
          <span className="size-3 animate-spin rounded-full border-2 border-zinc-300 border-t-[#2a78d6]" />
          Atualizando…
        </div>
      )}
    </Ctx>
  );
}

export function useFiltroCruzado() {
  return use(Ctx);
}
