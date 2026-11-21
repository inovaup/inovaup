import { LogoutButton } from "@/components/logout-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { getCurrentUser } from "@/lib/auth/sessao";
import { itensDoMenu } from "@/lib/navegacao";
import Link from "next/link";
import { redirect } from "next/navigation";

// Área autenticada. Este layout só monta o menu: a proteção de verdade é o
// requireRole() de cada página (layouts não rodam de novo a cada navegação).
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/auth/login");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-b-foreground/10">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 p-3 px-5 text-sm">
          <nav className="flex items-center gap-5">
            <Link href="/inicio" className="font-semibold">
              InovaUp
            </Link>
            {itensDoMenu(usuario.papel).map((item) => (
              <Link key={item.href} href={item.href} className="hover:underline">
                {item.rotulo}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <span>{usuario.nome}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto p-5">{children}</main>
      <footer className="flex justify-center border-t text-xs py-6">
        <ThemeSwitcher />
      </footer>
    </div>
  );
}
