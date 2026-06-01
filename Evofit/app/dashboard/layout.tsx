import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardNav from "./components/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      <div className="flex-1 pb-20">{children}</div>
      <DashboardNav />
    </div>
  );
}
