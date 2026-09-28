// @ts-check
import { DIM, PHRASES } from './data.js';
import { answerScore } from './scoring.js';
import { fmtLiters } from '../lib/format.js';

/**
 * Textos personalizados do resultado. Tudo aqui é função pura das respostas,
 * para poder ser testado com todas as combinações possíveis.
 *
 * @typedef {import('./data.js').DimKey} DimKey
 * @typedef {import('./scoring.js').Answers} Answers
 * @typedef {import('./scoring.js').Result} Result
 * @typedef {{ text: string, tip: string }} Insight
 */

/** Como cada área aparece no meio de uma frase. */
export const DIM_IN_SENTENCE = {
  rotina: 'a rotina',
  disciplina: 'a constância',
  sono: 'o sono',
  alimentacao: 'a alimentação',
  praticidade: 'a falta de praticidade pra treinar',
  agua: 'a água',
  resistencia: 'o fôlego',
};

/** @param {string} s */
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
/** @param {Answers} a @param {string} id */
const val = (a, id) => String(a[id] ?? '');
/** @param {Answers} a @param {string} id */
const good = (a, id) => (answerScore(id, a) ?? 0) >= 60;
/** Junta duas orações com "e" quando concordam e "mas" quando se contradizem. */
const join = (/** @type {string} */ first, /** @type {string} */ second, /** @type {boolean} */ agree) =>
  agree ? `${first} e ${second}` : `${first}, mas ${second}`;

/** @param {Result} r @param {DimKey} key */
const band = (r, key) => r.bands[key]?.key ?? 'critico';

/** @type {Record<DimKey, (a: Answers, r: Result) => Insight>} */
const BUILDERS = {
  rotina(a, r) {
    const dia = {
      fixo: 'Seus horários se repetem quase todo dia.',
      base: 'Seu dia tem uma base de horários, mas com bastante improviso.',
      variavel: 'Cada dia seu é diferente do outro.',
      caos: 'Seu dia é apagar um incêndio atrás do outro.',
    }[val(a, 'r_dia')] ?? '';
    const plano = {
      sempre: 'Você organiza a semana antes dela começar.',
      asvezes: 'A semana só é planejada de vez em quando.',
      raro: 'A semana quase nunca é planejada.',
      nunca: 'A semana começa sem plano nenhum.',
    }[val(a, 'r_plano')] ?? '';
    const b = band(r, 'rotina');
    const end = {
      critico: 'Assim, treino e comida viram "se der tempo", e quase nunca dá.',
      atencao: 'Quando o dia aperta, o treino costuma ser a primeira coisa a cair.',
      forte: 'Isso deixa treino e refeição quase no automático.',
    }[b];
    const tip = {
      critico: 'Escolha um horário fixo de treino, 3 vezes na semana, e coloque um alarme pra ele.',
      atencao: 'Separe 10 minutos no domingo pra marcar os treinos da semana na agenda.',
      forte: 'Trate o treino como compromisso: dia e hora marcados, igual reunião.',
    }[b];
    return { text: `${dia} ${plano} ${end}`, tip };
  },

  sono(a, r) {
    const horas = PHRASES.s_horas[val(a, 's_horas')] ?? '';
    const acordar = PHRASES.s_acordar[val(a, 's_acordar')] ?? '';
    const regular = {
      igual: 'E mantém o mesmo horário até no fim de semana.',
      '1-2h': 'No fim de semana, o horário muda umas 1 ou 2 horas.',
      '3h+': 'No fim de semana, o horário muda 3 horas ou mais, e o corpo sente isso como um fuso horário toda segunda-feira.',
      sem: 'E não existe um horário fixo pra dormir.',
    }[val(a, 's_regular')] ?? '';
    const b = band(r, 'sono');
    const end = {
      critico: 'Com esse sono, o corpo sente mais fome, tem menos disposição pra treinar e se recupera pior.',
      atencao: 'Dá pra melhorar, e quando o sono melhora, a fome e a disposição melhoram junto.',
      forte: 'Isso ajuda a controlar a fome e a recuperar o corpo depois do treino.',
    }[b];
    let tip = 'Se treinar à noite, termine pelo menos 2 horas antes de deitar.';
    if (['<5', '5-6', '6-7'].includes(val(a, 's_horas'))) tip = 'Escolha um horário pra deitar que garanta 7 horas de sono e deixe o celular fora da cama 30 minutos antes.';
    else if (['3h+', 'sem'].includes(val(a, 's_regular'))) tip = 'Tente não variar mais que 1 hora entre a semana e o fim de semana, na hora de deitar e de acordar.';
    else if (['sono', 'exausto'].includes(val(a, 's_acordar'))) tip = 'Pegue luz do dia logo cedo e evite café depois das 16h.';
    return { text: `Você dorme ${horas} e acorda ${acordar}. ${regular} ${end}`, tip };
  },

  alimentacao(a, r) {
    const ultra = {
      nunca: 'Ultraprocessado quase nunca entra no seu prato',
      '1-2': 'Ultraprocessado entra 1 ou 2 dias por semana',
      '3-5': 'Ultraprocessado entra de 3 a 5 dias por semana',
      todo: 'Ultraprocessado entra todo dia',
    }[val(a, 'a_ultra')] ?? '';
    const verde = {
      sempre: 'fruta, verdura e legume aparecem em quase toda refeição.',
      '1x': 'fruta, verdura e legume aparecem uma vez por dia.',
      semana: 'fruta, verdura e legume só aparecem algumas vezes na semana.',
      raro: 'fruta, verdura e legume quase não aparecem.',
    }[val(a, 'a_verde')] ?? '';
    const emocional = {
      nada: 'O emocional não decide o que você come.',
      exagero: 'Às vezes o estresse decide o que vai pro prato.',
      desconto: 'Quando o emocional aperta, a comida vira válvula de escape.',
      esqueco: 'Quando o estresse aperta, você esquece de comer, e isso costuma virar exagero depois.',
    }[val(a, 'a_emocional')] ?? '';
    const b = band(r, 'alimentacao');
    const end = {
      critico: 'Do jeito que está, qualquer treino fica brigando contra o prato.',
      atencao: 'Tem coisa boa aí, falta acertar o que ainda puxa pra trás.',
      forte: 'É uma base difícil de construir, e você já tem.',
    }[b];
    const worst = ['a_ultra', 'a_verde', 'a_emocional']
      .map((id) => ({ id, s: answerScore(id, a) ?? 100 }))
      .sort((x, y) => x.s - y.s)[0];
    const tip = worst.s >= 70
      ? 'Agora dá pra ajustar quantidade e proteína pro seu objetivo.'
      : {
          a_ultra: 'Troque um ultraprocessado por dia por comida de verdade. Uma troca por vez.',
          a_verde: 'Monte o prato começando por metade de verdura e legume. O resto se ajusta.',
          a_emocional: 'Quando bater vontade de comer por estresse, beba um copo de água e espere 10 minutos antes de decidir.',
        }[worst.id];
    return { text: `${join(ultra, verde, good(a, 'a_ultra') === good(a, 'a_verde'))} ${emocional} ${end}`, tip };
  },

  agua(a, r) {
    const { targetL, intakeL } = r.water;
    const first = intakeL > 0
      ? `Você bebe cerca de ${fmtLiters(intakeL)} de água por dia e a sua meta é de ${fmtLiters(targetL)}.`
      : `Você quase não bebe água pura, e a sua meta é de ${fmtLiters(targetL)} por dia.`;
    const urina = {
      palha: 'A cor da urina mostra uma boa hidratação.',
      clara: 'A cor da urina está boa, mas dá pra melhorar.',
      escura: 'A urina amarelo-escura confirma que está faltando água.',
      cha: 'A urina bem escura é um sinal claro de que falta água.',
    }[val(a, 'h_urina')] ?? '';
    const ratio = r.water.ratio;
    const end = ratio >= 0.95 ? 'Hidratação em dia.'
      : ratio >= 0.7 ? 'Falta pouco pra chegar lá.'
      : 'Pouca água pesa na energia, no humor e na concentração ao longo do dia.';
    const gapGlasses = Math.ceil(Math.max(0, targetL - intakeL) / 0.25);
    const tip = gapGlasses > 0
      ? `Deixe uma garrafa de 1 litro à vista e beba ${gapGlasses} ${gapGlasses === 1 ? 'copo' : 'copos'} a mais por dia.`
      : 'Nos dias de treino, beba um copo a mais pra cada 30 minutos de exercício.';
    return { text: `${first} ${urina} ${end}`, tip };
  },

  praticidade(a, r) {
    const tempo = PHRASES.p_tempo[val(a, 'p_tempo')] ?? '';
    const local = {
      academia: 'e uma academia perto',
      'casa-equip': 'e algum equipamento em casa',
      casa: 'em casa, sem equipamento',
      rua: 'ao ar livre',
      nenhum: 'e hoje não tem onde',
    }[val(a, 'p_local')] ?? '';
    const bloqueio = val(a, 'p_bloqueio');
    const obstacle = bloqueio && bloqueio !== 'nada'
      ? `O que mais atrapalha é ${PHRASES.p_bloqueio[bloqueio]}.`
      : 'E nada te impede de treinar hoje.';
    const b = band(r, 'praticidade');
    const end = {
      critico: 'Do jeito que está, o treino fica sempre pra depois.',
      atencao: 'Dá pra treinar, só falta um treino que caiba no tempo e no lugar que você tem.',
      forte: 'A parte difícil, que é ter como treinar, já está resolvida.',
    }[b];
    const tip = {
      tempo: 'Treinos de 15 a 25 minutos resolvem. Não precisa de 1 hora por dia.',
      cansaco: 'Treine logo que chegar em casa, antes de sentar no sofá. Ou de manhã, antes do dia te cansar.',
      sabe: 'Com o treino pronto e o vídeo de cada exercício, você só precisa apertar o play.',
      dinheiro: 'Treino em casa, sem equipamento, já dá resultado no começo.',
      vergonha: 'Começar em casa tira a pressão. Ninguém precisa ver o seu primeiro treino.',
      nada: 'Mantenha a frequência e aumente a carga aos poucos.',
    }[bloqueio] ?? 'Comece com 3 treinos curtos por semana, no horário que você já tem livre.';
    return { text: `Você tem ${tempo} pra treinar ${local}. ${obstacle} ${end}`, tip };
  },

  resistencia(a, r) {
    const escada = {
      boa: 'Três andares de escada não te tiram o fôlego',
      leve: 'Três andares de escada te deixam um pouco ofegante',
      forte: 'Três andares de escada já te obrigam a parar',
      evito: 'Você evita escada porque falta fôlego',
    }[val(a, 'e_escada')] ?? '';
    const caminhada = {
      '30+': 'você caminha rápido por mais de 30 minutos.',
      '15-30': 'você aguenta de 15 a 30 minutos de caminhada rápida.',
      '5-15': 'a caminhada rápida para entre 5 e 15 minutos.',
      '<5': 'a caminhada rápida não passa de 5 minutos.',
    }[val(a, 'e_caminhada')] ?? '';
    const b = band(r, 'resistencia');
    const end = {
      critico: 'Seu fôlego está abaixo do que o dia a dia pede, e isso faz qualquer treino parecer pesado demais.',
      atencao: 'O fôlego dá conta do básico, mas ainda cansa cedo. É uma área que costuma melhorar rápido com treino.',
      forte: 'Isso te dá margem pra treinos mais intensos.',
    }[b];
    const tip = {
      critico: 'Comece com caminhadas de 10 minutos em ritmo firme e some 5 minutos por semana.',
      atencao: 'Inclua 2 treinos curtos e intensos por semana, no estilo HIIT.',
      forte: 'Use essa base pra buscar força e definição.',
    }[b];
    return { text: `${join(escada, caminhada, good(a, 'e_escada') === good(a, 'e_caminhada'))} ${end}`, tip };
  },

  disciplina(a, r) {
    const freq = {
      '0': 'Hoje você não se exercita nenhum dia da semana',
      '1-2': 'Hoje você se exercita 1 ou 2 dias por semana',
      '3-4': 'Hoje você se exercita 3 ou 4 dias por semana',
      '5+': 'Hoje você se exercita 5 dias ou mais por semana',
    }[val(a, 'd_freq')] ?? '';
    const recomeco = {
      manteve: 'mantém o que começa.',
      poucas: 'já começou e parou uma ou duas vezes.',
      varias: 'já perdeu as contas de quantas vezes começou e parou.',
      nunca: 'nunca chegou a começar de verdade.',
    }[val(a, 'd_recomeco')] ?? '';
    const falha = {
      volta: 'Quando sai do plano, você volta no dia seguinte.',
      dias: 'Quando sai do plano, leva uns dias pra retomar.',
      semana: 'Quando sai do plano, larga o resto da semana.',
      para: 'Quando sai do plano, para de vez.',
    }[val(a, 'd_falha')] ?? '';
    const b = band(r, 'disciplina');
    const end = {
      critico: 'O problema costuma ser tentar mudar tudo de uma vez, sem nada que te segure quando a motivação acaba.',
      atencao: 'A constância ainda depende da motivação do dia.',
      forte: 'Essa é a parte mais difícil, e você já tem.',
    }[b];
    const tip = {
      critico: 'Troque a meta de perfeição por uma regra simples: nunca falhar dois dias seguidos.',
      atencao: 'Deixe o treino com dia e hora marcados. Quando está na agenda, não depende de vontade.',
      forte: 'Agora é hora de um plano à altura da sua disciplina.',
    }[b];
    return { text: `${join(freq, recomeco, good(a, 'd_freq') === good(a, 'd_recomeco'))} ${falha} ${end}`, tip };
  },
};

/** @param {DimKey} key @param {Answers} answers @param {Result} result @returns {Insight} */
export function dimensionInsight(key, answers, result) {
  const built = BUILDERS[key](answers, result);
  return { text: built.text.replace(/\s+/g, ' ').trim(), tip: built.tip };
}

/** Frase principal do resultado. @param {Result} r @param {string} name */
export function headline(r, name) {
  const [w1, w2] = r.ranked;
  const lead = name ? `${name}, ` : '';
  const fix = (/** @type {string} */ s) => (name ? s : cap(s));
  if ((r.dims[w1] ?? 0) >= 70) return `${lead}${fix('sua base está forte. Agora o ganho vem do ajuste fino.')}`;
  if (!w2 || (r.dims[w2] ?? 0) >= 70) return `${lead}${fix(`${DIM_IN_SENTENCE[w1]} é o que mais segura a sua evolução.`)}`;
  return `${lead}${fix(`${DIM_IN_SENTENCE[w1]} e ${DIM_IN_SENTENCE[w2]} estão segurando a sua evolução.`)}`;
}

/** Três passos do plano, começando pelas duas áreas mais fracas. @param {Answers} a @param {Result} r */
export function planSteps(a, r) {
  const [w1, w2] = r.ranked;
  const local = {
    academia: 'na academia', 'casa-equip': 'em casa', casa: 'em casa, sem equipamento', rua: 'em casa ou ao ar livre', nenhum: 'em casa, sem equipamento',
  }[val(a, 'p_local')] ?? 'em casa ou na academia';
  const tempo = {
    '<15': '15 a 20 minutos', '15-30': '15 a 30 minutos', '30-45': '30 a 45 minutos', '60+': 'até 1 hora',
  }[val(a, 'p_tempo')] ?? '15 a 30 minutos';
  const goal = PHRASES.objetivo[val(a, 'objetivo')] ?? 'cuidar da saúde';
  return [
    { when: 'Semana 1', dim: w1, title: DIM[w1].label, text: dimensionInsight(w1, a, r).tip },
    { when: 'Semana 2', dim: w2, title: DIM[w2].label, text: dimensionInsight(w2, a, r).tip },
    {
      when: 'Da semana 3 em diante', dim: null, title: 'Plano completo',
      text: `Treinos de ${tempo} ${local}, com dieta pensada pra ${goal}. E suporte no WhatsApp pra você não parar.`,
    },
  ];
}

/** Tela de transição depois das perguntas de sono. @param {Answers} a */
export function sleepInsight(a) {
  const h = val(a, 's_horas');
  if (['<5', '5-6', '6-7'].includes(h)) {
    return {
      title: 'Dormir pouco dá fome.',
      stat: '+385', statLabel: 'kcal por dia',
      text: 'Numa revisão de estudos publicada em 2017, quem dormiu menos do que precisava comeu, em média, 385 kcal a mais por dia. É como um lanche extra todo dia, sem perceber.',
    };
  }
  if (h === '9+') {
    return {
      title: 'Muito sono também conta.',
      stat: '9h+', statLabel: 'por noite',
      text: 'Dormir mais de 9 horas com frequência pode ser sinal de um sono que não descansa. Se mesmo assim o cansaço não passa, vale conversar com um médico.',
    };
  }
  return {
    title: 'Seu sono joga a seu favor.',
    stat: '7 a 9h', statLabel: 'por noite',
    text: 'Dormir de 7 a 9 horas ajuda a controlar a fome e a recuperar o corpo depois do treino. Muita gente que começa a treinar não tem essa base.',
  };
}

/** Tela de transição com a meta de água. @param {Result} r */
export function waterInsight(r) {
  const { targetL, intakeL } = r.water;
  const gap = Math.max(0, Math.round((targetL - intakeL) * 10) / 10);
  return {
    title: `Sua meta: ${fmtLiters(targetL)} de água por dia`,
    gapText: gap > 0 ? `Hoje você bebe cerca de ${fmtLiters(intakeL)}. Faltam ${fmtLiters(gap)} por dia.` : `Hoje você bebe cerca de ${fmtLiters(intakeL)}. Você já chega lá. Boa!`,
    text: 'Estudos com adultos saudáveis mostram que perder cerca de 1,5% do peso em água já basta pra piorar o humor e a concentração.',
  };
}
