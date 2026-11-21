import { EnvVarWarning } from "@/components/env-var-warning";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/sessao";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  if (hasEnvVars && (await getCurrentUser())) redirect("/inicio");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-5">
      <h1 className="text-3xl font-bold">InovaUp</h1>
      <p className="text-muted-foreground">
        Gestão de pessoas da Empresa Júnior ADM UFBA.
      </p>
      {hasEnvVars ? (
        <Button asChild>
          <Link href="/auth/login">Entrar</Link>
        </Button>
      ) : (
        <EnvVarWarning />
      )}
    </main>
  );
}
