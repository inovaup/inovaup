import Link from "next/link";
import { Button } from "./ui/button";
import { LogoutButton } from "./logout-button";
import { getCurrentUser } from "@/lib/auth/sessao";

export async function AuthButton() {
  const usuario = await getCurrentUser();

  return usuario ? (
    <div className="flex items-center gap-4">
      <span>{usuario.nome}</span>
      <LogoutButton />
    </div>
  ) : (
    <Button asChild size="sm" variant="outline">
      <Link href="/auth/login">Entrar</Link>
    </Button>
  );
}
