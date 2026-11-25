import { LogoutButton } from "@/components/logout-button";
import { MenuPrincipal } from "@/components/menu-principal";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { PAPEIS } from "@/contracts/core";
import { requireRole } from "@/lib/auth/sessao";
import { itensDoMenu } from "@/lib/navegacao";
import Link from "next/link";

// Área autenticada. Este layout monta o menu e segue a mesma regra das páginas:
// sem sessão vai para o login; logado sem perfil vai para /acesso-negado (fora
// desta área, então não há vai e volta). A proteção de verdade continua sendo o
// requireRole() de cada página (layouts não rodam de novo a cada navegação).
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await requireRole(...PAPEIS);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-b-foreground/10">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 p-3 px-5 text-sm">
          <nav className="flex items-center gap-5">
            <Link href="/inicio" className="font-semibold">
              InovaUp
            </Link>
            <MenuPrincipal
              itens={itensDoMenu(usuario.papel).map(({ rotulo, href }) => ({ rotulo, href }))}
            />
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
