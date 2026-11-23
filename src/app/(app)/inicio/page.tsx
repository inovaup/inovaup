import Link from "next/link";
import { requireRole } from "@/lib/auth/sessao";

const NOME_DO_PAPEL = { colaborador: "Colaborador", lider: "Líder", gp: "Gestão de Pessoas" } as const;

export default async function InicioPage() {
  const usuario = await requireRole("colaborador", "lider", "gp");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Olá, {usuario.nome}</h1>
      <p className="text-muted-foreground">
        Perfil: {NOME_DO_PAPEL[usuario.papel]}
      </p>
      <Link href="/avaliacoes" className="self-start rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
        Ver minhas avaliações
      </Link>
    </div>
  );
}
