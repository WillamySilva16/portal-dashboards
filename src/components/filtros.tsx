"use client";
// Barra de filtros: um <form method="get"> que se envia sozinho a cada mudança.
// Os filtros ficam na URL, então dá pra compartilhar o link já filtrado.
import Form from "next/form";

export type CampoFiltro =
  | { tipo: "select"; nome: string; rotulo: string; valor?: string; opcoes: { valor: string; texto: string }[] }
  | { tipo: "texto"; nome: string; rotulo: string; valor?: string; placeholder?: string };

export function Filtros({ action, campos }: { action: string; campos: CampoFiltro[] }) {
  const algumAtivo = campos.some((c) => c.valor);
  return (
    <Form
      action={action}
      onChange={(e) => {
        if ((e.target as HTMLElement).tagName === "SELECT") e.currentTarget.requestSubmit();
      }}
      className="flex flex-wrap items-end gap-3"
    >
      {campos.map((c) => (
        <label key={c.nome} className="flex min-w-32 flex-1 flex-col gap-1 text-xs font-medium text-zinc-500">
          {c.rotulo}
          {c.tipo === "select" ? (
            <select
              name={c.nome}
              defaultValue={c.valor ?? ""}
              className="h-9 rounded-lg border border-zinc-300 bg-white px-2 text-sm text-zinc-900"
            >
              <option value="">Todos</option>
              {c.opcoes.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.texto}
                </option>
              ))}
            </select>
          ) : (
            <input
              name={c.nome}
              defaultValue={c.valor ?? ""}
              placeholder={c.placeholder}
              inputMode="numeric"
              className="h-9 rounded-lg border border-zinc-300 bg-white px-2 text-sm text-zinc-900"
            />
          )}
        </label>
      ))}
      {algumAtivo && (
        <a href={action} className="h-9 content-center px-1 text-sm text-zinc-500 underline hover:text-zinc-900">
          Limpar
        </a>
      )}
    </Form>
  );
}
