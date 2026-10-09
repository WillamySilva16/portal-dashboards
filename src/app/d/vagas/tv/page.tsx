// Dashboard de Vagas: modo TV. Tela cheia, números grandes, atualiza sozinha
// a cada 5 minutos. Sem barra de filtros: usa os que vierem no link
// (o "Modo TV" das abas leva os filtros escolhidos, ex.: período de abertura).
import { Suspense } from "react";
import { abrirDashboard } from "@/lib/dal";
import { filtrar, getVagas, hojeUTC, lerFiltros, linhasPorVaga, MESES, type Linha } from "@/lib/vagas";
import { num, periodoTexto } from "../comum";
import { Atualizar } from "./atualizar";

export const metadata = { title: "Vagas na TV | Portal de Dashboards" };

const DIA = 86_400_000;

export default function Page({ searchParams }: PageProps<"/d/vagas/tv">) {
  return (
    <main className="flex min-h-screen flex-1 flex-col gap-[2vh] bg-[#0f1b2a] p-[3vh] text-white">
      <Suspense fallback={<p className="text-2xl text-white/50">Carregando…</p>}>
        <Conteudo searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Conteudo({ searchParams }: { searchParams: PageProps<"/d/vagas/tv">["searchParams"] }) {
  await abrirDashboard("vagas");
  const f = lerFiltros(await searchParams);
  const { linhas: todas, atualizadoEm } = await getVagas();
  const linhas = filtrar(todas, f);
  const periodo = periodoTexto(f);

  const hoje = hojeUTC();
  const d = new Date(hoje);
  const inicioMes = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
  const nomeMes = MESES[d.getUTCMonth()].toLowerCase();

  // "Vaga aberta" = Envia Seleção, a mesma regra do card Em andamento
  const vagas = linhasPorVaga(linhas);
  const andamento = vagas.filter((v) => v.situacao === "Em andamento");
  const outras = vagas.filter((v) => v.situacao === "Outra situação").length;
  const pendentes = linhas.filter((l) => l.sitPosicao === "Pendente");
  const arrastadas = andamento.filter((v) => v.data.getTime() < inicioMes).length;
  const abertasMes = vagas.filter((v) => v.data.getTime() >= inicioMes).length;
  const concluidasMes = vagas.filter((v) => v.situacao === "Concluída" && v.fechamento !== null && v.fechamento >= inicioMes).length;

  return (
    <>
      <header className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-[4.5vh] leading-tight font-semibold">
            Vagas em aberto
            {periodo && <span className="ml-[1.5vh] align-middle text-[2.6vh] font-medium text-[#f5a524]">{periodo}</span>}
          </h1>
          <p className="text-[2vh] text-white/60">
            <Atualizar />
          </p>
        </div>
        <p className="text-right text-[1.8vh] text-white/50">
          {atualizadoEm
            ? `Dados do sistema de ${atualizadoEm.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" })}`
            : "Sem dados ainda"}
        </p>
      </header>

      <div className="grid grid-cols-4 gap-[2vh]">
        <Numero titulo="Vagas abertas" valor={andamento.length} cor="#4c9be8" nota={outras ? `+ ${num(outras)} em outra situação` : "Status Envia Seleção"} />
        <Numero titulo="Posições abertas" valor={pendentes.length} cor="#f5a524" nota="Pessoas que ainda faltam contratar" />
        <Numero titulo="Arrastadas" valor={arrastadas} cor="#a27cf0" nota={`Das vagas abertas, vindas de antes de ${nomeMes}`} />
        {periodo ? (
          <Numero titulo="No período" valor={vagas.length} cor="#2fc192" nota={`vagas abertas · ${num(vagas.filter((v) => v.situacao === "Concluída").length)} já concluídas`} />
        ) : (
          <Numero titulo={`Em ${nomeMes}`} valor={abertasMes} cor="#2fc192" nota={`vagas novas · ${num(concluidasMes)} concluídas`} />
        )}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-[2vh]">
        <Painel titulo="Posições abertas por cliente" rodape={resto(pendentes)}>
          <Barras dados={porCliente(pendentes)} cor="#f5a524" />
        </Painel>
        <Painel titulo="Vagas abertas há quanto tempo">
          <Barras dados={porIdade(andamento, hoje)} cor="#4c9be8" />
        </Painel>
      </div>
    </>
  );
}

function Numero({ titulo, valor, cor, nota }: { titulo: string; valor: number; cor: string; nota: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/[0.06] px-[2.5vh] py-[2vh]">
      <span className="absolute inset-y-0 left-0 w-[0.8vh]" style={{ background: cor }} />
      <p className="text-[2.2vh] font-medium tracking-wide text-white/70 uppercase">{titulo}</p>
      <p className="text-[11vh] leading-none font-semibold tabular-nums">{num(valor)}</p>
      <p className="mt-[1vh] text-[1.9vh] text-white/55">{nota}</p>
    </div>
  );
}

function Painel({ titulo, rodape, children }: { titulo: string; rodape?: string; children: React.ReactNode }) {
  return (
    <section className="flex min-h-0 flex-col rounded-2xl bg-white/[0.06] p-[2.5vh]">
      <h2 className="mb-[1.5vh] text-[2.4vh] font-medium text-white/80">{titulo}</h2>
      {children}
      {rodape && <p className="mt-[1vh] text-[1.8vh] text-white/50">{rodape}</p>}
    </section>
  );
}

type Item = { nome: string; valor: number };

// Barras simples em HTML: na TV não tem mouse, então não precisa de gráfico interativo
function Barras({ dados, cor }: { dados: Item[]; cor: string }) {
  if (!dados.length) return <p className="text-[2vh] text-white/40">Nada em aberto.</p>;
  const max = Math.max(...dados.map((d) => d.valor));
  return (
    <ul className="flex flex-1 flex-col justify-around gap-[0.6vh]">
      {dados.map((d) => (
        <li key={d.nome} className="grid grid-cols-[38%_1fr] items-center gap-[1.5vh] text-[2vh]">
          <span className="truncate text-white/80" title={d.nome}>{d.nome}</span>
          <span className="flex items-center gap-[1vh]">
            <span className="h-[2.4vh] rounded-r-md" style={{ width: `${Math.max(1, (d.valor / max) * 85)}%`, background: cor }} />
            <span className="font-semibold tabular-nums">{num(d.valor)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

const LIMITE = 8;

function contarPorCliente(pendentes: Linha[]): Item[] {
  const n = new Map<string, number>();
  for (const l of pendentes) n.set(l.local, (n.get(l.local) ?? 0) + 1);
  return [...n.entries()].map(([nome, valor]) => ({ nome, valor })).sort((a, b) => b.valor - a.valor);
}

const porCliente = (pendentes: Linha[]) => contarPorCliente(pendentes).slice(0, LIMITE);

// Os demais clientes viram uma linha de texto (uma barra "Outros" engoliria as outras)
function resto(pendentes: Linha[]) {
  const r = contarPorCliente(pendentes).slice(LIMITE);
  if (!r.length) return undefined;
  return `+ ${num(r.reduce((s, x) => s + x.valor, 0))} posições em outros ${num(r.length)} clientes`;
}

const FAIXAS: [string, number][] = [
  ["Até 7 dias", 7],
  ["8 a 15 dias", 15],
  ["16 a 30 dias", 30],
  ["31 a 60 dias", 60],
  ["61 a 90 dias", 90],
  ["Mais de 90 dias", Infinity],
];

function porIdade(vagas: { data: Date }[], hoje: number): Item[] {
  const n = FAIXAS.map(([nome]) => ({ nome, valor: 0 }));
  for (const v of vagas) {
    const dias = Math.round((hoje - v.data.getTime()) / DIA);
    n[FAIXAS.findIndex(([, ate]) => dias <= ate)].valor++;
  }
  return n;
}
