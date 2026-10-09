"use client";
// Barra de filtros: um <form method="get"> que se envia sozinho a cada mudança.
// Os filtros ficam na URL, então dá pra compartilhar o link já filtrado.
import Form from "next/form";
import { useFiltroCruzado } from "./filtro-cruzado";

export type CampoFiltro =
  | { tipo: "select"; nome: string; rotulo: string; valor?: string; opcoes: { valor: string; texto: string }[] }
  | { tipo: "texto"; nome: string; rotulo: string; valor?: string; placeholder?: string }
  | { tipo: "data"; nome: string; rotulo: string; valor?: string };

// `todos` são todos os filtros ativos da página: os que não têm campo aqui
// (ex.: categoria, escolhida clicando no gráfico) vão escondidos no form,
// pra não se perderem quando a pessoa muda um select.
// `children` aparece no pé do cartão (atalhos de período, filtros ativos).
export function Filtros({
  action,
  campos,
  todos = {},
  children,
}: {
  action: string;
  campos: CampoFiltro[];
  todos?: Record<string, string | undefined>;
  children?: React.ReactNode;
}) {
  const nomes = new Set(campos.map((c) => c.nome));
  const escondidos = Object.entries(todos).filter(([k, v]) => v && !nomes.has(k));
  const algumAtivo = campos.some((c) => c.valor) || escondidos.length > 0;
  const fc = useFiltroCruzado();

  // Dentro do painel, troca de filtro navega sem recarregar e mostra "Atualizando…"
  function enviar(form: HTMLFormElement) {
    if (!fc) return form.requestSubmit();
    const p = new URLSearchParams();
    for (const [k, v] of new FormData(form)) if (typeof v === "string" && v.trim()) p.set(k, v.trim());
    const s = p.toString();
    fc.navegar(s ? `${action}?${s}` : action);
  }
  return (
    <div className="cartao p-4">
    <Form
      action={action}
      onChange={(e) => {
        const alvo = e.target as HTMLElement;
        if (alvo.tagName === "SELECT" || (alvo as HTMLInputElement).type === "date") enviar(e.currentTarget);
      }}
      onSubmit={(e) => {
        if (!fc) return;
        e.preventDefault();
        enviar(e.currentTarget);
      }}
      className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] items-end gap-3"
    >
      {escondidos.map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      {campos.map((c) => (
        <label key={c.nome} className="flex flex-col gap-1.5">
          <span className="rotulo">{c.rotulo}</span>
          {c.tipo === "select" ? (
            <select
              name={c.nome}
              defaultValue={c.valor ?? ""}
              className="campo"
            >
              <option value="">Todos</option>
              {c.opcoes.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.texto}
                </option>
              ))}
            </select>
          ) : c.tipo === "data" ? (
            <input
              type="date"
              name={c.nome}
              defaultValue={c.valor ?? ""}
              className="campo"
            />
          ) : (
            <input
              name={c.nome}
              defaultValue={c.valor ?? ""}
              placeholder={c.placeholder}
              inputMode="numeric"
              className="campo"
            />
          )}
        </label>
      ))}
      {algumAtivo && (
        <a href={action} className="h-9 content-center justify-self-start px-1 text-sm text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline">
          Limpar filtros
        </a>
      )}
    </Form>
    {children && <div className="mt-4 space-y-3 border-t border-zinc-100 pt-3">{children}</div>}
    </div>
  );
}
