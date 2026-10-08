import { Cabecalho } from "@/components/cabecalho";
import { NavAdmin } from "./nav";

export const metadata = { title: "Admin | Portal de Dashboards" };

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex flex-1 flex-col">
      <Cabecalho />
      <main className="mx-auto w-full max-w-6xl space-y-4 p-6">
        <h1 className="text-xl font-semibold text-zinc-900">Administração</h1>
        <NavAdmin />
        {children}
      </main>
    </div>
  );
}
