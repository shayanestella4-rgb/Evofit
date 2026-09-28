import type { Metadata } from "next";
import QuizClient from "./QuizClient";

export const metadata: Metadata = {
  title: "Teste de condicionamento físico e hábitos grátis | Evofit",
  description:
    "Responda 24 perguntas rápidas e receba sua nota de 0 a 100 em sono, alimentação, água, rotina, disciplina, treino e resistência. Grátis.",
  openGraph: {
    title: "Teste de condicionamento físico e hábitos grátis | Evofit",
    description:
      "Responda 24 perguntas rápidas e receba sua nota de 0 a 100 em sono, alimentação, água, rotina, disciplina, treino e resistência. Grátis.",
    type: "website",
  },
};

export default function QuizPage() {
  return <QuizClient />;
}
