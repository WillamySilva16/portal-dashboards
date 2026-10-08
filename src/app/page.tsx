import Link from "next/link";
import { Suspense } from "react";
import { Cabecalho } from "@/components/cabecalho";
import { getMeusDashboards } from "@/lib/dal";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <Cabecalho />
      <main className="mx-auto w-full max-w-5xl p-6">
        <h1 className="mb-4 text-xl font-semibold text-zinc-900">Dashboards</h1>
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
    <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
      Você não tem acesso a esse dashboard. Peça a liberação ao administrador.
    </p>
  );
}

async function Catalogo() {
  const dashboards = await getMeusDashboards();

  if (dashboards.length === 0) {
    return (
      <p className="rounded-xl bg-white p-6 text-sm text-zinc-500 ring-1 ring-zinc-200">
        Nenhum dashboard liberado pra você ainda.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {dashboards.map((d) => (
        <li key={d.id}>
          <Link
            href={`/d/${d.slug}`}
            className="block h-full rounded-xl bg-white p-5 ring-1 ring-zinc-200 transition hover:shadow-md hover:ring-zinc-300"
          >
            {d.category && <p className="text-xs tracking-wide text-zinc-400 uppercase">{d.category}</p>}
            <h2 className="mt-1 font-medium text-zinc-900">{d.title}</h2>
            {d.description && <p className="mt-1 text-sm text-zinc-500">{d.description}</p>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
