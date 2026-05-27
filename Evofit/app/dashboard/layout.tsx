"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard",          label: "Início",  icon: "🏠" },
  { href: "/dashboard/treino",   label: "Treino",  icon: "🏋️" },
  { href: "/dashboard/dieta",    label: "Dieta",   icon: "🥗" },
  { href: "/dashboard/tarefas",  label: "Tarefas", icon: "⚡" },
  { href: "/dashboard/foto",     label: "Foto",    icon: "📸" },
  { href: "/dashboard/perfil",   label: "Perfil",  icon: "👤" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
      <div className="flex-1 pb-20">{children}</div>

      {/* Bottom Navigation — 6 abas */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-[#E5E7EB] z-50">
        <div className="max-w-lg mx-auto flex">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative transition-colors ${
                  active ? "text-[#7C3AED]" : "text-[#9CA3AF]"
                }`}
              >
                <span className="text-[18px] leading-none">{item.icon}</span>
                <span className={`text-[9px] font-semibold ${active ? "text-[#7C3AED]" : "text-[#9CA3AF]"}`}>
                  {item.label}
                </span>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#7C3AED] rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
