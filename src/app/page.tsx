import Link from "next/link";
import { Suspense } from "react";
import { Cabecalho } from "@/components/cabecalho";
import { getMeusDashboards } from "@/lib/dal";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <Cabecalho />
      <main className="mx-auto w-full max-w-[1600px] px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Seus dashboards</h1>
        <p className="mt-1 mb-6 text-sm text-zinc-500">Os painéis liberados pra você. Clique num deles pra abrir.</p>
        <Suspense>
          <AvisoNegado searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<p className="text-sm text-zinc-500">Carregando dashboards…</p>}>
          <Catalogo />
        </Suspense>
      </main>
    </div>
  );
}

async function AvisoNegado({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const { negado } = await searchParams;
  if (!negado) return null;
  return (
    <p className="mb-6 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-200">
      Você não tem acesso a esse dashboard. Peça a liberação ao administrador.
    </p>
  );
}

async function Catalogo() {
  const dashboards = await getMeusDashboards();

  if (dashboards.length === 0) {
    return (
      <p className="cartao p-8 text-center text-sm text-zinc-500">
        Nenhum dashboard liberado pra você ainda.
      </p>
    );
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {dashboards.map((d) => (
        <li key={d.id}>
          <Link
            href={`/d/${d.slug}`}
            className="cartao group flex h-full flex-col p-6 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-zinc-300"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-[#2a78d6]/10 text-[#2a78d6]">
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden>
                  <path d="M5 20V12M12 20V5M19 20v-9" />
                </svg>
              </span>
              {d.category && (
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-zinc-600 uppercase">
                  {d.category}
                </span>
              )}
            </div>
            <h2 className="mt-4 text-base font-semibold text-zinc-900">{d.title}</h2>
            {d.description && <p className="mt-1 flex-1 text-sm leading-relaxed text-zinc-500">{d.description}</p>}
            <span className="mt-5 text-sm font-medium text-[#2a78d6]">
              Abrir dashboard <span className="inline-block transition group-hover:translate-x-0.5">→</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
