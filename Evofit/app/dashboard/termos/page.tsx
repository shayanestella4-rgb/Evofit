import Link from "next/link";

// ─── Seções dos termos ────────────────────────────────────────────────────────

const SECTIONS = [
  {
    title: "1. Aceitação dos Termos",
    body: `Ao acessar ou utilizar o aplicativo Evofit ("App"), você concorda com estes Termos de Uso e com nossa Política de Privacidade. Se você não concordar com qualquer parte destes termos, não utilize o App.\n\nEstes termos constituem um acordo legal entre você ("Usuário") e a Evofit ("nós", "nosso"), empresa responsável pelo desenvolvimento e operação do App.`,
  },
  {
    title: "2. Descrição do Serviço",
    body: `O Evofit é um aplicativo de condicionamento físico que oferece:\n\n• Planos de treino personalizados baseados em avaliação inicial (anamnese)\n• Orientações nutricionais com base em cálculo calórico individual\n• Tarefas diárias de bem-estar e hábitos saudáveis\n• Registro fotográfico de evolução corporal\n• Acompanhamento de progresso e histórico de treinos\n\nO serviço é fornecido mediante assinatura mensal e destina-se a fins informativos e de apoio à atividade física.`,
  },
  {
    title: "3. Elegibilidade",
    body: `Para utilizar o Evofit você deve:\n\n• Ter 18 anos de idade ou mais (menores de 18 anos necessitam de autorização dos responsáveis legais)\n• Fornecer informações verídicas no cadastro e na anamnese\n• Não possuir condições médicas que contraindiquem a prática de exercícios físicos sem supervisão médica\n\nRecomendamos que usuários com histórico de doenças cardiovasculares, ortopédicas ou outras condições de saúde consultem um médico antes de iniciar qualquer programa de exercícios.`,
  },
  {
    title: "4. Responsabilidades do Usuário",
    body: `O usuário é responsável por:\n\n• Manter suas informações de anamnese atualizadas e verídicas\n• Interromper imediatamente o exercício em caso de dor, tontura ou desconforto\n• Não substituir as orientações do App por prescrição médica ou de profissional de saúde habilitado\n• Manter a confidencialidade de seu acesso ao App\n• Utilizar o App somente para fins pessoais e não comerciais\n• Não compartilhar sua conta com terceiros`,
  },
  {
    title: "5. Isenção de Responsabilidade Médica",
    body: `O Evofit fornece orientações gerais de condicionamento físico e nutrição com caráter exclusivamente informativo. O App NÃO substitui:\n\n• Consulta e acompanhamento com médico\n• Prescrição de exercícios por educador físico habilitado (CREF)\n• Orientação nutricional por nutricionista habilitado (CRN)\n\nNão nos responsabilizamos por lesões, danos à saúde ou qualquer consequência decorrente do uso das orientações do App sem supervisão profissional adequada.`,
  },
  {
    title: "6. Assinatura e Pagamento",
    body: `O acesso ao Evofit está condicionado ao pagamento de assinatura mensal conforme os valores vigentes no momento da contratação.\n\n• A assinatura é renovada automaticamente a cada 30 dias, salvo cancelamento pelo usuário\n• O cancelamento deve ser solicitado com ao menos 24 horas de antecedência antes da próxima renovação\n• Não há reembolso de períodos já pagos, exceto nos casos previstos pelo Código de Defesa do Consumidor (Lei nº 8.078/1990)\n• O direito de arrependimento de 7 dias (art. 49 do CDC) aplica-se a contratos celebrados fora do estabelecimento comercial`,
  },
  {
    title: "7. Dados Pessoais e Privacidade",
    body: `Coletamos e tratamos seus dados em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).\n\nDados coletados:\n• Informações de identificação (nome, idade, sexo)\n• Dados físicos (peso, altura, IMC)\n• Histórico de treinos e atividades no App\n• Fotos de evolução corporal armazenadas localmente no dispositivo\n\nSeus dados não são vendidos a terceiros. As fotos registradas ficam armazenadas exclusivamente no seu dispositivo (localStorage) e não são enviadas aos nossos servidores.\n\nPara exercer seus direitos de acesso, correção ou exclusão de dados, entre em contato pelo nosso suporte.`,
  },
  {
    title: "8. Propriedade Intelectual",
    body: `Todo o conteúdo do App — incluindo textos, imagens, logotipos, exercícios, planos alimentares, código-fonte e design — é propriedade da Evofit e está protegido pela legislação de direitos autorais (Lei nº 9.610/1998).\n\nÉ vedado ao usuário copiar, modificar, distribuir, vender ou criar trabalhos derivados do conteúdo do App sem autorização prévia e expressa por escrito.`,
  },
  {
    title: "9. Limitação de Responsabilidade",
    body: `Na máxima extensão permitida pela lei, a Evofit não será responsável por danos indiretos, incidentais, especiais ou consequentes, incluindo perda de dados, lucros cessantes ou interrupção de negócios.\n\nNossa responsabilidade total em relação a qualquer reclamação limitará-se ao valor pago pelo usuário nos últimos 3 meses de assinatura.`,
  },
  {
    title: "10. Modificações dos Termos",
    body: `Podemos atualizar estes Termos de Uso periodicamente. Quando isso ocorrer:\n\n• Notificaremos você pelo App com pelo menos 15 dias de antecedência\n• A data da última atualização será indicada no rodapé deste documento\n• O uso continuado do App após as mudanças implica aceitação dos novos termos\n\nRecomendamos revisar estes termos periodicamente.`,
  },
  {
    title: "11. Encerramento de Conta",
    body: `Você pode encerrar sua conta a qualquer momento acessando Perfil → Sair da conta. O cancelamento da assinatura pode ser solicitado pelo suporte via WhatsApp.\n\nReservamo-nos o direito de suspender ou encerrar contas que violem estes Termos de Uso, mediante aviso prévio sempre que possível.`,
  },
  {
    title: "12. Legislação e Foro",
    body: `Estes Termos são regidos pelas leis da República Federativa do Brasil. Para resolução de disputas, fica eleito o foro da comarca de São Paulo/SP, com renúncia a qualquer outro, por mais privilegiado que seja.\n\nAntes de qualquer medida judicial, as partes comprometem-se a buscar solução amigável pelo canal de suporte do App.`,
  },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function TermosPage() {
  const lastUpdate = "25 de maio de 2026";

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-8">

      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/perfil" className="inline-flex items-center gap-1 text-xs text-[#C084FC] font-semibold mb-4 hover:underline">
          ← Voltar ao perfil
        </Link>
        <h1 className="text-2xl font-extrabold text-[#F0F0F0]">Termos de Uso</h1>
        <p className="text-xs text-[#CBD5E0] mt-1">Última atualização: {lastUpdate}</p>
      </div>

      {/* Aviso de destaque */}
      <div className="bg-[#1E1035] rounded-[1rem] p-4 border border-[#2D1B4E] mb-6">
        <p className="text-xs font-bold text-[#C084FC] mb-1">⚠️ Leia com atenção</p>
        <p className="text-xs text-[#C084FC] leading-relaxed">
          O Evofit oferece orientações gerais de condicionamento físico e nutrição. O App não substitui
          avaliação médica, prescrição de educador físico (CREF) ou nutricionista (CRN). Consulte um
          profissional de saúde antes de iniciar qualquer programa de exercícios.
        </p>
      </div>

      {/* Seções */}
      <div className="space-y-4">
        {SECTIONS.map((section) => (
          <div
            key={section.title}
            className="bg-[#1A1A1A] rounded-[1rem] border border-[#2D2D2D] p-5"
          >
            <h2 className="text-sm font-bold text-[#F0F0F0] mb-3">{section.title}</h2>
            <div className="space-y-2">
              {section.body.split("\n").map((line, i) =>
                line.trim() === "" ? null : (
                  <p key={i} className={`text-xs leading-relaxed ${
                    line.startsWith("•") ? "text-[#C0C0C0] pl-2" : "text-[#B8B8B8]"
                  }`}>
                    {line}
                  </p>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé */}
      <div className="mt-6 text-center">
        <p className="text-[10px] text-[#CBD5E0]">
          Evofit · CNPJ XX.XXX.XXX/0001-XX · São Paulo/SP
        </p>
        <p className="text-[10px] text-[#CBD5E0] mt-0.5">
          Dúvidas?{" "}
          <a
            href="https://wa.me/551145527512?text=Olá%2C%20tenho%20uma%20dúvida%20sobre%20os%20termos%20de%20uso"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C084FC] font-semibold hover:underline"
          >
            Fale conosco pelo WhatsApp
          </a>
        </p>
      </div>
    </div>
  );
}
