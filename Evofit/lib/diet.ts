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

// ─── TDEE Calculation ────────────────────────────────────────────────────────

function calcTargetKcal(anamnese: AnamneseData): number {
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

  const obj = (anamnese.objetivo ?? "").toLowerCase();
  const goalAdj =
    (obj.includes("emagrec") || obj.includes("perda") || obj.includes("gordu")) ? 0.82 :
    (obj.includes("hiper") || obj.includes("múscu") || obj.includes("muscu") || obj.includes("ganho")) ? 1.10 :
    1.0;

  return Math.round((bmr * activity * goalAdj) / 50) * 50;
}

function calcMacros(targetKcal: number, weight: number, objetivo: string) {
  const obj = objetivo.toLowerCase();
  const gPerKg =
    (obj.includes("emagrec") || obj.includes("perda") || obj.includes("gordu")) ? 2.2 :
    (obj.includes("hiper") || obj.includes("múscu") || obj.includes("muscu") || obj.includes("ganho")) ? 2.0 :
    1.6;
  const protein = Math.round(weight * gPerKg);
  const fat     = Math.round((targetKcal * 0.27) / 9);
  const carbs   = Math.max(0, Math.round((targetKcal - protein * 4 - fat * 9) / 4));
  return { protein, fat, carbs };
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
//  ✓ Sem granola — amendoim, biscoito, aveia simples, frutas baratas
//  ✓ Sem whey — proteína vem de ovo, frango, atum em lata, carne moída
//  ✓ Frutas acessíveis: banana, laranja, mamão, melancia, maçã
//  ✓ Proteínas baratas: frango, ovo, atum em lata, carne moída, queijo minas

type RawItem = { name: string; cals: number };
type RawMeal = { id: string; label: string; time: string; emoji: string; items: RawItem[] };

const BASE_MENUS: RawMeal[][] = [

  /* 0 – Domingo ≈ 1840 kcal */ [
    { id:"cafe",    label:"Café da manhã",   time:"07:00", emoji:"🌅", items:[
      { name:"Ovos mexidos (3 un)", cals:210 },
      { name:"Pão de fôrma (2 fatias)", cals:130 },
      { name:"Café com leite integral (200ml)", cals:60 },
      { name:"Mamão papaia (150g)", cals:60 },
    ]},
    { id:"lanche1", label:"Lanche da manhã", time:"10:00", emoji:"🍌", items:[
      { name:"Banana (1 média)", cals:90 },
      { name:"Amendoim torrado sem sal (30g)", cals:175 },
    ]},
    { id:"almoco",  label:"Almoço",           time:"13:00", emoji:"🍽️", items:[
      { name:"Frango grelhado (150g)", cals:200 },
      { name:"Arroz branco (5 col. sopa)", cals:150 },
      { name:"Feijão carioca (1 concha)", cals:120 },
      { name:"Salada de alface e tomate", cals:30 },
      { name:"Cenoura cozida (80g)", cals:35 },
    ]},
    { id:"lanche2", label:"Lanche da tarde",  time:"16:00", emoji:"🥛", items:[
      { name:"Vitamina de banana com leite (300ml)", cals:200 },
      { name:"Aveia em flocos (30g)", cals:115 },
    ]},
    { id:"jantar",  label:"Jantar",            time:"19:30", emoji:"🌙", items:[
      { name:"Omelete de queijo (3 ovos)", cals:250 },
      { name:"Batata cozida (200g)", cals:155 },
      { name:"Salada de pepino e tomate", cals:30 },
    ]},
  ],

  /* 1 – Segunda ≈ 1810 kcal */ [
    { id:"cafe",    label:"Café da manhã",   time:"07:00", emoji:"🌅", items:[
      { name:"Mingau de aveia com banana (80g aveia)", cals:300 },
      { name:"Mel (1 col. chá)", cals:25 },
      { name:"Café com leite (200ml)", cals:60 },
    ]},
    { id:"lanche1", label:"Lanche da manhã", time:"10:00", emoji:"🍊", items:[
      { name:"Laranja (2 unidades)", cals:90 },
      { name:"Ovo cozido (1 un)", cals:80 },
    ]},
    { id:"almoco",  label:"Almoço",           time:"13:00", emoji:"🍽️", items:[
      { name:"Tilápia grelhada (180g)", cals:195 },
      { name:"Arroz branco (5 col. sopa)", cals:150 },
      { name:"Feijão carioca (1 concha)", cals:120 },
      { name:"Chuchu cozido (100g)", cals:25 },
      { name:"Salada de alface e cenoura", cals:35 },
    ]},
    { id:"lanche2", label:"Lanche da tarde",  time:"16:00", emoji:"🥛", items:[
      { name:"Iogurte natural (200g)", cals:120 },
      { name:"Banana (1 média)", cals:90 },
      { name:"Aveia em flocos (20g)", cals:75 },
    ]},
    { id:"jantar",  label:"Jantar",            time:"19:30", emoji:"🌙", items:[
      { name:"Macarrão parafuso (100g cozido)", cals:155 },
      { name:"Frango desfiado (120g)", cals:165 },
      { name:"Molho de tomate (3 col. sopa)", cals:40 },
      { name:"Salada de alface", cals:20 },
    ]},
  ],

  /* 2 – Terça ≈ 1855 kcal */ [
    { id:"cafe",    label:"Café da manhã",   time:"07:00", emoji:"🌅", items:[
      { name:"Tapioca (2 un) com ovo mexido", cals:250 },
      { name:"Queijo minas frescal (30g)", cals:70 },
      { name:"Café com leite (200ml)", cals:60 },
      { name:"Banana (1 média)", cals:90 },
    ]},
    { id:"lanche1", label:"Lanche da manhã", time:"10:00", emoji:"🍎", items:[
      { name:"Maçã (1 unidade)", cals:80 },
      { name:"Amendoim torrado (30g)", cals:175 },
    ]},
    { id:"almoco",  label:"Almoço",           time:"13:00", emoji:"🍽️", items:[
      { name:"Carne moída refogada (150g)", cals:255 },
      { name:"Arroz branco (5 col. sopa)", cals:150 },
      { name:"Feijão preto (1 concha)", cals:120 },
      { name:"Couve refogada (50g)", cals:30 },
      { name:"Salada de tomate e cebola", cals:25 },
    ]},
    { id:"lanche2", label:"Lanche da tarde",  time:"16:00", emoji:"🥛", items:[
      { name:"Vitamina de mamão com leite (350ml)", cals:190 },
      { name:"Aveia em flocos (20g)", cals:75 },
    ]},
    { id:"jantar",  label:"Jantar",            time:"19:30", emoji:"🌙", items:[
      { name:"Omelete de espinafre (3 ovos)", cals:230 },
      { name:"Batata doce cozida (150g)", cals:120 },
      { name:"Salada de tomate com azeite", cals:35 },
    ]},
  ],

  /* 3 – Quarta ≈ 1805 kcal */ [
    { id:"cafe",    label:"Café da manhã",   time:"07:00", emoji:"🌅", items:[
      { name:"Pão francês (1 un) com margarina", cals:170 },
      { name:"Ovos mexidos (2 un)", cals:140 },
      { name:"Café com leite (200ml)", cals:60 },
      { name:"Laranja (1 un)", cals:45 },
    ]},
    { id:"lanche1", label:"Lanche da manhã", time:"10:00", emoji:"🍌", items:[
      { name:"Banana (2 médias)", cals:180 },
      { name:"Canela em pó (pitada)", cals:5 },
    ]},
    { id:"almoco",  label:"Almoço",           time:"13:00", emoji:"🍽️", items:[
      { name:"Frango assado (180g)", cals:245 },
      { name:"Arroz branco (5 col. sopa)", cals:150 },
      { name:"Feijão de corda (1 concha)", cals:110 },
      { name:"Repolho refogado (80g)", cals:30 },
      { name:"Salada de cenoura e beterraba", cals:50 },
    ]},
    { id:"lanche2", label:"Lanche da tarde",  time:"16:00", emoji:"🥚", items:[
      { name:"Ovo cozido (2 un)", cals:160 },
      { name:"Pão de fôrma (2 fatias)", cals:130 },
    ]},
    { id:"jantar",  label:"Jantar",            time:"19:30", emoji:"🌙", items:[
      { name:"Omelete de atum (3 ovos + ½ lata)", cals:270 },
      { name:"Arroz branco (3 col. sopa)", cals:90 },
      { name:"Salada de alface e pepino", cals:20 },
    ]},
  ],

  /* 4 – Quinta ≈ 1795 kcal */ [
    { id:"cafe",    label:"Café da manhã",   time:"07:00", emoji:"🌅", items:[
      { name:"Panqueca de aveia e banana (3 un)", cals:295 },
      { name:"Mel (1 col. chá)", cals:25 },
      { name:"Café com leite (200ml)", cals:60 },
    ]},
    { id:"lanche1", label:"Lanche da manhã", time:"10:00", emoji:"🧀", items:[
      { name:"Queijo minas frescal (2 fatias, 60g)", cals:130 },
      { name:"Biscoito integral (4 unidades)", cals:100 },
    ]},
    { id:"almoco",  label:"Almoço",           time:"13:00", emoji:"🍽️", items:[
      { name:"Frango desfiado (160g)", cals:220 },
      { name:"Arroz branco (5 col. sopa)", cals:150 },
      { name:"Feijão carioca (1 concha)", cals:120 },
      { name:"Salada de cenoura e beterraba", cals:60 },
      { name:"Azeite (1 fio)", cals:40 },
    ]},
    { id:"lanche2", label:"Lanche da tarde",  time:"16:00", emoji:"🥛", items:[
      { name:"Vitamina de mamão com leite (300ml)", cals:190 },
      { name:"Aveia em flocos (20g)", cals:75 },
    ]},
    { id:"jantar",  label:"Jantar",            time:"19:30", emoji:"🌙", items:[
      { name:"Tilápia ao forno (180g)", cals:195 },
      { name:"Batata doce cozida (150g)", cals:120 },
      { name:"Brócolis cozido (100g)", cals:35 },
      { name:"Salada verde", cals:20 },
    ]},
  ],

  /* 5 – Sexta ≈ 1840 kcal */ [
    { id:"cafe",    label:"Café da manhã",   time:"07:00", emoji:"🌅", items:[
      { name:"Cuscuz nordestino (100g)", cals:255 },
      { name:"Ovo mexido (1 un)", cals:80 },
      { name:"Queijo minas (30g)", cals:80 },
      { name:"Café com leite (200ml)", cals:60 },
    ]},
    { id:"lanche1", label:"Lanche da manhã", time:"10:00", emoji:"🍊", items:[
      { name:"Laranja (2 unidades)", cals:90 },
      { name:"Amendoim torrado (25g)", cals:145 },
    ]},
    { id:"almoco",  label:"Almoço",           time:"13:00", emoji:"🍽️", items:[
      { name:"Atum em conserva (2 latas, 170g drenado)", cals:200 },
      { name:"Arroz branco (5 col. sopa)", cals:150 },
      { name:"Feijão (1 concha)", cals:120 },
      { name:"Salada colorida com azeite", cals:65 },
    ]},
    { id:"lanche2", label:"Lanche da tarde",  time:"16:00", emoji:"🥛", items:[
      { name:"Iogurte natural (200g)", cals:120 },
      { name:"Banana (1 média)", cals:90 },
    ]},
    { id:"jantar",  label:"Jantar",            time:"19:30", emoji:"🌙", items:[
      { name:"Frango grelhado (130g)", cals:180 },
      { name:"Macarrão ao sugo (150g cozido)", cals:190 },
      { name:"Salada de rúcula e tomate", cals:30 },
    ]},
  ],

  /* 6 – Sábado ≈ 1900 kcal */ [
    { id:"cafe",    label:"Café da manhã",   time:"07:00", emoji:"🌅", items:[
      { name:"Pão francês (2 un) com requeijão light", cals:300 },
      { name:"Ovos mexidos (2 un)", cals:140 },
      { name:"Café com leite (200ml)", cals:60 },
    ]},
    { id:"lanche1", label:"Lanche da manhã", time:"10:00", emoji:"🍉", items:[
      { name:"Melancia (300g)", cals:90 },
      { name:"Iogurte natural (150g)", cals:90 },
    ]},
    { id:"almoco",  label:"Almoço",           time:"13:00", emoji:"🍽️", items:[
      { name:"Frango assado (200g)", cals:270 },
      { name:"Arroz branco (5 col. sopa)", cals:150 },
      { name:"Feijão (1 concha)", cals:120 },
      { name:"Batata assada (100g)", cals:80 },
      { name:"Salada de alface e tomate", cals:30 },
    ]},
    { id:"lanche2", label:"Lanche da tarde",  time:"16:00", emoji:"🍊", items:[
      { name:"Suco de laranja natural (300ml)", cals:130 },
      { name:"Biscoito integral (4 un)", cals:100 },
    ]},
    { id:"jantar",  label:"Jantar",            time:"19:30", emoji:"🌙", items:[
      { name:"Sopa de frango com legumes (400ml)", cals:210 },
      { name:"Pão de fôrma torrado (2 fatias)", cals:130 },
      { name:"Queijo minas (1 fatia, 25g)", cals:65 },
    ]},
  ],
];

// ─── Escalar refeições para a meta calórica ──────────────────────────────────

function scaleMeals(rawMeals: RawMeal[], targetKcal: number, dayIndex: number): DietMeal[] {
  const baseTotal = rawMeals.reduce((s, m) => s + m.items.reduce((s2, i) => s2 + i.cals, 0), 0);
  const ratio = baseTotal > 0 ? targetKcal / baseTotal : 1;

  return rawMeals.map((m) => {
    const scaledItems: DietItem[] = m.items.map((item) => ({
      name: item.name,
      cals: Math.max(5, Math.round((item.cals * ratio) / 5) * 5),
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

  const targetKcal = calcTargetKcal(anamnese);
  const weight     = Number(anamnese.peso) || 70;
  const { protein, carbs, fat } = calcMacros(targetKcal, weight, anamnese.objetivo ?? "");
  const waterGoal  = Math.round(weight * 0.035 * 10) / 10;

  return {
    totalKcal: targetKcal, protein, carbs, fat, waterGoal,
    meals: scaleMeals(rawMeals, targetKcal, dayIndex),
  };
}
