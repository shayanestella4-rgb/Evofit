import ConsultoriaForm from "./ConsultoriaForm";
import { CONSULTORIA_TIPOS } from "@/lib/consultoria-tipos";

export default function ConsultoriaPage() {
  return <ConsultoriaForm tipoConfig={CONSULTORIA_TIPOS.comum} />;
}
