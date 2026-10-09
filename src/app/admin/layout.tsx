import { Cabecalho } from "@/components/cabecalho";
import { NavAdmin } from "./nav";

export const metadata = { title: "Admin | Portal de Dashboards" };

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex flex-1 flex-col">
      <Cabecalho />
      <main className="mx-auto w-full max-w-[1600px] space-y-5 px-6 py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Administração</h1>
          <p className="mt-0.5 text-sm text-zinc-500">Quem entra no portal, o que cada um vê e o histórico de acessos.</p>
        </div>
        <NavAdmin />
        {children}
      </main>
    </div>
  );
}
