// Perguntas da anamnese curta de /consultoria — seguem fielmente, na mesma
// ordem, os 10 modelos do livro "10 Modelos de Anamnese para Personal
// Trainer" (Fabio Ceschini), que a Shayane usa como referência.
//
// Duas simplificações inevitáveis num formulário web (sem isso, exigiriam
// upload de imagem ou um editor de desenho):
// 1. As perguntas que pedem pra apontar um NÚMERO (1-9) numa figura de
//    silhuetas corporais viram uma escolha numérica simples (1 a 9), sem a
//    imagem do livro.
// 2. As perguntas que pedem pra marcar a dor num DESENHO do corpo (boneco)
//    viram uma lista de regiões pra marcar (mesma lista de regiões que o
//    livro já usa como checkbox simples em outros modelos).
// Fora isso, as perguntas, as opções e a ordem são as mesmas do livro.

export type ExtraFieldType = "radio" | "checkbox" | "text" | "textarea" | "scale";

export interface ExtraField {
  key: string;
  label: string;
  type: ExtraFieldType;
  options?: string[];
  placeholder?: string;
}

export interface TipoConfig {
  slug: string;
  titulo: string;
  subtitulo: string;
  temNivel: boolean; // o livro tem "Nível de treinamento" no cabeçalho de quase todos os modelos, exceto o comum
  extras: ExtraField[];
}

// ── Listas reaproveitadas (o livro repete as mesmas opções em mais de um modelo) ──
const REGIOES_DOR = ["Cabeça", "Pescoço", "Ombros", "Braços", "Punho", "Mãos", "Coluna lombar", "Quadril", "Pés", "Coxas", "Abdômen", "Panturrilha", "Nenhuma dessas"];
const DESCRITORES_DOR = ["Terrível", "Insuportável", "Enlouquecedora", "Profunda", "Intensa", "Desconfortável"];
const MODALIDADES = ["Musculação", "Treino com o peso do corpo", "Esteira", "Bike", "Natação", "Lutas", "Outra(s)"];
const SILHUETA = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const SIM_NAO = ["Sim", "Não"];

export const CONSULTORIA_TIPOS: Record<string, TipoConfig> = {
  // Capítulo 8 — Modelo de anamnese inteligente para homens e mulheres [adultos]
  comum: {
    slug: "comum",
    titulo: "Me conta um pouco sobre você",
    subtitulo: "Algumas perguntas rápidas pra eu entender sua rotina e já ir pensando no seu treino.",
    temNivel: false,
    extras: [
      { key: "objetivos", label: "Quais são os seus objetivos com a prática de exercício físico?", type: "checkbox", options: ["Prevenção", "Condicionamento Físico", "Lazer", "Estética", "Outro(s)"] },
      { key: "disponibilidade", label: "Qual é a sua disponibilidade para treinar? (dias por semana e minutos por dia)", type: "text", placeholder: "Ex: 3 dias, 45 minutos" },
      { key: "modalidadesGosta", label: "Quais são os tipos de exercícios físicos que você gosta?", type: "checkbox", options: MODALIDADES },
      { key: "naoGosta", label: "Existe alguma coisa que você NÃO GOSTA de fazer durante a prática do exercício?", type: "textarea" },
      { key: "treinouUltimos3Meses", label: "Nos últimos 3 meses, você estava praticando algum tipo de exercício físico? Se sim, qual, quantas vezes por semana, quantos minutos por dia e qual intensidade.", type: "textarea" },
      { key: "doencaDiagnosticada", label: "Você apresenta alguma doença diagnosticada pelo médico? Qual(is)? Se sim, quais remédios está tomando?", type: "textarea" },
      { key: "cirurgia", label: "Você já fez alguma cirurgia? Em qual região do corpo?", type: "textarea" },
      { key: "dorRegioes", label: "Atualmente você sente algum tipo de dor ou desconforto muscular? Em qual(is) região(ões)?", type: "checkbox", options: REGIOES_DOR },
      { key: "dorNota", label: "Dê uma nota de 0 (sem dor) a 10 (dor insuportável) para essa dor", type: "scale" },
      { key: "dorDificuldade", label: "Essa dor te atrapalha em algum movimento do dia a dia? Qual?", type: "textarea" },
      { key: "dorNoPeito", label: "Você sente dor no peito quando realiza exercício físico?", type: "radio", options: SIM_NAO },
      { key: "perdaEquilibrio", label: "Você já perdeu o equilíbrio por causa de tontura ou alguma vez perdeu a consciência?", type: "radio", options: SIM_NAO },
      { key: "desconfortoDiaDia", label: "Você sente desconforto em movimentos do dia a dia (casa, trabalho, subir/descer escadas, caminhar, correr)? Quais e qual a dificuldade?", type: "textarea" },
      { key: "parentePrimeiroGrau", label: "Algum parente de primeiro grau tem problemas cardíacos? Quantos?", type: "textarea" },
      { key: "fuma", label: "Você fuma?", type: "radio", options: SIM_NAO },
    ],
  },

  // Capítulo 9 — Modelo de anamnese inteligente para mulheres que desejam emagrecer
  emagrecimento: {
    slug: "emagrecimento",
    titulo: "Vamos montar seu plano pra emagrecer",
    subtitulo: "Me conta um pouco mais sobre sua rotina e seu histórico com emagrecimento.",
    temNivel: true,
    extras: [
      { key: "objetivosPrograma", label: "Assinale os seus objetivos com o programa de treinamento", type: "checkbox", options: ["Prevenção de doenças", "Condicionamento Físico", "Emagrecimento", "Ganho de massa muscular no corpo inteiro", "Controlar doenças", "Diminuir dores corporais", "Ganho de massa muscular no quadril e coxas", "Outro(s)"] },
      { key: "autoestima", label: "Como você classificaria sua autoestima hoje?", type: "scale" },
      { key: "silhuetaReal", label: "Qual número (1 a 9, do mais magro ao mais cheio) representa melhor sua aparência física atual?", type: "radio", options: SILHUETA },
      { key: "silhuetaIdeal", label: "E qual número representa a silhueta que você gostaria de ter?", type: "radio", options: SILHUETA },
      { key: "objetivos6meses", label: "Daqui 6 meses, qual desses objetivos conquistados te deixaria mais feliz?", type: "checkbox", options: ["Conseguir emagrecer", "Tonificar a musculatura do corpo", "Ganhar massa muscular no quadril e coxas", "Me sentir mais disposta no dia a dia", "Ter mais energia", "Se sentir bem comigo mesma", "Viver sem dor", "Outro(s)"] },
      { key: "remedioEmagrecer", label: "Já fez uso de remédios para emagrecer? Qual e qual foi o resultado (kg perdidos)?", type: "textarea" },
      { key: "dificuldadeEmagrecer", label: "Hoje, qual é sua maior dificuldade para conseguir emagrecer?", type: "radio", options: ["Manter a regularidade nos exercícios", "Manter a regularidade na dieta", "Manter o ânimo para fazer exercício", "Quando me sinto triste, desconto na comida", "Quando fico triste, falto aos treinos", "Outra"] },
      { key: "cicloRegular", label: "Nos últimos 6 meses, o ciclo menstrual esteve regulado?", type: "radio", options: SIM_NAO },
      { key: "cicloIrregularidade", label: "Se não esteve regulado: há quanto tempo está irregular ou suspenso?", type: "radio", options: ["Irregular só no último mês", "Irregular nos últimos 3 meses", "Irregular nos últimos 4 a 6 meses", "Suspenso há pelo menos 3 meses"] },
      { key: "sintomasMenstruais", label: "Durante o período menstrual, quais desses sintomas você costuma sentir?", type: "checkbox", options: ["Tontura", "Moleza", "Dor abdominal", "Dor na coluna lombar", "Dor nas pernas", "Irritação", "Tristeza", "Queda de pressão", "Visão escurecida", "Formigamento nos dedos", "Palpitação", "Sono durante o dia", "Outro(s)"] },
      { key: "anticoncepcional", label: "Nos últimos 6 meses, você fez uso de anticoncepcional?", type: "radio", options: SIM_NAO },
      { key: "condicoes", label: "Você tem alguma dessas condições?", type: "checkbox", options: ["Diabetes tipo 1", "Diabetes tipo 2", "Hipertensão arterial", "Colesterol elevado", "Glicose elevada", "Ovário policístico", "Asma", "Câncer", "Artrite", "Artrose", "Osteoporose", "Nenhuma dessas"] },
      { key: "exercicioUltimos6Meses", label: "Nos últimos 6 meses, você praticou algum tipo de exercício físico? Qual, quantos dias por semana, quantos minutos por dia e qual intensidade?", type: "textarea" },
      { key: "fatoresImpedem", label: "O que te impede de manter a regularidade nos treinos semanais?", type: "checkbox", options: ["Falta de tempo", "Falta de motivação", "Falta de energia", "Falta de conhecimento em como se exercitar", "Não gosto de exercícios vigorosos", "Não gosto de suar", "Sinto dores no corpo durante o exercício", "Sinto dores no corpo após o exercício", "Tive experiências negativas com o exercício", "Tenho medo de me machucar", "Não gosto de treinar sozinha", "Outro(s)"] },
      { key: "disponibilidade", label: "Qual é a sua disponibilidade para treinar? (dias por semana e minutos por dia)", type: "text", placeholder: "Ex: 3 dias, 45 minutos" },
      { key: "modalidadesGosta", label: "Quais tipos de exercício físico você gosta de fazer?", type: "checkbox", options: ["Musculação", "Treino com o peso do corpo", "Treino funcional", "Treino circuitado", "Esteira", "Bike", "Transport", "Natação", "Lutas", "Outra(s)"] },
      { key: "modalidadesNaoGosta", label: "Quais tipos de exercício físico você NÃO gosta de fazer?", type: "checkbox", options: ["Musculação", "Treino com o peso do corpo", "Treino funcional", "Treino circuitado", "Esteira", "Bike", "Transport", "Natação", "Lutas", "Outro(s)"] },
      { key: "remedioCronico", label: "Atualmente, você faz uso de algum remédio de forma crônica (todos os dias)? Qual?", type: "textarea" },
      { key: "dorUltimos7Dias", label: "Nos últimos 7 dias, você teve dor em alguma região do corpo que provocou incômodo? Onde?", type: "checkbox", options: REGIOES_DOR },
      { key: "dorUltimos7DiasNota", label: "Dê uma nota de 0 (sem dor) a 10 (insuportável) pra essa dor", type: "scale" },
    ],
  },

  // Capítulo 10 — Modelo de anamnese inteligente para clientes da terceira idade [idosos]
  // (o livro traz dois modelos pra esse público — autoavaliação funcional + anamnese geral — os dois aqui)
  idoso: {
    slug: "idoso",
    titulo: "Vamos cuidar da sua qualidade de vida",
    subtitulo: "Algumas perguntas pra eu entender melhor sua capacidade funcional e o seu dia a dia.",
    temNivel: true,
    extras: [
      { key: "cap1", label: "Tomar conta das suas necessidades pessoais (ex: vestir-se sozinho)", type: "radio", options: ["Faço", "Faço com dificuldade ou ajuda", "Não posso fazer"] },
      { key: "cap2", label: "Tomar banho", type: "radio", options: ["Faço", "Faço com dificuldade ou ajuda", "Não posso fazer"] },
      { key: "cap3", label: "Caminhar fora de casa (1 a 2 quarteirões)", type: "radio", options: ["Faço", "Faço com dificuldade ou ajuda", "Não posso fazer"] },
      { key: "cap4", label: "Fazer atividades domésticas leves (cozinhar, tirar pó, lavar pratos, varrer a casa)", type: "radio", options: ["Faço", "Faço com dificuldade ou ajuda", "Não posso fazer"] },
      { key: "cap5", label: "Subir ou descer escadas", type: "radio", options: ["Faço", "Faço com dificuldade ou ajuda", "Não posso fazer"] },
      { key: "cap6", label: "Fazer compras no supermercado ou shopping", type: "radio", options: ["Faço", "Faço com dificuldade ou ajuda", "Não posso fazer"] },
      { key: "cap7", label: "Levantar e carregar 5 kg (um pacote de arroz)", type: "radio", options: ["Faço", "Faço com dificuldade ou ajuda", "Não posso fazer"] },
      { key: "cap8", label: "Caminhar de 6 a 7 quarteirões", type: "radio", options: ["Faço", "Faço com dificuldade ou ajuda", "Não posso fazer"] },
      { key: "cap9", label: "Caminhar de 12 a 14 quarteirões", type: "radio", options: ["Faço", "Faço com dificuldade ou ajuda", "Não posso fazer"] },
      { key: "cap10", label: "Levantar e carregar 13 kg (uma mala média ou grande)", type: "radio", options: ["Faço", "Faço com dificuldade ou ajuda", "Não posso fazer"] },
      { key: "cap11", label: "Fazer atividades domésticas pesadas (aspirar, esfregar pisos)", type: "radio", options: ["Faço", "Faço com dificuldade ou ajuda", "Não posso fazer"] },
      { key: "cap12", label: "Fazer atividades vigorosas (caminhar por grandes distâncias, mover objetos pesados, dançar)", type: "radio", options: ["Faço", "Faço com dificuldade ou ajuda", "Não posso fazer"] },
      { key: "beneficio3meses", label: "Daqui 3 meses, o que você mais quer como benefício do programa de treinamento?", type: "checkbox", options: ["Não sentir dores no corpo", "Emagrecer", "Conseguir caminhar sem me sentir cansado(a)", "Conseguir fazer minhas coisas sem me sentir cansado(a)", "Tomar menos remédios"] },
      { key: "dorAgora", label: "Nesse exato momento, você sente alguma dor no corpo? Onde?", type: "textarea" },
      { key: "dorUltimos30Dias", label: "Nos últimos 30 dias, você sentiu alguma dor ou desconforto no corpo? Onde?", type: "textarea" },
      { key: "dificuldadeDentroCasa", label: "Dentro de casa ou no quintal, você tem dificuldade para:", type: "checkbox", options: ["Caminhar", "Ficar em pé parado", "Agachar", "Levantar da cadeira, sofá, banco ou cama", "Me vestir", "Pentear o cabelo", "Limpar a casa", "Outro(s)"] },
      { key: "dificuldadeForaCasa", label: "Na rua (fora de casa), você tem dificuldade para:", type: "checkbox", options: ["Caminhar por mais de 10 minutos", "Caminhar por mais de 20 minutos", "Ficar em pé parado", "Desviar de obstáculos na rua", "Agachar", "Subir os degraus do ônibus", "Descer os degraus do ônibus", "Levantar do banco do carro ou ônibus", "Caminhar carregando peso"] },
      { key: "condicoes", label: "Tem conhecimento ou o médico já diagnosticou alguma dessas condições?", type: "checkbox", options: ["Hipertensão arterial", "Alzheimer", "Parkinson", "Depressão", "Ansiedade", "Dislipidemia", "Colesterol elevado", "Triglicérides elevado", "Esteatose hepática (gordura no fígado)", "Obesidade", "Diabetes tipo 2", "Diabetes tipo 1", "Doença artéria coronariana", "Doença renal", "Insuficiência cardíaca", "Câncer", "Neuropatias", "Outra(s)"] },
      { key: "remedioDiario", label: "Toma algum remédio todos os dias? Pra quê?", type: "textarea" },
      { key: "fraquezaPernas", label: "Você sente fraqueza nas pernas quando vai caminhar ou subir escadas?", type: "radio", options: SIM_NAO },
      { key: "quedaEquilibrio", label: "Alguma vez ao caminhar, você perdeu o equilíbrio e caiu?", type: "radio", options: SIM_NAO },
      { key: "cirurgia", label: "Ao longo da vida, já fez alguma cirurgia? Em qual região do corpo?", type: "checkbox", options: ["Cabeça", "Pescoço", "Ombros", "Braço", "Punho", "Mão", "Quadril", "Pernas", "Tornozelo", "Pés", "Não fiz cirurgia"] },
      { key: "felizConseguir", label: "O que mais te deixaria feliz se conseguisse fazer de novo?", type: "checkbox", options: ["Viajar", "Passear no shopping com a família ou amigos", "Dançar", "Brincar com os netos", "Caminhar ao ar livre", "Conhecer novas pessoas", "Outro(s)"] },
      { key: "incomodaHoje", label: "O que mais te incomoda hoje?", type: "checkbox", options: ["Dor no corpo", "Ficar sempre cansado(a)", "Não conseguir brincar com os netos", "Não conseguir dançar", "Não conseguir caminhar vários minutos sem parar pra descansar", "Tomar muitos remédios todos os dias", "Não conseguir cuidar da minha casa", "Precisar de ajuda de outras pessoas pra fazer coisas simples", "Outro(s)"] },
    ],
  },

  // Capítulo 11 — Modelo de anamnese inteligente para gestantes
  gestante: {
    slug: "gestante",
    titulo: "Vamos cuidar de você nessa fase",
    subtitulo: "Algumas perguntas sobre a gestação pra eu te orientar com segurança.",
    temNivel: true,
    extras: [
      { key: "primeiraGestacao", label: "Essa é sua primeira gestação? Se não, quantas gestações anteriores?", type: "textarea" },
      { key: "dataParto", label: "Qual é a data prevista para o parto?", type: "text", placeholder: "dd/mm/aaaa" },
      { key: "complicacaoConhecida", label: "É de seu conhecimento alguma complicação na gestação? Qual?", type: "textarea" },
      { key: "sintomas", label: "Assinale caso tenha sentido algum desses sintomas:", type: "checkbox", options: ["Desmaio", "Tontura", "Cansaço generalizado", "Dor abdominal incomum", "Inchaço nos pés ou mãos", "Sangramento vaginal", "Dor de cabeça persistente", "Outro(s)"] },
      { key: "hipertensaoGestacional", label: "É de seu conhecimento ter hipertensão induzida pela gravidez ou pré-eclâmpsia?", type: "radio", options: SIM_NAO },
      { key: "diabetesGestacional", label: "É de seu conhecimento ter diabetes induzida pela gravidez?", type: "radio", options: SIM_NAO },
      { key: "restricaoMedica", label: "O médico recomendou que você NÃO praticasse algum tipo de exercício físico? Qual?", type: "textarea" },
      { key: "condicoes", label: "Você já recebeu diagnóstico médico de alguma doença?", type: "checkbox", options: ["Obesidade", "Diabetes tipo 1", "Diabetes tipo 2", "Dislipidemia", "Colesterol elevado", "Triglicérides elevado", "Apneia do sono", "Esteatose hepática (gordura no fígado)", "Doença artéria coronariana", "Doença renal", "Insuficiência cardíaca", "Câncer", "Neuropatias", "Alzheimer", "Parkinson", "Asma", "DPOC", "Nenhuma dessas"] },
      { key: "atividadeAntes", label: "Antes da gestação, você praticava alguma atividade física? Qual, quantos dias por semana, quantos minutos por dia e qual intensidade?", type: "textarea" },
      { key: "dificuldadeAtual", label: "No atual estágio da gravidez, você tem dificuldade para:", type: "checkbox", options: ["Levantar peso pesado", "Caminhar", "Subir escadas", "Descer escadas", "Ficar em pé parada por muito tempo", "Outro(s)"] },
      { key: "dorUltimos7Dias", label: "Nos últimos 7 dias, você sentiu alguma dor no corpo? Onde?", type: "checkbox", options: REGIOES_DOR },
      { key: "dorUltimos7DiasNota", label: "Dê uma nota de 0 (nenhuma dor) a 10 (dor insuportável) pra essa dor", type: "scale" },
    ],
  },

  // Capítulo 12 — Modelo de anamnese inteligente para mulheres no período pós-parto
  posparto: {
    slug: "posparto",
    titulo: "Vamos retomar seu treino com segurança",
    subtitulo: "Algumas perguntas sobre o parto e como você está se sentindo.",
    temNivel: true,
    extras: [
      { key: "primeiraGestacao", label: "Essa foi sua primeira gestação? Se não, quantas gestações anteriores?", type: "textarea" },
      { key: "dataParto", label: "Qual foi a data do parto?", type: "text", placeholder: "dd/mm/aaaa" },
      { key: "tipoParto", label: "Qual foi o tipo de parto?", type: "radio", options: ["Parto natural", "Parto cesariano"] },
      { key: "intercorrenciaParto", label: "Houve alguma intercorrência durante o parto? Descreva.", type: "textarea" },
      { key: "intercorrenciaPosParto", label: "Após o parto, houve alguma intercorrência? Descreva.", type: "textarea" },
      { key: "pesoGanho", label: "Qual foi o peso ganho na gravidez? (kg)", type: "text" },
      { key: "hipertensaoGestacional", label: "Durante a gestação, houve hipertensão induzida pela gravidez ou pré-eclâmpsia (principalmente após o 5º mês)? Usou fármaco pra controlar? Qual?", type: "textarea" },
      { key: "diabetesGestacional", label: "Durante a gestação, houve diabetes gestacional? Usou fármaco pra controlar? Qual?", type: "textarea" },
      { key: "pesoPerdido", label: "Após a gestação, quantos quilos você já perdeu?", type: "text" },
      { key: "parteIncomoda", label: "Hoje, qual é a parte do seu corpo que mais te incomoda?", type: "text" },
      { key: "autoestima", label: "Como você classificaria sua autoestima hoje?", type: "scale" },
      { key: "silhuetaReal", label: "Qual número (1 a 9) representa melhor sua aparência física atualmente?", type: "radio", options: SILHUETA },
      { key: "silhuetaIdeal", label: "E qual número representa a silhueta que você gostaria de ter?", type: "radio", options: SILHUETA },
      { key: "condicoes", label: "Você já recebeu diagnóstico médico de alguma doença?", type: "checkbox", options: ["Obesidade", "Diabetes tipo 1", "Diabetes tipo 2", "Dislipidemia", "Colesterol elevado", "Triglicérides elevado", "Apneia do sono", "Esteatose hepática (gordura no fígado)", "Doença artéria coronariana", "Doença renal", "Insuficiência cardíaca", "Câncer", "Asma", "DPOC", "Nenhuma dessas"] },
      { key: "atividadeAntes", label: "Antes ou durante a gestação, você praticava alguma atividade física? Qual, quantos dias por semana, quantos minutos por dia e qual intensidade?", type: "textarea" },
      { key: "dorUltimos7Dias", label: "Nos últimos 7 dias, você sentiu alguma dor no corpo? Onde?", type: "checkbox", options: REGIOES_DOR },
      { key: "dorUltimos7DiasNota", label: "Dê uma nota de 0 (nenhuma dor) a 10 (dor insuportável) pra essa dor", type: "scale" },
      { key: "objetivos", label: "Quais são seus objetivos com o programa de exercício físico?", type: "checkbox", options: ["Emagrecimento", "Tonificar a musculatura", "Melhorar a saúde", "Recuperar o fôlego", "Ter mais disposição", "Me sentir menos cansada", "Outro(s)"] },
      { key: "imagine6meses", label: "Se imagine daqui 6 meses. Descreva como gostaria de estar, pensando no seu corpo e na sua saúde.", type: "textarea" },
    ],
  },

  // Capítulo 13 — Modelo de anamnese inteligente para cliente com obesidade
  obesidade: {
    slug: "obesidade",
    titulo: "Vamos montar seu plano com cuidado",
    subtitulo: "Algumas perguntas sobre seu histórico pra eu te ajudar da melhor forma.",
    temNivel: true,
    extras: [
      { key: "quandoComecou", label: "Quando você começou a ganhar peso? Seja específico (ano, contexto, se foi por conta de algum trauma).", type: "textarea" },
      { key: "pesoMaximo", label: "Qual o peso máximo que você já atingiu na vida? (kg)", type: "text" },
      { key: "tentativas", label: "Quantas vezes já fez algo para emagrecer (dietas, exercício, remédios, cirurgias)?", type: "radio", options: ["1 vez", "2 vezes", "3 vezes", "Entre 4 e 6 vezes", "Entre 7 e 10 vezes", "Mais de 10 vezes"] },
      { key: "oQueDeuCerto", label: "O que você fez para emagrecer e que deu certo? (exercício, dieta, remédio, cirurgia...)", type: "textarea" },
      { key: "oQueDeuErrado", label: "O que você fez para emagrecer e que deu errado?", type: "textarea" },
      { key: "objetivos", label: "Quais são os seus objetivos com o programa de treinamento?", type: "checkbox", options: ["Prevenção", "Condicionamento Físico", "Emagrecimento", "Ganho de massa muscular", "Controlar doenças", "Diminuir dores corporais", "Outro(s)"] },
      { key: "disponibilidade", label: "Qual é a sua disponibilidade para treinar? (dias por semana e minutos por dia)", type: "text", placeholder: "Ex: 3 dias, 45 minutos" },
      { key: "modalidadesGosta", label: "Quais tipos de exercício físico você gosta de fazer?", type: "checkbox", options: ["Musculação", "Treino com o peso do corpo", "Esteira", "Bike", "Transport", "Natação", "Lutas", "Outra(s)"] },
      { key: "modalidadesNaoGosta", label: "Quais tipos de exercício físico você NÃO gosta de fazer?", type: "checkbox", options: ["Musculação", "Treino com o peso do corpo", "Esteira", "Bike", "Transport", "Natação", "Lutas", "Outro(s)"] },
      { key: "condicoes", label: "Você tem alguma dessas doenças ou condições diagnosticada por um médico?", type: "checkbox", options: ["Diabetes tipo I", "Diabetes tipo II", "Esteatose hepática não-alcoólica", "Hipertensão arterial", "Síndrome metabólica", "Colesterol elevado", "Dislipidemia", "Insuficiência cardíaca", "Doença arterial coronariana", "Osteoporose", "Artrite", "Artrose", "Câncer", "Asma", "DPOC", "Hérnia de disco", "Depressão", "Ansiedade", "Outra(s)"] },
      { key: "remedioEmagrecer", label: "Já fez uso de algum medicamento para emagrecer? Qual e qual foi o resultado (kg perdidos)?", type: "textarea" },
      { key: "remedioCronico", label: "Atualmente, está fazendo uso de algum remédio de forma crônica (todos os dias)? Quais?", type: "textarea" },
      { key: "dorRepousoRegioes", label: "Nos últimos 15 dias, sentiu dor nos ossos, músculos, articulações ou em qualquer parte do corpo EM REPOUSO? Onde?", type: "checkbox", options: REGIOES_DOR },
      { key: "dorRepousoNota", label: "Nota de 0 (sem dor) a 10 (insuportável) pra essa dor em repouso", type: "scale" },
      { key: "dorRepousoDescritor", label: "Como você descreveria essa dor em repouso?", type: "checkbox", options: DESCRITORES_DOR },
      { key: "dorExercicioRegioes", label: "E DURANTE O EXERCÍCIO FÍSICO, sente dor em alguma região? Onde?", type: "checkbox", options: REGIOES_DOR },
      { key: "dorExercicioNota", label: "Nota de 0 (sem dor) a 10 (insuportável) pra essa dor durante o exercício", type: "scale" },
      { key: "dorExercicioDescritor", label: "Como você descreveria essa dor durante o exercício?", type: "checkbox", options: DESCRITORES_DOR },
      { key: "dorImpedeAtividades", label: "As dores que sente durante o exercício te impedem de fazer atividades simples do dia a dia? Quais?", type: "textarea" },
      { key: "dorPrejudicaMovimentos", label: "As dores corporais estão prejudicando movimentos que você faz em esforço (caminhar, correr, fazer força)? Quais?", type: "textarea" },
      { key: "examesSangue", label: "Faz exame de sangue pelo menos uma vez ao ano? Considerando o último exame, apresenta alguma dessas condições?", type: "checkbox", options: ["Glicose elevada", "Insulina elevada", "Colesterol elevado", "LDL-colesterol elevado", "HDL baixo", "Cortisol elevado", "Não sei dizer"] },
      { key: "horasSono", label: "Considerando um dia comum de semana, quantas horas por dia você dorme?", type: "text" },
      { key: "acordaCansado", label: "Você acorda cansado?", type: "radio", options: SIM_NAO },
      { key: "qualidadeSono", label: "Dê uma nota de 0 (sono não reparador) a 10 (sono totalmente reparador) pra qualidade do seu sono", type: "scale" },
    ],
  },

  // Capítulo 14 — Modelo de anamnese inteligente para cliente com diabetes mellitus
  diabetes: {
    slug: "diabetes",
    titulo: "Vamos montar um plano seguro pro seu diabetes",
    subtitulo: "Algumas perguntas específicas pra treinar com segurança.",
    temNivel: true,
    extras: [
      { key: "tipo", label: "Qual é o tipo de Diabetes Mellitus que você tem?", type: "radio", options: ["Tipo 1", "Tipo 2", "Não sei dizer"] },
      { key: "tempoDiagnostico", label: "Há quanto tempo você sabe que é portador(a) de Diabetes Mellitus?", type: "radio", options: ["Menos de 1 ano", "Entre 1 e 2 anos", "Entre 3 e 4 anos", "Entre 5 e 6 anos", "Entre 7 e 10 anos", "Mais de 10 anos"] },
      { key: "acompanhamentoNutricional", label: "Atualmente, faz acompanhamento nutricional com nutricionista pra controlar o Diabetes?", type: "radio", options: SIM_NAO },
      { key: "farmacos", label: "Faz uso de fármacos para controlar o Diabetes Mellitus? Quais e qual a dosagem? (ex: Metformina 500mg, 2x ao dia)", type: "textarea" },
      { key: "outrasCondicoes", label: "Tem conhecimento ou o médico já diagnosticou alguma dessas condições?", type: "checkbox", options: ["Hipertensão arterial", "Dislipidemia", "Esteatose hepática (gordura no fígado)", "Doença artéria coronariana", "Doença renal", "Insuficiência cardíaca", "Câncer", "Neuropatias", "Nenhuma dessas"] },
      { key: "complicacaoCronica", label: "Já teve alguma complicação crônica em função do Diabetes Mellitus? Qual? (retinopatia, neuropatia, nefropatia, aterosclerose, infarto, AVC, doença arterial periférica...)", type: "textarea" },
      { key: "hemoglobinaGlicada", label: "Considerando o último exame de sangue, qual foi o valor da hemoglobina glicada? (%)", type: "text" },
      { key: "crisesHiperglicemia", label: "Você já teve crises de hiperglicemia? Descreva o que sentiu.", type: "textarea" },
      { key: "crisesHipoglicemia", label: "Você já teve crises de hipoglicemia? Descreva o que sentiu.", type: "textarea" },
      { key: "objetivos", label: "Quais são seus objetivos com o programa de treinamento?", type: "checkbox", options: ["Controlar o diabetes mellitus", "Emagrecer", "Ganhar força e massa muscular", "Diminuir dor corporal", "Outro(s)"] },
      { key: "exercicioAtual", label: "Atualmente, faz algum tipo de exercício físico? Qual, quantos dias por semana, quantos minutos por dia e qual intensidade?", type: "textarea" },
      { key: "sintomasExercicio", label: "Alguma vez, durante a prática de exercício, sentiu algum desses sintomas?", type: "checkbox", options: ["Tontura", "Vômito", "Tosse", "Sensação de fraqueza", "Sensação de desmaio", "Visão escurecer", "Formigamento nos dedos", "Espasmo (tremedeira)", "Nenhum desses"] },
      { key: "refeicoesPorDia", label: "Você faz quantas refeições por dia?", type: "radio", options: ["Até 3", "Entre 3 e 4", "5 ou mais"] },
      { key: "dificuldadeControlarGlicemia", label: "Nos últimos 30 dias, teve problemas pra controlar a glicemia? Quantas vezes?", type: "radio", options: ["Não tive problemas", "1 vez", "2 vezes", "3 vezes", "4 ou mais vezes"] },
      { key: "monitoramentoGlicemia", label: "Faz o monitoramento diário da glicemia? Qual método usa?", type: "radio", options: ["Não monitoro", "Point care / hemoglobina glicada", "Glicemia capilar", "Monitor contínuo de glicose (sensor)", "Sistema Flash de Monitorização"] },
      { key: "ultimaVisitaMedica", label: "Quanto tempo faz da sua última visita ao médico pra controle do Diabetes?", type: "radio", options: ["Menos de 6 meses", "Entre 6 meses e 1 ano", "Mais de 1 ano"] },
    ],
  },

  // Capítulo 15 — Modelo de anamnese inteligente para cliente com hipertensão arterial
  hipertensao: {
    slug: "hipertensao",
    titulo: "Vamos montar um plano seguro pra sua pressão",
    subtitulo: "Algumas perguntas específicas pra treinar com segurança.",
    temNivel: true,
    extras: [
      { key: "tempoDiagnostico", label: "Há quanto tempo você foi diagnosticado(a) com Hipertensão Arterial?", type: "radio", options: ["Menos de 1 ano", "Entre 1 e 2 anos", "Entre 3 e 4 anos", "Entre 5 e 9 anos", "10 ou mais anos"] },
      { key: "ultimaVisitaMedica", label: "Quando foi sua última visita ao médico pra controle da Hipertensão?", type: "radio", options: ["Menos de 1 mês", "Entre 1 e 3 meses", "Entre 4 e 6 meses", "Entre 7 e 11 meses", "12 meses ou mais"] },
      { key: "farmacos", label: "Faz uso regular de algum fármaco pra controlar a Hipertensão? Quais?", type: "textarea" },
      { key: "outraDoenca", label: "Além de Hipertensão, é de seu conhecimento o diagnóstico de outra doença? Qual?", type: "checkbox", options: ["Obesidade", "Diabetes tipo 1", "Diabetes tipo 2", "Dislipidemia", "Colesterol elevado", "Triglicérides elevado", "Apneia do sono", "Esteatose hepática (gordura no fígado)", "Doença artéria coronariana", "Doença renal", "Insuficiência cardíaca", "Câncer", "Neuropatias", "Alzheimer", "Parkinson", "Asma", "DPOC", "Nenhuma dessas"] },
      { key: "parenteCardiovascular", label: "Tem parentes de primeiro grau com diagnóstico de doenças cardiovasculares? Qual parentesco e qual doença?", type: "textarea" },
      { key: "horasSono", label: "Quantas horas por noite você dorme?", type: "radio", options: ["Menos que 6 horas", "Entre 6 e 7 horas", "8 ou mais horas"] },
      { key: "qualidadeSono", label: "Como você classificaria a qualidade do seu sono?", type: "radio", options: ["Baixa", "Regular", "Bom", "Ótima"] },
      { key: "ronca", label: "Algum parente já te disse que você ronca quando dorme?", type: "radio", options: SIM_NAO },
      { key: "acordaCansado", label: "Você acorda se sentindo cansado(a)?", type: "radio", options: ["Quase sempre", "Às vezes", "Não"] },
      { key: "memoria", label: "Dê uma nota de 0 (ruim) a 10 (excelente) pra sua memória", type: "scale" },
      { key: "esquecimento", label: "Nos últimos 30 dias teve algum episódio de esquecimento?", type: "radio", options: SIM_NAO },
      { key: "atividadeAtual", label: "Atualmente, faz algum tipo de atividade física? Qual, quantas vezes por semana e quantos minutos por sessão?", type: "textarea" },
      { key: "sintomasDurante", label: "Durante a prática de atividade física, já sentiu algum desses sintomas?", type: "checkbox", options: ["Dor no peito", "Dor de cabeça", "Visão escurecida", "Sensação de desmaio", "Vômito", "Palpitação", "Desmaio", "Queda de pressão", "Nenhum desses"] },
      { key: "sintomasApos", label: "Após o término da atividade física, já sentiu algum desses sintomas?", type: "checkbox", options: ["Dor no peito", "Dor de cabeça", "Visão escurecida", "Sensação de desmaio", "Vômito", "Palpitação", "Desmaio", "Queda de pressão", "Nenhum desses"] },
      { key: "objetivos", label: "Quais seus objetivos com o programa de treinamento?", type: "checkbox", options: ["Emagrecer", "Ganhar massa muscular", "Ajudar no controle da hipertensão arterial", "Diminuir dores no corpo", "Melhorar o sono", "Outro(s)"] },
    ],
  },

  // Capítulo 16 — Modelo de anamnese inteligente para cliente na fase pós-covid
  poscovid: {
    slug: "poscovid",
    titulo: "Vamos retomar seu condicionamento com cuidado",
    subtitulo: "Algumas perguntas sobre como foi a covid pra você.",
    temNivel: true,
    extras: [
      { key: "objetivos", label: "Quais são os seus objetivos com a prática de exercício físico?", type: "checkbox", options: ["Prevenção", "Condicionamento Físico", "Lazer", "Estética", "Outro(s)"] },
      { key: "disponibilidade", label: "Qual é a sua disponibilidade para treinar? (dias por semana e minutos por dia)", type: "text", placeholder: "Ex: 3 dias, 45 minutos" },
      { key: "modalidadesGosta", label: "Quais tipos de exercício físico você gosta?", type: "checkbox", options: MODALIDADES },
      { key: "naoGosta", label: "Existe alguma coisa que você NÃO GOSTA de fazer durante a prática do exercício?", type: "textarea" },
      { key: "doencaDiagnosticada", label: "Apresenta alguma doença diagnosticada pelo médico? Qual(is)? Quais remédios está tomando?", type: "textarea" },
      { key: "teveCovid", label: "Você teve contato com o novo Coronavírus?", type: "radio", options: SIM_NAO },
      { key: "quandoCovid", label: "Quando soube que teve contato com o Coronavírus? (data aproximada)", type: "text" },
      { key: "precisouAtendimento", label: "Precisou de atendimento médico?", type: "radio", options: SIM_NAO },
      { key: "ondeTratamento", label: "O tratamento foi realizado em:", type: "radio", options: ["Casa", "Hospital, sem UTI", "Hospital na UTI, sem respirador", "Hospital na UTI, com respirador"] },
      { key: "diasInternado", label: "Se ficou internado(a), quantos dias (e em qual dessas situações)?", type: "text" },
      { key: "sintomasHoje", label: "Hoje, quais sintomas você apresenta?", type: "checkbox", options: ["Fadiga", "Dores articulares ou musculares", "Sensação de fraqueza", "Insônia", "Dificuldade de respirar mesmo em repouso", "Dificuldade de respirar durante uma caminhada", "Dificuldade de respirar durante algum esforço", "Sensação de ardência na perna ao fazer esforço", "Outro(s)"] },
      { key: "dorRepousoRegioes", label: "Atualmente sente dor ou desconforto muscular EM REPOUSO? Onde?", type: "checkbox", options: REGIOES_DOR },
      { key: "dorRepousoNota", label: "Nota de 0 (sem dor) a 10 (insuportável) pra essa dor em repouso", type: "scale" },
      { key: "dorExercicioRegioes", label: "E DURANTE o exercício físico, sente dor? Onde?", type: "checkbox", options: REGIOES_DOR },
      { key: "dorExercicioNota", label: "Nota de 0 (sem dor) a 10 (insuportável) pra essa dor durante o exercício", type: "scale" },
      { key: "dorNoPeito", label: "Sente dor no peito quando realiza exercício físico?", type: "radio", options: SIM_NAO },
      { key: "perdaEquilibrio", label: "Já perdeu o equilíbrio por causa de tontura ou alguma vez perdeu a consciência?", type: "radio", options: SIM_NAO },
      { key: "desconfortoDiaDia", label: "Sente desconforto em movimentos do dia a dia (casa, trabalho, escadas, caminhar, correr)? Quais e qual a dificuldade?", type: "textarea" },
    ],
  },

  // Capítulo 17 — Modelo de anamnese inteligente para cliente com depressão
  depressao: {
    slug: "depressao",
    titulo: "Vamos montar um plano que cabe no seu momento",
    subtitulo: "Algumas perguntas pra eu te ajudar da melhor forma.",
    temNivel: true,
    extras: [
      { key: "tempoDiagnostico", label: "Quanto tempo faz que você soube que tinha Depressão?", type: "radio", options: ["Menos de 1 ano", "Entre 1 e 2 anos", "Entre 3 e 5 anos", "6 ou mais anos"] },
      { key: "farmacos", label: "Atualmente, faz uso de algum fármaco para controlar os sintomas? Quais?", type: "textarea" },
      { key: "outroProblema", label: "Atualmente, é de seu conhecimento ter algum outro problema de saúde?", type: "checkbox", options: ["Excesso de peso ou obesidade", "Diabetes tipo 1", "Diabetes tipo 2", "Hipertensão arterial", "Colesterol elevado", "Esteatose hepática (gordura no fígado)", "Doença artéria coronariana", "Doença renal", "Insuficiência cardíaca", "Câncer", "Asma", "Nenhum desses"] },
      { key: "autoestima", label: "Dê uma nota de 0 (baixa) a 10 (elevada) pra sua autoestima hoje", type: "scale" },
      { key: "sintomas", label: "Você apresenta algum desses sintomas?", type: "checkbox", options: ["Muito sono durante o dia", "Vontade de sumir", "Vontade de não sair de casa", "Cansaço generalizado", "Palpitação", "Tremedeira", "Sem vontade de comer", "Vontade de comer toda hora", "Outro(s)"] },
      { key: "qualidadeSono", label: "Como você classificaria a qualidade do seu sono?", type: "scale" },
      { key: "horasSono", label: "Quantas horas por noite você dorme?", type: "text" },
      { key: "sensacaoAcordar", label: "Ao acordar, qual a sensação que você tem?", type: "radio", options: ["Totalmente descansado(a)", "Parcialmente descansado(a)", "Cansado(a)"] },
      { key: "exercicioAtual", label: "Atualmente, faz algum tipo de exercício físico? Qual, quantos dias por semana, quantos minutos por dia e qual intensidade?", type: "textarea" },
      { key: "sintomasExercicio", label: "Alguma vez, durante a prática de exercício, sentiu algum desses sintomas?", type: "checkbox", options: ["Tontura", "Vômito", "Tosse", "Sensação de fraqueza", "Sensação de desmaio", "Visão escurecer", "Formigamento nos dedos", "Espasmo (tremedeira)", "Nenhum desses"] },
      { key: "objetivos", label: "Quais são seus objetivos com o programa de treinamento?", type: "checkbox", options: ["Controlar os sintomas da depressão", "Emagrecer", "Ganhar força e massa muscular", "Diminuir dor corporal", "Outro(s)"] },
      { key: "ultimaVisitaMedica", label: "Quanto tempo faz da sua última visita ao médico pra controle da Depressão?", type: "radio", options: ["Menos de 6 meses", "Entre 6 meses e 1 ano", "Mais de 1 ano"] },
      { key: "modalidadesGosta", label: "Quais tipos de exercício físico você gosta de fazer?", type: "checkbox", options: MODALIDADES },
      { key: "modalidadesNaoGosta", label: "Quais tipos de exercício físico você NÃO gosta de fazer?", type: "checkbox", options: MODALIDADES },
      { key: "gostaMusica", label: "Você gosta de ouvir música? Quais músicas ou cantores você gosta?", type: "textarea" },
      { key: "dorUltimos7Dias", label: "Nos últimos 7 dias, você sentiu alguma dor no corpo? Onde?", type: "checkbox", options: REGIOES_DOR },
    ],
  },
};

export const TIPO_LABELS: Record<string, string> = {
  comum: "Homem ou mulher comum",
  emagrecimento: "Emagrecimento",
  idoso: "Terceira idade",
  gestante: "Gestante",
  posparto: "Pós-parto",
  obesidade: "Obesidade",
  diabetes: "Diabetes",
  hipertensao: "Hipertensão arterial",
  poscovid: "Pós-covid",
  depressao: "Depressão",
};
