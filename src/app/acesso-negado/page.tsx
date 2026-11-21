import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AcessoNegadoPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-5 text-center">
      <h1 className="text-2xl font-bold">Acesso negado</h1>
      <p className="text-muted-foreground max-w-md">
        Você não tem permissão para ver esta página, ou o seu perfil ainda não
        foi configurado pela Gestão de Pessoas.
      </p>
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/inicio">Voltar ao início</Link>
        </Button>
        <LogoutButton />
      </div>
    </main>
  );
}
