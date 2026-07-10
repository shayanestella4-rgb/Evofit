"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard",         label: "Início",  icon: "🏠" },
  { href: "/dashboard/treino",  label: "Treino",  icon: "🏋️" },
  { href: "/dashboard/dieta",   label: "Dieta",   icon: "🥗" },
  { href: "/dashboard/tarefas", label: "Tarefas", icon: "⚡" },
  { href: "/dashboard/foto",    label: "Foto",    icon: "📸" },
  { href: "/dashboard/perfil",  label: "Perfil",  icon: "👤" },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-[#1A1A1A] border-t border-[#2D2D2D] z-50">
      <div className="max-w-lg mx-auto flex">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative transition-colors ${
                active ? "text-[#C084FC]" : "text-[#CBD5E0]"
              }`}
            >
              <span className="text-[18px] leading-none">{item.icon}</span>
              <span className={`text-[9px] font-semibold ${active ? "text-[#C084FC]" : "text-[#CBD5E0]"}`}>
                {item.label}
              </span>
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#A855F7] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
