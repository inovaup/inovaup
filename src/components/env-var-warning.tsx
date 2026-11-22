import { Badge } from "./ui/badge";

export function EnvVarWarning() {
  return (
    <Badge variant="outline" className="font-normal">
      Configure o Supabase no .env.local (veja o .env.example)
    </Badge>
  );
}
