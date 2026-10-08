import { Suspense } from "react";
import { signIn } from "@/auth";

export const metadata = { title: "Entrar | Portal de Dashboards" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 p-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
        <h1 className="text-xl font-semibold text-zinc-900">Portal de Dashboards</h1>
        <p className="mt-1 text-sm text-zinc-500">Entre com seu e-mail corporativo.</p>

        <Suspense>
          <Erro searchParams={searchParams} />
        </Suspense>

        <form
          className="mt-6"
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Entrar com Google
          </button>
        </form>
      </div>
    </main>
  );
}

async function Erro({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const { error } = await searchParams;
  if (!error) return null;
  const msg =
    error === "AccessDenied"
      ? "Seu e-mail não está liberado para o portal. Peça acesso ao administrador."
      : "Não foi possível entrar. Tente de novo.";
  return <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{msg}</p>;
}
