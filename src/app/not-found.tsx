import Link from "next/link";
import { Button } from "@/components/ui/button";

// Endereços que não existem no app (E0, achado C2): fica fora da área logada,
// então leva para a página inicial, que manda quem está logado para o Início.
export default function NaoEncontrada() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-5 text-center">
      <h1 className="text-2xl font-bold">Página não encontrada</h1>
      <p className="text-muted-foreground max-w-md">Este endereço não existe no InovaUp.</p>
      <Button asChild variant="outline" size="sm">
        <Link href="/">Ir para a página inicial</Link>
      </Button>
    </main>
  );
}
