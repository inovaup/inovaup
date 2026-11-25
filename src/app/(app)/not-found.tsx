import Link from "next/link";
import { Button } from "@/components/ui/button";

// notFound() dentro da área logada, com o menu (E0, achado C2). O texto não diz
// se o endereço existe para outra pessoa (ex.: a avaliação de outro avaliador).
export default function PaginaNaoEncontrada() {
  return (
    <div className="flex flex-col items-start gap-3">
      <h1 className="text-2xl font-bold">Página não encontrada</h1>
      <p className="text-muted-foreground">
        Este endereço não existe ou você não tem acesso a ele.
      </p>
      <Button asChild variant="outline" size="sm">
        <Link href="/inicio">Voltar ao início</Link>
      </Button>
    </div>
  );
}
