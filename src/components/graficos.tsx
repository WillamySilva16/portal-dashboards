"use client";
// Gráficos (Recharts). Cores vêm das variáveis --serie-* do globals.css.
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const eixo = { fontSize: 12, fill: "var(--texto-eixo)" };
const fmt = (v: unknown) => Number(v).toLocaleString("pt-BR");

function Dica({ active, payload, label }: { active?: boolean; payload?: { name?: string; value?: unknown; color?: string }[]; label?: unknown }) {
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
    </div>
  );
}

// Colunas agrupadas: abertas x concluídas por mês
export function GraficoMensal({ dados }: { dados: { mes: string; Abertas: number; Concluídas: number }[] }) {
  if (!dados.length) return <SemDados />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={dados} barGap={2} margin={{ top: 20, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--grade)" />
        <XAxis dataKey="mes" tick={eixo} tickLine={false} axisLine={{ stroke: "var(--grade)" }} />
        <YAxis tick={eixo} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip content={<Dica />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
        <Legend verticalAlign="top" align="left" iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12, top: -4 }} formatter={(v: string) => <span style={{ color: "var(--foreground)" }}>{v}</span>} />
        <Bar isAnimationActive={false} dataKey="Abertas" fill="var(--serie-1)" radius={[4, 4, 0, 0]} maxBarSize={28}>
          <LabelList dataKey="Abertas" position="top" fontSize={11} fill="var(--texto-eixo)" formatter={fmt} />
        </Bar>
        <Bar isAnimationActive={false} dataKey="Concluídas" fill="var(--serie-2)" radius={[4, 4, 0, 0]} maxBarSize={28}>
          <LabelList dataKey="Concluídas" position="top" fontSize={11} fill="var(--texto-eixo)" formatter={fmt} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Barras horizontais de uma série (vagas abertas por categoria, local, etapa...)
export function GraficoBarras({ dados, serie = "Vagas abertas" }: { dados: { nome: string; valor: number }[]; serie?: string }) {
  if (!dados.length) return <SemDados />;
  const altura = Math.max(120, dados.length * 26 + 16);
  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart data={dados} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
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
        <Tooltip content={<Dica />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
        <Bar isAnimationActive={false} dataKey="valor" name={serie} fill="var(--serie-1)" radius={[0, 4, 4, 0]} barSize={16}>
          <LabelList dataKey="valor" position="right" fontSize={11} fill="var(--texto-eixo)" formatter={fmt} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function SemDados() {
  return <p className="py-10 text-center text-sm text-zinc-400">Sem dados para os filtros escolhidos.</p>;
}
