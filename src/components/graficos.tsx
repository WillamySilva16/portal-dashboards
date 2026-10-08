"use client";
// Gráficos (Recharts). Cores vêm das variáveis --serie-* do globals.css.
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFiltroCruzado } from "./filtro-cruzado";

const eixo = { fontSize: 12, fill: "var(--texto-eixo)" };
const fmt = (v: unknown) => Number(v).toLocaleString("pt-BR");

function Dica({ active, payload, label, clicavel }: { active?: boolean; payload?: { name?: string; value?: unknown; color?: string }[]; label?: unknown; clicavel?: boolean }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-white px-3 py-2 text-xs shadow-md ring-1 ring-zinc-200">
      <p className="mb-1 font-semibold text-zinc-900">{String(label)}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2 text-zinc-600">
          <span className="inline-block size-2.5 rounded-sm" style={{ background: p.color }} />
          {p.name}: <span className="font-medium text-zinc-900 tabular-nums">{fmt(p.value)}</span>
        </p>
      ))}
      {clicavel && !String(label).startsWith("Outros (") && <p className="mt-1 text-[11px] text-zinc-400">Clique pra filtrar</p>}
    </div>
  );
}

// Barras fora da seleção ficam apagadas, como o destaque do Power BI
const APAGADA = 0.3;
const opacidade = (ativa: boolean, algumaSelecionada: boolean) => (!algumaSelecionada || ativa ? 1 : APAGADA);

type Mes = { mes: string; ano: number; m: number; Abertas: number; Concluídas: number };

// Colunas agrupadas: abertas x concluídas por mês. Clicar num mês filtra por ele.
export function GraficoMensal({ dados, ano, mes }: { dados: Mes[]; ano?: number; mes?: number }) {
  const fc = useFiltroCruzado();
  if (!dados.length) return <SemDados />;
  const algum = mes !== undefined;
  const ativo = (d: Mes) => d.m === mes && (ano === undefined || d.ano === ano);
  const clicar = fc
    ? (d: { payload?: Mes }) => d.payload && fc.alternar({ ano: String(d.payload.ano), mes: String(d.payload.m) })
    : undefined;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={dados} barGap={2} margin={{ top: 20, right: 8, left: -12, bottom: 0 }} style={fc ? { cursor: "pointer" } : undefined}>
        <CartesianGrid vertical={false} stroke="var(--grade)" />
        <XAxis dataKey="mes" tick={eixo} tickLine={false} axisLine={{ stroke: "var(--grade)" }} />
        <YAxis tick={eixo} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip content={<Dica clicavel={!!fc} />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
        <Legend verticalAlign="top" align="left" iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12, top: -4 }} formatter={(v: string) => <span style={{ color: "var(--foreground)" }}>{v}</span>} />
        <Bar isAnimationActive={false} dataKey="Abertas" fill="var(--serie-1)" radius={[4, 4, 0, 0]} maxBarSize={28} onClick={clicar}>
          {dados.map((d) => (
            <Cell key={d.mes} fillOpacity={opacidade(ativo(d), algum)} />
          ))}
          <LabelList dataKey="Abertas" position="top" fontSize={11} fill="var(--texto-eixo)" formatter={fmt} />
        </Bar>
        <Bar isAnimationActive={false} dataKey="Concluídas" fill="var(--serie-2)" radius={[4, 4, 0, 0]} maxBarSize={28} onClick={clicar}>
          {dados.map((d) => (
            <Cell key={d.mes} fillOpacity={opacidade(ativo(d), algum)} />
          ))}
          <LabelList dataKey="Concluídas" position="top" fontSize={11} fill="var(--texto-eixo)" formatter={fmt} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

type Item = { nome: string; valor: number };
const ehOutros = (nome: string) => nome.startsWith("Outros (");

// Barras horizontais de uma série (vagas abertas por categoria, local, etapa...).
// Com `campo`, clicar numa barra filtra o dashboard por aquele valor.
export function GraficoBarras({
  dados,
  serie = "Vagas abertas",
  campo,
  selecionado,
}: {
  dados: Item[];
  serie?: string;
  campo?: string;
  selecionado?: string;
}) {
  const fc = useFiltroCruzado();
  if (!dados.length) return <SemDados />;
  const clicavel = fc && campo;
  const clicar = clicavel
    ? (d: { payload?: Item }) => d.payload && !ehOutros(d.payload.nome) && fc.alternar({ [campo]: d.payload.nome })
    : undefined;
  const altura = Math.max(120, dados.length * 26 + 16);
  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart data={dados} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }} style={clicavel ? { cursor: "pointer" } : undefined}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="nome"
          width={180}
          tick={eixo}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: string) => (v.length > 24 ? v.slice(0, 23) + "…" : v)}
        />
        <Tooltip content={<Dica clicavel={!!clicavel} />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
        <Bar isAnimationActive={false} dataKey="valor" name={serie} fill="var(--serie-1)" radius={[0, 4, 4, 0]} barSize={16} onClick={clicar}>
          {dados.map((d) => (
            <Cell key={d.nome} fillOpacity={opacidade(d.nome === selecionado, selecionado !== undefined)} />
          ))}
          <LabelList dataKey="valor" position="right" fontSize={11} fill="var(--texto-eixo)" formatter={fmt} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function SemDados() {
  return <p className="py-10 text-center text-sm text-zinc-400">Sem dados para os filtros escolhidos.</p>;
}
