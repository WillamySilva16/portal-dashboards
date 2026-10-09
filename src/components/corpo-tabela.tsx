"use client";
// Corpo das tabelas de detalhe. O servidor manda só os valores (bem mais leve
// que mandar o HTML pronto de centenas de linhas), e o navegador desenha as
// primeiras linhas na hora e o resto conforme a pessoa rola a tabela.
// Clicar numa linha filtra o dashboard pela vaga dela (filtro cruzado).
import { useEffect, useRef, useState } from "react";
import { useFiltroCruzado } from "./filtro-cruzado";
import { Tag } from "./tag";

// num: número à direita; alerta: número em destaque quando > 0; tag: etiqueta colorida
export type TipoCelula = "texto" | "num" | "alerta" | "tag";
export type Celula = string | number | null;
// [vaga, ...células]
export type LinhaTabela = [number, ...Celula[]];

const PRIMEIRAS = 60;
const POR_VEZ = 120;

export function CorpoTabela({ tipos, linhas }: { tipos: TipoCelula[]; linhas: LinhaTabela[] }) {
  const fc = useFiltroCruzado();
  const [mostrar, setMostrar] = useState(PRIMEIRAS);
  const fim = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    const el = fim.current;
    if (!el) return;
    // Observa dentro da caixa com rolagem da própria tabela
    const caixa = el.closest(".overflow-auto");
    const io = new IntersectionObserver((e) => e[0].isIntersecting && setMostrar((n) => n + POR_VEZ), { root: caixa, rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, [mostrar, linhas]);

  return (
    <tbody
      className="divide-y divide-zinc-100 [&>tr]:cursor-pointer [&>tr:hover]:bg-blue-50/60"
      title={fc ? "Clique numa linha pra filtrar o dashboard por aquela vaga" : undefined}
      onClick={(e) => {
        const vaga = (e.target as HTMLElement).closest("tr")?.dataset.vaga;
        if (fc && vaga) fc.alternar({ vaga });
      }}
    >
      {linhas.slice(0, mostrar).map(([vaga, ...celulas], i) => (
        <tr key={i} data-vaga={vaga}>
          {celulas.map((c, j) => {
            const tipo = tipos[j];
            if (tipo === "tag") return <td key={j}><Tag texto={c === null ? null : String(c)} /></td>;
            const numero = tipo === "num" || tipo === "alerta";
            const destaque = tipo === "alerta" && typeof c === "number" && c > 0;
            return (
              <td key={j} className={`${numero ? "text-right tabular-nums" : ""} ${destaque ? "font-semibold text-amber-700" : ""}`}>
                {c ?? "—"}
              </td>
            );
          })}
        </tr>
      ))}
      {mostrar < linhas.length && (
        <tr ref={fim} aria-hidden>
          <td colSpan={tipos.length} className="text-center text-xs text-zinc-400">Carregando mais linhas…</td>
        </tr>
      )}
    </tbody>
  );
}
