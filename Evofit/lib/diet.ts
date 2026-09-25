import type { AnamneseData } from "./types";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DietItem {
  name: string;
  cals: number;
}

export interface DietMeal {
  id: string;
  label: string;
  time: string;
  emoji: string;
  photo: string;
  kcal: number;
  items: DietItem[];
}

export interface DayDiet {
  totalKcal: number;
  protein: number;
  carbs: number;
  fat: number;
  waterGoal: number;
  meals: DietMeal[];
}

// ─── Objetivo → perfil metabólico ───────────────────────────────────────────
// Baseado em: (1) déficit calórico é o que determina emagrecimento, com
// proteína alta (2.0-2.2g/kg) pra preservar massa magra durante o déficit
// (revisões de recomposição corporal); (2) hipertrofia se beneficia de
// proteína 1.6-2.2g/kg e carboidrato 4-7g/kg pra sustentar performance e
// glicogênio (RBNE, EVINCI-UniBrasil); (3) treino de condicionamento/fôlego
// (predominantemente aeróbico) tem maior dependência de carboidrato como
// combustível, com proteína um pouco mais moderada; (4) saúde geral/
// disposição segue um padrão equilibrado, estilo mediterrâneo.

type Objetivo = "emagrecer" | "musculo" | "condicionamento" | "saude";

function classifyObjetivo(objetivo: string): Objetivo {
  const obj = objetivo.toLowerCase();
  if (obj.includes("emagrec") || obj.includes("perda") || obj.includes("gordu")) return "emagrecer";
  if (obj.includes("hiper") || obj.includes("múscu") || obj.includes("muscu") || obj.includes("ganho")) return "musculo";
  if (obj.includes("condiciona") || obj.includes("fôlego") || obj.includes("folego") || obj.includes("resist")) return "condicionamento";
  return "saude"; // "disposição e saúde" e qualquer outro caso — perfil equilibrado
}

const GOAL_PROFILE: Record<Objetivo, { kcalAdj: number; proteinPerKg: number; fatPct: number }> = {
  emagrecer:      { kcalAdj: 0.82, proteinPerKg: 2.2, fatPct: 0.27 },
  musculo:        { kcalAdj: 1.10, proteinPerKg: 2.0, fatPct: 0.25 },
  condicionamento:{ kcalAdj: 1.00, proteinPerKg: 1.6, fatPct: 0.22 }, // mais carboidrato (combustível aeróbico)
  saude:          { kcalAdj: 1.00, proteinPerKg: 1.6, fatPct: 0.27 },
};

// Multiplicador de escala por papel do alimento, além do fator calórico base —
// é o que faz a dieta mudar de COMPOSIÇÃO (não só de tamanho) por objetivo.
// Emagrecer: seguram proteína (preserva massa magra no déficit) e vegetais
// (saciedade/fibra), cortam mais de carboidratos refinados.
// Músculo: sobe proteína e carboidrato (performance/glicogênio).
// Condicionamento: prioriza carboidrato (combustível), proteína mais neutra.
// Saúde: mantém tudo proporcional (perfil já é o equilibrado).
const ROLE_MULT: Record<Objetivo, Record<"protein" | "carb" | "veg" | "extra", number>> = {
  emagrecer:       { protein: 1.15, carb: 0.85, veg: 1.20, extra: 0.90 },
  musculo:         { protein: 1.10, carb: 1.10, veg: 1.00, extra: 0.90 },
  condicionamento: { protein: 0.95, carb: 1.15, veg: 1.05, extra: 0.90 },
  saude:           { protein: 1.00, carb: 1.00, veg: 1.00, extra: 1.00 },
};

function calcTargetKcal(anamnese: AnamneseData, goal: Objetivo): number {
  const weight = Number(anamnese.peso)   || 70;
  const height = Number(anamnese.altura) || 170;
  const age    = Number(anamnese.idade)  || 30;
  const isFemale = (anamnese.sexo ?? "").toLowerCase().includes("fem");

  const bmr = isFemale
    ? 10 * weight + 6.25 * height - 5 * age - 161
    : 10 * weight + 6.25 * height - 5 * age + 5;

  const dias = Number(anamnese.diasTreino) || 3;
  const activity =
    dias <= 1 ? 1.2  : dias === 2 ? 1.375 :
    dias === 3 ? 1.55 : dias === 4 ? 1.65 : 1.725;

  return Math.round((bmr * activity * GOAL_PROFILE[goal].kcalAdj) / 50) * 50;
}

function calcMacros(targetKcal: number, weight: number, goal: Objetivo) {
  const profile = GOAL_PROFILE[goal];
  const protein = Math.round(weight * profile.proteinPerKg);
  const fat     = Math.round((targetKcal * profile.fatPct) / 9);
  const carbs   = Math.max(0, Math.round((targetKcal - protein * 4 - fat * 9) / 4));
  return { protein, fat, carbs };
}

// ─── Diabetes e colesterol/cardiovascular — trocas de qualidade ─────────────
// Diabetes (Diretriz SBD): controle do índice/carga glicêmica, preferir
// carboidrato integral e fruta inteira (com fibra) em vez de suco, evitar
// açúcar adicionado — reduz picos de glicemia sem cortar a comida que a
// pessoa já come, só troca a versão.
// Colesterol/cardiovascular (Diretriz Brasileira de Dislipidemias — SBC):
// priorizar alimentos minimamente processados, reduzir gordura saturada,
// priorizar fibra solúvel (aveia). Reduz a gordura em vez de trocar por
// azeite — azeite é bom pro coração, mas custa muito mais que margarina no
// mercado, e a dieta precisa continuar barata e fácil de achar.
// Feito como troca de NOME (mesma caloria aproximada) em vez de reescrever
// a dieta inteira — a pessoa continua comendo comida parecida, só a versão
// mais adequada pra condição dela.

const DIABETES_SWAPS: Record<string, string> = {
  "Pão de fôrma (2 fatias)": "Pão integral de fôrma (2 fatias)",
  "Pão francês (1 un) com margarina": "Pão francês integral (1 un)",
  "Pão francês (2 un) com requeijão light": "Pão francês integral (2 un) com requeijão light",
  "Arroz branco (5 col. sopa)": "Arroz integral (5 col. sopa)",
  "Arroz branco (3 col. sopa)": "Arroz integral (3 col. sopa)",
  "Mel (1 col. chá)": "Canela em pó (pitada)",
  "Batata cozida (200g)": "Batata doce cozida (200g)",
  "Suco de laranja natural (300ml)": "Laranja (2 unidades)",
  "Tapioca (2 un) com ovo mexido": "Tapioca (1 un) com ovo mexido e queijo",
  "Cuscuz nordestino (100g)": "Cuscuz nordestino (80g) com ovo extra",
};

const CARDIO_SWAPS: Record<string, string> = {
  "Pão francês (1 un) com margarina": "Pão francês (1 un) puro",
  "Carne moída refogada (150g)": "Carne moída magra (patinho) refogada (150g)",
  "Frango assado (180g)": "Frango assado sem pele (180g)",
  "Frango assado (200g)": "Frango assado sem pele (200g)",
};

function applyHealthSwaps(items: RawItem[], injuries: string[]): RawItem[] {
  const hasDiabetes = injuries.includes("Diabetes");
  const hasCardio = injuries.includes("Cardiovascular");
  if (!hasDiabetes && !hasCardio) return items;
  return items.map((item) => {
    const swapped = (hasDiabetes && DIABETES_SWAPS[item.name])
      || (hasCardio && CARDIO_SWAPS[item.name])
      || item.name;
    return swapped === item.name ? item : { ...item, name: swapped };
  });
}

// ─── Fotos por tipo de refeição ───────────────────────────────────────────────
//  IDs diretos do Unsplash CDN (images.unsplash.com) — sem redirect, carregamento rápido.
//  Cada refeição tem 3–4 opções que rodam pelo dia da semana para dar variedade.

const MEAL_PHOTOS: Record<string, string[]> = {
  cafe: [
    "photo-1525351484163-7529414344d8", // ovos mexidos com brinde
    "photo-1517673408391-9478f19e7cd0", // mingau de aveia com mel
    "photo-1484980859668-29a8b3dc0e42", // café da manhã completo
    "photo-1506084868230-bb9d95c24759", // panquecas
  ],
  lanche1: [
    "photo-1490474418585-ba9bad8fd0ea", // mix de frutas frescas
    "photo-1571771894821-ce9b6c11b08e", // banana
    "photo-1568702846914-96b305d2aaeb", // maçã
  ],
  almoco: [
    "photo-1504674900247-0877df9cc836", // prato colorido (frango + arroz)
    "photo-1519708227418-c8fd9a32b7a2", // peixe grelhado com acompanhamento
    "photo-1546069901-ba9599a7b8f2",    // bowl colorido de almoço
    "photo-1498654896293-37aaa09c5bb8", // frango com arroz e salada
  ],
  lanche2: [
    "photo-1505252585461-04db1eb84625", // vitamina / smoothie
    "photo-1488477181946-6428a0291777", // iogurte com frutas
  ],
  jantar: [
    "photo-1510693206972-df098062cb71", // omelete / ovos
    "photo-1473093295043-cdd812d0e601", // macarrão
    "photo-1547592180-85f173990554",    // sopa quente
  ],
};

function getPhoto(mealId: string, dayIndex: number): string {
  const pool = MEAL_PHOTOS[mealId] ?? MEAL_PHOTOS["almoco"];
  const photoId = pool[dayIndex % pool.length];
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=600&h=280&q=80`;
}

// ─── Cardápios acessíveis (comida brasileira do dia a dia) ────────────────────
//
//  ✓ Arroz branco em vez de integral — mesmas calorias, muito mais acessível
//    (trocado por integral automaticamente pra quem tem diabetes — ver DIABETES_SWAPS)
//  ✓ Sem granola — amendoim, biscoito, aveia simples, frutas baratas
//  ✓ Sem whey — proteína vem de ovo, frango, atum em lata, carne moída
//  ✓ Frutas acessíveis: banana, laranja, mamão, melancia, maçã
//  ✓ Proteínas baratas: frango, ovo, atum em lata, carne moída, queijo minas
//
//  Cada item tem um "role" (papel nutricional) usado pra ajustar a composição
//  da dieta por objetivo sem reescrever o cardápio inteiro — ver ROLE_MULT.
//  protein = fonte de proteína principal · carb = grão/amido/pão/massa
//  veg = vegetal, salada, legume (feijão) ou fruta inteira (fibra/saciedade)
//  extra = gordura, laticínio de acompanhamento, tempero — neutro

type Role = "protein" | "carb" | "veg" | "extra";
type RawItem = { name: string; cals: number; role: Role };
type RawMeal = { id: string; label: string; time: string; emoji: string; items: RawItem[] };

const BASE_MENUS: RawMeal[][] = [

  /* 0 – Domingo ≈ 1840 kcal */ [
    { id:"cafe",    label:"Café da manhã",   time:"07:00", emoji:"🌅", items:[
      { name:"Ovos mexidos (3 un)", cals:210, role:"protein" },
      { name:"Pão de fôrma (2 fatias)", cals:130, role:"carb" },
      { name:"Café com leite integral (200ml)", cals:60, role:"extra" },
      { name:"Mamão papaia (150g)", cals:60, role:"veg" },
    ]},
    { id:"lanche1", label:"Lanche da manhã", time:"10:00", emoji:"🍌", items:[
      { name:"Banana (1 média)", cals:90, role:"veg" },
      { name:"Amendoim torrado sem sal (30g)", cals:175, role:"extra" },
    ]},
    { id:"almoco",  label:"Almoço",           time:"13:00", emoji:"🍽️", items:[
      { name:"Frango grelhado (150g)", cals:200, role:"protein" },
      { name:"Arroz branco (5 col. sopa)", cals:150, role:"carb" },
      { name:"Feijão carioca (1 concha)", cals:120, role:"veg" },
      { name:"Salada de alface e tomate", cals:30, role:"veg" },
      { name:"Cenoura cozida (80g)", cals:35, role:"veg" },
    ]},
    { id:"lanche2", label:"Lanche da tarde",  time:"16:00", emoji:"🥛", items:[
      { name:"Vitamina de banana com leite (300ml)", cals:200, role:"protein" },
      { name:"Aveia em flocos (30g)", cals:115, role:"carb" },
    ]},
    { id:"jantar",  label:"Jantar",            time:"19:30", emoji:"🌙", items:[
      { name:"Omelete de queijo (3 ovos)", cals:250, role:"protein" },
      { name:"Batata cozida (200g)", cals:155, role:"carb" },
      { name:"Salada de pepino e tomate", cals:30, role:"veg" },
    ]},
  ],

  /* 1 – Segunda ≈ 1810 kcal */ [
    { id:"cafe",    label:"Café da manhã",   time:"07:00", emoji:"🌅", items:[
      { name:"Mingau de aveia com banana (80g aveia)", cals:300, role:"carb" },
      { name:"Mel (1 col. chá)", cals:25, role:"extra" },
      { name:"Café com leite (200ml)", cals:60, role:"extra" },
    ]},
    { id:"lanche1", label:"Lanche da manhã", time:"10:00", emoji:"🍊", items:[
      { name:"Laranja (2 unidades)", cals:90, role:"veg" },
      { name:"Ovo cozido (1 un)", cals:80, role:"protein" },
    ]},
    { id:"almoco",  label:"Almoço",           time:"13:00", emoji:"🍽️", items:[
      { name:"Tilápia grelhada (180g)", cals:195, role:"protein" },
      { name:"Arroz branco (5 col. sopa)", cals:150, role:"carb" },
      { name:"Feijão carioca (1 concha)", cals:120, role:"veg" },
      { name:"Chuchu cozido (100g)", cals:25, role:"veg" },
      { name:"Salada de alface e cenoura", cals:35, role:"veg" },
    ]},
    { id:"lanche2", label:"Lanche da tarde",  time:"16:00", emoji:"🥛", items:[
      { name:"Iogurte natural (200g)", cals:120, role:"protein" },
      { name:"Banana (1 média)", cals:90, role:"veg" },
      { name:"Aveia em flocos (20g)", cals:75, role:"carb" },
    ]},
    { id:"jantar",  label:"Jantar",            time:"19:30", emoji:"🌙", items:[
      { name:"Macarrão parafuso (100g cozido)", cals:155, role:"carb" },
      { name:"Frango desfiado (120g)", cals:165, role:"protein" },
      { name:"Molho de tomate (3 col. sopa)", cals:40, role:"veg" },
      { name:"Salada de alface", cals:20, role:"veg" },
    ]},
  ],

  /* 2 – Terça ≈ 1855 kcal */ [
    { id:"cafe",    label:"Café da manhã",   time:"07:00", emoji:"🌅", items:[
      { name:"Tapioca (2 un) com ovo mexido", cals:250, role:"carb" },
      { name:"Queijo minas frescal (30g)", cals:70, role:"protein" },
      { name:"Café com leite (200ml)", cals:60, role:"extra" },
      { name:"Banana (1 média)", cals:90, role:"veg" },
    ]},
    { id:"lanche1", label:"Lanche da manhã", time:"10:00", emoji:"🍎", items:[
      { name:"Maçã (1 unidade)", cals:80, role:"veg" },
      { name:"Amendoim torrado (30g)", cals:175, role:"extra" },
    ]},
    { id:"almoco",  label:"Almoço",           time:"13:00", emoji:"🍽️", items:[
      { name:"Carne moída refogada (150g)", cals:255, role:"protein" },
      { name:"Arroz branco (5 col. sopa)", cals:150, role:"carb" },
      { name:"Feijão preto (1 concha)", cals:120, role:"veg" },
      { name:"Couve refogada (50g)", cals:30, role:"veg" },
      { name:"Salada de tomate e cebola", cals:25, role:"veg" },
    ]},
    { id:"lanche2", label:"Lanche da tarde",  time:"16:00", emoji:"🥛", items:[
      { name:"Vitamina de mamão com leite (350ml)", cals:190, role:"protein" },
      { name:"Aveia em flocos (20g)", cals:75, role:"carb" },
    ]},
    { id:"jantar",  label:"Jantar",            time:"19:30", emoji:"🌙", items:[
      { name:"Omelete de espinafre (3 ovos)", cals:230, role:"protein" },
      { name:"Batata doce cozida (150g)", cals:120, role:"carb" },
      { name:"Salada de tomate com azeite", cals:35, role:"veg" },
    ]},
  ],

  /* 3 – Quarta ≈ 1805 kcal */ [
    { id:"cafe",    label:"Café da manhã",   time:"07:00", emoji:"🌅", items:[
      { name:"Pão francês (1 un) com margarina", cals:170, role:"carb" },
      { name:"Ovos mexidos (2 un)", cals:140, role:"protein" },
      { name:"Café com leite (200ml)", cals:60, role:"extra" },
      { name:"Laranja (1 un)", cals:45, role:"veg" },
    ]},
    { id:"lanche1", label:"Lanche da manhã", time:"10:00", emoji:"🍌", items:[
      { name:"Banana (2 médias)", cals:180, role:"veg" },
      { name:"Canela em pó (pitada)", cals:5, role:"extra" },
    ]},
    { id:"almoco",  label:"Almoço",           time:"13:00", emoji:"🍽️", items:[
      { name:"Frango assado (180g)", cals:245, role:"protein" },
      { name:"Arroz branco (5 col. sopa)", cals:150, role:"carb" },
      { name:"Feijão de corda (1 concha)", cals:110, role:"veg" },
      { name:"Repolho refogado (80g)", cals:30, role:"veg" },
      { name:"Salada de cenoura e beterraba", cals:50, role:"veg" },
    ]},
    { id:"lanche2", label:"Lanche da tarde",  time:"16:00", emoji:"🥚", items:[
      { name:"Ovo cozido (2 un)", cals:160, role:"protein" },
      { name:"Pão de fôrma (2 fatias)", cals:130, role:"carb" },
    ]},
    { id:"jantar",  label:"Jantar",            time:"19:30", emoji:"🌙", items:[
      { name:"Omelete de atum (3 ovos + ½ lata)", cals:270, role:"protein" },
      { name:"Arroz branco (3 col. sopa)", cals:90, role:"carb" },
      { name:"Salada de alface e pepino", cals:20, role:"veg" },
    ]},
  ],

  /* 4 – Quinta ≈ 1795 kcal */ [
    { id:"cafe",    label:"Café da manhã",   time:"07:00", emoji:"🌅", items:[
      { name:"Panqueca de aveia e banana (3 un)", cals:295, role:"carb" },
      { name:"Mel (1 col. chá)", cals:25, role:"extra" },
      { name:"Café com leite (200ml)", cals:60, role:"extra" },
    ]},
    { id:"lanche1", label:"Lanche da manhã", time:"10:00", emoji:"🧀", items:[
      { name:"Queijo minas frescal (2 fatias, 60g)", cals:130, role:"protein" },
      { name:"Biscoito integral (4 unidades)", cals:100, role:"carb" },
    ]},
    { id:"almoco",  label:"Almoço",           time:"13:00", emoji:"🍽️", items:[
      { name:"Frango desfiado (160g)", cals:220, role:"protein" },
      { name:"Arroz branco (5 col. sopa)", cals:150, role:"carb" },
      { name:"Feijão carioca (1 concha)", cals:120, role:"veg" },
      { name:"Salada de cenoura e beterraba", cals:60, role:"veg" },
      { name:"Azeite (1 fio)", cals:40, role:"extra" },
    ]},
    { id:"lanche2", label:"Lanche da tarde",  time:"16:00", emoji:"🥛", items:[
      { name:"Vitamina de mamão com leite (300ml)", cals:190, role:"protein" },
      { name:"Aveia em flocos (20g)", cals:75, role:"carb" },
    ]},
    { id:"jantar",  label:"Jantar",            time:"19:30", emoji:"🌙", items:[
      { name:"Tilápia ao forno (180g)", cals:195, role:"protein" },
      { name:"Batata doce cozida (150g)", cals:120, role:"carb" },
      { name:"Brócolis cozido (100g)", cals:35, role:"veg" },
      { name:"Salada verde", cals:20, role:"veg" },
    ]},
  ],

  /* 5 – Sexta ≈ 1840 kcal */ [
    { id:"cafe",    label:"Café da manhã",   time:"07:00", emoji:"🌅", items:[
      { name:"Cuscuz nordestino (100g)", cals:255, role:"carb" },
      { name:"Ovo mexido (1 un)", cals:80, role:"protein" },
      { name:"Queijo minas (30g)", cals:80, role:"protein" },
      { name:"Café com leite (200ml)", cals:60, role:"extra" },
    ]},
    { id:"lanche1", label:"Lanche da manhã", time:"10:00", emoji:"🍊", items:[
      { name:"Laranja (2 unidades)", cals:90, role:"veg" },
      { name:"Amendoim torrado (25g)", cals:145, role:"extra" },
    ]},
    { id:"almoco",  label:"Almoço",           time:"13:00", emoji:"🍽️", items:[
      { name:"Atum em conserva (2 latas, 170g drenado)", cals:200, role:"protein" },
      { name:"Arroz branco (5 col. sopa)", cals:150, role:"carb" },
      { name:"Feijão (1 concha)", cals:120, role:"veg" },
      { name:"Salada colorida com azeite", cals:65, role:"veg" },
    ]},
    { id:"lanche2", label:"Lanche da tarde",  time:"16:00", emoji:"🥛", items:[
      { name:"Iogurte natural (200g)", cals:120, role:"protein" },
      { name:"Banana (1 média)", cals:90, role:"veg" },
    ]},
    { id:"jantar",  label:"Jantar",            time:"19:30", emoji:"🌙", items:[
      { name:"Frango grelhado (130g)", cals:180, role:"protein" },
      { name:"Macarrão ao sugo (150g cozido)", cals:190, role:"carb" },
      { name:"Salada de rúcula e tomate", cals:30, role:"veg" },
    ]},
  ],

  /* 6 – Sábado ≈ 1900 kcal */ [
    { id:"cafe",    label:"Café da manhã",   time:"07:00", emoji:"🌅", items:[
      { name:"Pão francês (2 un) com requeijão light", cals:300, role:"carb" },
      { name:"Ovos mexidos (2 un)", cals:140, role:"protein" },
      { name:"Café com leite (200ml)", cals:60, role:"extra" },
    ]},
    { id:"lanche1", label:"Lanche da manhã", time:"10:00", emoji:"🍉", items:[
      { name:"Melancia (300g)", cals:90, role:"veg" },
      { name:"Iogurte natural (150g)", cals:90, role:"protein" },
    ]},
    { id:"almoco",  label:"Almoço",           time:"13:00", emoji:"🍽️", items:[
      { name:"Frango assado (200g)", cals:270, role:"protein" },
      { name:"Arroz branco (5 col. sopa)", cals:150, role:"carb" },
      { name:"Feijão (1 concha)", cals:120, role:"veg" },
      { name:"Batata assada (100g)", cals:80, role:"carb" },
      { name:"Salada de alface e tomate", cals:30, role:"veg" },
    ]},
    { id:"lanche2", label:"Lanche da tarde",  time:"16:00", emoji:"🍊", items:[
      { name:"Suco de laranja natural (300ml)", cals:130, role:"veg" },
      { name:"Biscoito integral (4 un)", cals:100, role:"carb" },
    ]},
    { id:"jantar",  label:"Jantar",            time:"19:30", emoji:"🌙", items:[
      { name:"Sopa de frango com legumes (400ml)", cals:210, role:"protein" },
      { name:"Pão de fôrma torrado (2 fatias)", cals:130, role:"carb" },
      { name:"Queijo minas (1 fatia, 25g)", cals:65, role:"protein" },
    ]},
  ],
];

// ─── Escalar refeições para a meta calórica e o objetivo ────────────────────
// Em vez de escalar tudo pelo mesmo fator (o que só muda o TAMANHO da dieta),
// cada papel nutricional (proteína/carboidrato/vegetal/extra) tem seu próprio
// multiplicador por objetivo (ROLE_MULT) — isso muda a COMPOSIÇÃO de verdade.
// No fim, reajusta tudo proporcionalmente pra bater exatamente a meta calórica.

function scaleMeals(rawMeals: RawMeal[], targetKcal: number, dayIndex: number, goal: Objetivo, injuries: string[]): DietMeal[] {
  const meals = rawMeals.map((m) => ({ ...m, items: applyHealthSwaps(m.items, injuries) }));
  const roleMult = ROLE_MULT[goal];

  const baseTotal = meals.reduce((s, m) => s + m.items.reduce((s2, i) => s2 + i.cals, 0), 0);
  const baseRatio = baseTotal > 0 ? targetKcal / baseTotal : 1;

  // 1ª passada: aplica a ênfase por papel nutricional.
  const weighted = meals.map((m) => m.items.map((item) => item.cals * baseRatio * roleMult[item.role]));
  const weightedTotal = weighted.reduce((s, items) => s + items.reduce((a, b) => a + b, 0), 0);
  // 2ª passada: reajusta pra bater a meta calórica exata, mantendo a ênfase relativa.
  const correction = weightedTotal > 0 ? targetKcal / weightedTotal : 1;

  return meals.map((m, mi) => {
    const scaledItems: DietItem[] = m.items.map((item, ii) => ({
      name: item.name,
      cals: Math.max(5, Math.round((weighted[mi][ii] * correction) / 5) * 5),
    }));
    return {
      id: m.id, label: m.label, time: m.time, emoji: m.emoji,
      photo: getPhoto(m.id, dayIndex),
      kcal: scaledItems.reduce((s, i) => s + i.cals, 0),
      items: scaledItems,
    };
  });
}

// ─── Nomes dos dias da semana ────────────────────────────────────────────────

export const DAY_NAMES = [
  "domingo", "segunda-feira", "terça-feira", "quarta-feira",
  "quinta-feira", "sexta-feira", "sábado",
];

// ─── Export principal ────────────────────────────────────────────────────────

export function getDayDiet(anamnese: AnamneseData | null): DayDiet {
  const dayIndex = new Date().getDay();
  const rawMeals = BASE_MENUS[dayIndex];

  if (!anamnese) {
    const meals: DietMeal[] = rawMeals.map((m) => ({
      id: m.id, label: m.label, time: m.time, emoji: m.emoji,
      photo: getPhoto(m.id, dayIndex),
      kcal: m.items.reduce((s, i) => s + i.cals, 0),
      items: m.items,
    }));
    return { totalKcal: meals.reduce((s, m) => s + m.kcal, 0), protein: 120, carbs: 190, fat: 55, waterGoal: 2.5, meals };
  }

  const goal = classifyObjetivo(anamnese.objetivo ?? "");
  const injuries = anamnese.lesoes ?? [];
  const targetKcal = calcTargetKcal(anamnese, goal);
  const weight     = Number(anamnese.peso) || 70;
  const { protein, carbs, fat } = calcMacros(targetKcal, weight, goal);
  const waterGoal  = Math.round(weight * 0.035 * 10) / 10;

  return {
    totalKcal: targetKcal, protein, carbs, fat, waterGoal,
    meals: scaleMeals(rawMeals, targetKcal, dayIndex, goal, injuries),
  };
}
