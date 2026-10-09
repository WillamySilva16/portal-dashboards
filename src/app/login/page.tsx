import { Suspense } from "react";
import { signIn } from "@/auth";
import { Logo } from "@/components/cabecalho";

export const metadata = { title: "Entrar | Portal de Dashboards" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="grid flex-1 lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-marca p-12 text-white lg:flex">
        <div className="pointer-events-none absolute -top-40 -right-40 size-[520px] rounded-full bg-[#2a78d6]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 -left-24 size-[420px] rounded-full bg-[#1baf7a]/15 blur-3xl" />
        <p className="relative flex items-center gap-2.5 font-semibold">
          <Logo className="size-9" />
          Portal de Dashboards
        </p>
        <div className="relative max-w-md">
          <h2 className="text-4xl leading-tight font-semibold tracking-tight">Os indicadores da empresa num só lugar.</h2>
          <p className="mt-4 text-white/70">
            Painéis atualizados direto do sistema, com acesso só pra quem foi liberado.
          </p>
        </div>
        <p className="relative text-xs text-white/40">Acesso restrito ao e-mail corporativo</p>
      </section>

      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <p className="mb-8 flex items-center gap-2.5 font-semibold text-zinc-900 lg:hidden">
            <Logo className="size-9 bg-marca text-white" />
            Portal de Dashboards
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Entrar</h1>
          <p className="mt-1 text-sm text-zinc-500">Use sua conta Google do e-mail corporativo.</p>

          <Suspense>
            <Erro searchParams={searchParams} />
          </Suspense>

          <form
            className="mt-8"
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-zinc-800 shadow-sm ring-1 ring-zinc-300 transition hover:bg-zinc-50 hover:shadow"
            >
              <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
              </svg>
              Entrar com Google
            </button>
          </form>
        </div>
      </section>
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
  return <p className="mt-6 rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">{msg}</p>;
}
