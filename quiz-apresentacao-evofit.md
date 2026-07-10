# Quiz de Apresentação — Evofit ("Evo IA")

Funil de pré-venda (antes da assinatura), inspirado na estrutura do "Lábia de Cachorro IA":
**Landing/hook → Quiz rápido e persuasivo → "IA" (Evo) responde com insight personalizado + gera urgência → VSL/vídeo → Página de preço → Checkout (Cakto)**.

Diferença importante do quiz de anamnese (`app/onboarding`): aquele é técnico, extenso, e só é
liberado *depois* de assinar. Este aqui é curto, emocional, e serve pra vender — não pra coletar
dado de verdade (a anamnese completa continua vindo depois).

Persona da "IA": **Evo**, o personal digital do Evofit — fala em 1ª pessoa, tom direto e acolhedor,
mistura conhecimento técnico de treino com entendimento emocional (por que a pessoa nunca conseguiu
manter uma rotina, não só "o que fazer").

---

## 1. Landing / Hook (rota nova, ex: `/quiz`)

**Headline:**
> Você põe todo mundo na sua frente... e esquece de você?

**Subheadline:**
> Descubra em 2 minutos como sair do sedentarismo sem tirar tempo de ninguém — nem gastar rios de dinheiro com personal e nutricionista.

**Card de prévia** (mesmo formato do card "Sugestão Lábia IA" do exemplo — mostra que a IA já entende o problema antes mesmo do quiz):

> 💜 **SUGESTÃO EVO IA**
> "Seu maior travamento não é preguiça — é rotina. E isso muda com 20 minutos, não com 2 horas de academia."
> [tag: `Sem academia lotada`]

**CTA:** `COMEÇAR MEU DIAGNÓSTICO`

**Prova social:** em vez de um número inventado (o exemplo usa "7.218 usuários ativos", que seria propaganda enganosa se fosse fictício), uso uma frase de confiança sem alegar um dado verificável:

> Feito para quem nunca teve tempo de treinar.

---

## 2. Quiz rápido (4 perguntas, estilo clique-e-avança, sem digitação)

Cada pergunta ocupa uma tela inteira, com barra de progresso (visual igual ao onboarding atual).

**Pergunta 1 — Qual dessas frases mais parece com você agora?**
- Cuido de todo mundo e nunca sobra tempo pra mim
- Já tentei academia ou dieta um monte de vezes e não colou
- Vivo cansada(o), sem energia nem pras minhas coisas
- Quero mudar, mas não sei nem por onde começar

**Pergunta 2 — Quanto tempo livre você tem por dia pra cuidar de você?**
- Quase nenhum
- Uns 20–30 minutos, se sobrar
- Uma hora, mas raramente uso direito
- Tenho tempo, só falta direção

**Pergunta 3 — O que mais pesa quando você pensa em "malhar" ou "fazer dieta"?**
- Vergonha de começar do zero
- Medo de gastar e não dar certo
- Não saber montar treino/dieta sozinho(a)
- Ninguém pra cobrar/confiar

**Pergunta 4 — Se em 90 dias seu corpo E sua cabeça estivessem no controle, o que mudaria primeiro?**
- Minha energia no dia a dia
- Minha autoestima no espelho
- Minha disposição pra cuidar de quem eu amo
- Finalmente eu em primeiro lugar, por uma vez

Tela de transição: **"Analisando suas respostas..."** (2-3s de loading, gera expectativa — igual ao "montando seu plano" do exemplo).

---

## 3. Evo responde (estilo chat, bolha por bolha)

Baseado na resposta da pergunta 3 (o bloqueio principal), a mensagem de abertura muda — mas a estrutura é fixa:

```
oi, aqui é a Evo 👋
terminei de analisar suas respostas
e não, você não precisa de mais um app de treino genérico
que ninguém segue depois da 2ª semana
nem de personal caro cobrando R$150+ pra te passar
o mesmo treino de sempre
você precisa de algo que treine você onde você tá,
com o tempo que sobra
e que cuide da sua cabeça também, não só do corpo
comecei a montar seu plano personalizado...
enquanto isso, olha rapidinho como funciona 👇
```

**CTA final:** `VER COMO FUNCIONA AGORA`

---

## 4. VSL + Preço (rota nova, ex: `/quiz/oferta`)

**Vídeo** (produção futura — pode reaproveitar o formato UGC dos roteiros de ads que já fizemos: alguém contando a própria transformação, terminando explicando como o Evofit funciona).

**Card de plano** (visual igual ao card de features do app: fundo `#1A1A1A`, borda `#2D2D2D`, botão roxo `#A855F7`):

> **PLANO MENSAL**
> R$0,90 por dia
> **R$27,00/mês**
> ✅ Treino personalizado todos os dias
> ✅ Dieta feita pra sua rotina
> ✅ Tarefas motivacionais diárias
> ✅ Suporte via WhatsApp
> ✅ Cancele quando quiser
>
> `ESCOLHER MEU PLANO` → redireciona pro Cakto (mesmo link já usado na landing atual)

### Preço: R$27,00/mês (definido)
Menos de R$1 por dia — vale a pena manter esse enquadramento ("por dia") na página, é bem mais persuasivo
que mostrar só o valor mensal.

---

## Próximo passo

Se você aprovar o roteiro (ou pedir ajustes), eu implemento como páginas reais no Evofit
(`app/quiz/page.tsx`, tela de resposta da Evo, e `app/quiz/oferta/page.tsx`), no mesmo estilo visual
que o app já usa, e troco os botões da landing atual pra apontar pra esse funil em vez de ir direto
pro Cakto.
