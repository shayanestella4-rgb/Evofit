import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Evofit — Seu Personal Trainer Digital",
  description:
    "Treinos personalizados, dieta e motivação diária em um só lugar. Comece hoje.",
  openGraph: {
    title: "Evofit",
    description: "Seu personal trainer digital. Acessível, motivador e eficiente.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={montserrat.variable}>
      <body className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
