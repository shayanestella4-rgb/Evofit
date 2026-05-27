import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-[#7C3AED] tracking-tight">Evofit</span>
          <Link
            href="/auth/login"
            className="bg-[#7C3AED] text-white text-sm font-semibold px-5 py-2.5 rounded-[0.75rem] hover:bg-[#6D28D9] transition-colors"
          >
            Começar grátis
          </Link>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="animate-fade-in">
            <span className="inline-block bg-[#F5F3FF] text-[#7C3AED] text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
              Seu personal trainer digital
            </span>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-[#111827] leading-tight mb-6">
              Transforme seu corpo<br />
              <span className="text-[#7C3AED]">sem complicação</span>
            </h1>
            <p className="text-lg text-[#6B7280] max-w-xl mx-auto mb-10 leading-relaxed">
              Treinos diários personalizados, plano alimentar e tarefas motivacionais —
              tudo em um só lugar. Feito para quem nunca sabe por onde começar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth/login"
                className="bg-[#7C3AED] text-white font-bold px-8 py-4 rounded-[0.75rem] hover:bg-[#6D28D9] transition-colors text-base shadow-lg shadow-violet-200"
              >
                Começar agora — é grátis
              </Link>
              <Link
                href="#como-funciona"
                className="border border-[#E5E7EB] text-[#374151] font-semibold px-8 py-4 rounded-[0.75rem] hover:bg-[#F9FAFB] transition-colors text-base"
              >
                Como funciona
              </Link>
            </div>
          </div>

          {/* App Preview Card */}
          <div className="mt-16 animate-slide-up animate-delay-200">
            <div className="bg-[#F5F3FF] rounded-[1.5rem] p-6 max-w-xs mx-auto shadow-2xl shadow-violet-100 border border-[#EDE9FE]">
              <div className="bg-white rounded-xl p-4 mb-3 text-left">
                <p className="text-xs text-[#6B7280] mb-1">Bom dia, Ana 👋</p>
                <p className="text-sm font-bold text-[#111827]">Treino de hoje</p>
                <p className="text-xs text-[#7C3AED] font-semibold mt-1">Pernas e Glúteos · 45 min</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-xl p-3 text-left">
                  <p className="text-xs text-[#6B7280]">Calorias</p>
                  <p className="text-sm font-bold text-[#111827]">1.850 kcal</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-left">
                  <p className="text-xs text-[#6B7280]">Tarefa</p>
                  <p className="text-sm font-bold text-[#10B981]">✓ Concluída</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="como-funciona" className="bg-[#F9FAFB] py-20">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl font-extrabold text-center text-[#111827] mb-4">
              Tudo que você precisa, em um só lugar
            </h2>
            <p className="text-center text-[#6B7280] mb-12 max-w-md mx-auto">
              Sem precisar pesquisar na internet, sem confusão. O Evofit organiza tudo por você.
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  icon: "🏋️",
                  title: "Treino diário",
                  desc: "Cada dia um treino diferente, adaptado ao seu nível e objetivo. Marque como concluído e acompanhe seu progresso.",
                },
                {
                  icon: "🥗",
                  title: "Plano alimentar",
                  desc: "Dieta montada com base na sua anamnese. Café, almoço, jantar e lanches — tudo calculado para você.",
                },
                {
                  icon: "⚡",
                  title: "Motivação diária",
                  desc: "Mini tarefas motivacionais todos os dias. Pequenos hábitos que geram grandes resultados.",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="bg-white rounded-[1rem] p-6 border border-[#E5E7EB] hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-[#F5F3FF] rounded-xl flex items-center justify-center text-2xl mb-4">
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-[#111827] mb-2">{f.title}</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-20 max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-center text-[#111827] mb-12">
            Começa em 3 passos simples
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Crie sua conta", desc: "Login com Google ou Apple. Rápido e seguro." },
              { step: "02", title: "Preencha a anamnese", desc: "Um questionário rápido sobre seu corpo, rotina e objetivos." },
              { step: "03", title: "Receba seu plano", desc: "Treino, dieta e tarefas personalizados para você no mesmo dia." },
            ].map((s) => (
              <div key={s.step} className="flex gap-4 items-start">
                <span className="text-4xl font-black text-[#EDE9FE] leading-none shrink-0">{s.step}</span>
                <div>
                  <h3 className="font-bold text-[#111827] mb-1">{s.title}</h3>
                  <p className="text-sm text-[#6B7280]">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Final */}
        <section className="bg-[#7C3AED] py-20">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-extrabold text-white mb-4">Pronto para começar?</h2>
            <p className="text-violet-200 mb-8">
              Junte-se a quem já parou de procurar e começou a treinar.
            </p>
            <Link
              href="/auth/login"
              className="bg-white text-[#7C3AED] font-bold px-8 py-4 rounded-[0.75rem] hover:bg-[#F5F3FF] transition-colors inline-block"
            >
              Criar minha conta grátis
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-[#111827] text-[#9CA3AF] text-sm py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-white font-bold text-lg">Evofit</span>
          <p>© 2025 Evofit. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
