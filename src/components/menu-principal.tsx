"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { itemAtivo, type ItemMenu } from "@/lib/navegacao";
import { cn } from "@/lib/utils";

// Menu da área logada com a página atual marcada (E0, achado C3). Só mostra e
// destaca links; quem protege cada página é o requireRole() dela.
export function MenuPrincipal({ itens }: { itens: Pick<ItemMenu, "rotulo" | "href">[] }) {
  const pathname = usePathname();

  return (
    <>
      {itens.map((item) => {
        const ativo = itemAtivo(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={ativo ? "page" : undefined}
            className={cn(
              "underline-offset-4 hover:underline",
              ativo ? "font-medium text-foreground underline" : "text-muted-foreground",
            )}
          >
            {item.rotulo}
          </Link>
        );
      })}
    </>
  );
}
