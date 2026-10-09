// Dashboard de Vagas: Vagas arrastadas (abertas em meses anteriores e ainda não fechadas)
import { Suspense } from "react";
import { Cabecalho } from "@/components/cabecalho";
import { Filtros } from "@/components/filtros";
import { GraficoBarras, GraficoMensal } from "@/components/graficos";
import { CorpoFiltro, FiltroCruzado } from "@/components/filtro-cruzado";
import { Kpi, Secao } from "@/components/kpi";
import { abrirDashboard } from "@/lib/dal";
import {
  arrastadasEm,
  arrastadasPorAbertura,
  arrastadasPorMes,
  filtrar,
  filtrosTexto,
  getVagas,
  hojeUTC,
  lerFiltros,
  linhasPorVaga,
  medidasArrastadas,
  mesReferencia,
  MESES,
  opcoes,
  ordenar,
  vagasPor,
  type Filtros as FiltrosVagas,
  type Linha,
} from "@/lib/vagas";
import { Abas, BotaoBaixar, CabecalhoOrdenavel, dataBR, FiltrosAtivos, PeriodoRapido, lerOrdem, lista, num, opcoesMes, qs, Tag } from "../comum";
import { COLUNAS_ARRASTADAS, diasEmAberto } from "../colunas";

export const metadata = { title: "Vagas arrastadas | Portal de Dashboards" };

export default function Page({ searchParams }: PageProps<"/d/vagas/arrastadas">) {
  return (
    <div className="flex flex-1 flex-col">
      <Cabecalho />
      <main className="mx-auto w-full max-w-7xl space-y-4 p-6">
        <Suspense fallback={<p className="text-sm text-zinc-500">Carregando…</p>}>
          <Conteudo searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

async function Conteudo({ searchParams }: { searchParams: PageProps<"/d/vagas/arrastadas">["searchParams"] }) {
  const { dashboard } = await abrirDashboard("vagas");
  const sp = await searchParams;
  const f = lerFiltros(sp);
  const ordem = lerOrdem(sp);
  const naUrl = { ...filtrosTexto(f), ordem };
  const { linhas } = await getVagas();

  // Aqui ano/mês não filtram a abertura: escolhem o mês de referência
  const ref = mesReferencia(f);
  const arr = arrastadasEm(filtrar(linhas, f, true), ref.inicio);
  const m = medidasArrastadas(arr);
  const nomeRef = `${MESES[ref.mes - 1]} de ${ref.ano}`;

  return (
    <>
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">{dashboard.title}</h1>
        <p className="text-sm text-zinc-500">
          Vagas abertas antes de 1º de {nomeRef} e que ainda não estavam fechadas nesse dia
        </p>
      </div>

      <Abas atual="arrastadas" filtros={f} />

      <FiltroCruzado base="/d/vagas/arrastadas" filtros={naUrl}>
        <Filtros
          key={qs(f, ordem)}
          todos={naUrl}
          action="/d/vagas/arrastadas"
          campos={[
            { tipo: "select", nome: "ano", rotulo: "Ano de referência", valor: f.ano?.toString(), opcoes: lista(opcoes(linhas, "ano")) },
            { tipo: "select", nome: "mes", rotulo: "Mês de referência", valor: f.mes?.toString(), opcoes: opcoesMes },
            { tipo: "data", nome: "de", rotulo: "Aberta de", valor: f.de },
            { tipo: "data", nome: "ate", rotulo: "Aberta até", valor: f.ate },
            { tipo: "select", nome: "base", rotulo: "Base", valor: f.base, opcoes: lista(opcoes(linhas, "base")) },
            { tipo: "select", nome: "local", rotulo: "Cliente", valor: f.local, opcoes: lista(opcoes(linhas, "local")) },
            { tipo: "texto", nome: "vaga", rotulo: "Vaga", valor: f.vaga, placeholder: "Nº da vaga" },
          ]}
        />
        <PeriodoRapido base="/d/vagas/arrastadas" filtros={f} />
        <FiltrosAtivos base="/d/vagas/arrastadas" filtros={f} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi titulo="Vagas arrastadas" valor={num(m.arrastadas)} cor="#2F80ED" variacao={`Pra ${nomeRef}`} />
          <Kpi
            titulo="Ainda abertas hoje"
            valor={num(m.aindaAbertas)}
            cor="#F39C12"
            variacao={m.arrastadas ? `${Math.round((m.aindaAbertas / m.arrastadas) * 100)}% das arrastadas` : undefined}
          />
          <Kpi
            titulo="Concluídas depois"
            valor={num(m.concluidasDepois)}
            cor="#16A085"
            variacao={m.arrastadas ? `${Math.round((m.concluidasDepois / m.arrastadas) * 100)}% das arrastadas` : undefined}
          />
          <Kpi
            titulo="Dias em aberto (média)"
            valor={m.idadeMedia === null ? "—" : m.idadeMedia.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
            cor="#8E5DE7"
            variacao="Das que ainda estão abertas"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Secao titulo="Vagas arrastadas mês a mês">
            <GraficoMensal
              dados={arrastadasPorMes(filtrar(linhas, f, true), ref.inicio)}
              ano={ref.ano}
              mes={ref.mes}
              series={[["Arrastadas", "var(--serie-1)"]]}
            />
          </Secao>
          <Secao titulo="Arrastadas por mês de abertura">
            <GraficoBarras dados={arrastadasPorAbertura(arr)} serie="Vagas arrastadas" />
          </Secao>
          <Secao titulo="Arrastadas por categoria">
            <GraficoBarras
              dados={vagasPor(arrastadasEm(filtrar(linhas, { ...f, categoria: undefined }, true), ref.inicio), "categoria", 10)}
              serie="Vagas arrastadas"
              campo="categoria"
              selecionado={f.categoria}
            />
          </Secao>
          <Secao titulo="Arrastadas por cliente (top 10)">
            <GraficoBarras
              dados={vagasPor(arrastadasEm(filtrar(linhas, { ...f, local: undefined }, true), ref.inicio), "local", 10, false)}
              serie="Vagas arrastadas"
              campo="local"
              selecionado={f.local}
            />
          </Secao>
        </div>

        <Secao
          titulo="Vagas arrastadas"
          acao={<BotaoBaixar href={"/d/vagas/exportar" + qs(f, ordem) + (qs(f, ordem) ? "&" : "?") + "tipo=arrastadas"} />}
        >
          <TabelaArrastadas linhas={arr} filtros={f} ordem={ordem} />
        </Secao>
      </FiltroCruzado>
    </>
  );
}

const LIMITE = 300;

function TabelaArrastadas({ linhas, filtros, ordem }: { linhas: Linha[]; filtros: FiltrosVagas; ordem?: string }) {
  const hoje = hojeUTC();
  // Padrão: as mais antigas (mais tempo em aberto) primeiro
  const vagas = ordenar(linhasPorVaga(linhas).reverse(), ordem, COLUNAS_ARRASTADAS);
  return (
    <div className="max-h-[520px] overflow-auto">
      <table className="w-full text-left text-sm">
        <CabecalhoOrdenavel colunas={COLUNAS_ARRASTADAS} base="/d/vagas/arrastadas" filtros={filtros} ordem={ordem} />
        <CorpoFiltro>
          {vagas.slice(0, LIMITE).map((v) => (
            <tr key={v.vaga} data-vaga={v.vaga}>
              <td className="px-3 py-1.5 text-right whitespace-nowrap tabular-nums">{dataBR(v.data)}</td>
              <td className="px-3 py-1.5 text-right tabular-nums">{v.vaga}</td>
              <td className="px-3 py-1.5">{v.supervisao ?? "—"}</td>
              <td className="px-3 py-1.5">{v.cargo}</td>
              <td className="px-3 py-1.5">{v.local}</td>
              <td className="px-3 py-1.5 whitespace-nowrap">{v.base ?? "—"}</td>
              <td className="px-3 py-1.5 text-right tabular-nums">{v.pendentes}</td>
              <td className="px-3 py-1.5 text-right tabular-nums">{diasEmAberto(v, hoje) ?? "—"}</td>
              <td className="px-3 py-1.5"><Tag texto={v.situacao} /></td>
            </tr>
          ))}
        </CorpoFiltro>
      </table>
      <p className="mt-2 text-xs text-zinc-400">
        {vagas.length > LIMITE
          ? `Mostrando ${LIMITE} de ${num(vagas.length)} vagas. A planilha baixada traz todas.`
          : `${num(vagas.length)} vagas.`}
      </p>
    </div>
  );
}
