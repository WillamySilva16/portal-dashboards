import { Suspense } from "react";
import { signOut } from "@/auth";
import { getCurrentUser, getMeusDashboards } from "@/lib/dal";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold text-zinc-900">Portal de Dashboards</h1>
        <Suspense fallback={<span className="text-sm text-zinc-400">…</span>}>
          <Usuario />
        </Suspense>
      </header>

      <main className="mx-auto w-full max-w-5xl p-6">
        <Suspense fallback={<p className="text-sm text-zinc-500">Carregando dashboards…</p>}>
          <Catalogo />
        </Suspense>
      </main>
    </div>
  );
}

async function Usuario() {
  const user = await getCurrentUser();
  return (
    <div className="flex items-center gap-4 text-sm">
      <span className="text-zinc-600">
        {user.name ?? user.email}
        {user.role === "ADMIN" && (
          <span className="ml-2 rounded bg-zinc-900 px-1.5 py-0.5 text-xs text-white">admin</span>
        )}
      </span>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button type="submit" className="text-zinc-500 underline hover:text-zinc-900">
          Sair
        </button>
      </form>
    </div>
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
        <li key={d.id} className="rounded-xl bg-white p-5 ring-1 ring-zinc-200">
          {d.category && <p className="text-xs uppercase tracking-wide text-zinc-400">{d.category}</p>}
          <h2 className="mt-1 font-medium text-zinc-900">{d.title}</h2>
          {d.description && <p className="mt-1 text-sm text-zinc-500">{d.description}</p>}
        </li>
      ))}
    </ul>
  );
}
