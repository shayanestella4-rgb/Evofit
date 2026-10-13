import { notFound } from "next/navigation";
import ConsultoriaForm from "../ConsultoriaForm";
import { CONSULTORIA_TIPOS } from "@/lib/consultoria-tipos";

export default async function ConsultoriaTipoPage({ params }: { params: Promise<{ tipo: string }> }) {
  const { tipo } = await params;
  const tipoConfig = CONSULTORIA_TIPOS[tipo];
  if (!tipoConfig) notFound();
  return <ConsultoriaForm tipoConfig={tipoConfig} />;
}
