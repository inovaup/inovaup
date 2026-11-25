"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

// Erro inesperado numa página da área logada (E0, achado C2). Não mostra a
// mensagem do erro: nada interno deve chegar à tela.
export default function ErroDaPagina({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3">
      <h1 className="text-2xl font-bold">Algo deu errado</h1>
      <p className="text-muted-foreground">
        Não foi possível carregar esta página. Tente de novo em instantes.
      </p>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => retry()}>
          Tentar de novo
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/inicio">Voltar ao início</Link>
        </Button>
      </div>
    </div>
  );
}
