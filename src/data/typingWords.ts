export interface WordDictionary {
  tier1: string[]; // 2-4 letters (fast, starter words)
  tier2: string[]; // 4-6 letters (medium vocabulary)
  tier3: string[]; // 6-8 letters (scientific, technical, standard vocabulary)
  tier4: string[]; // 8-11 letters (advanced academic & complex vocabulary)
  tier5: string[]; // 12-16 letters (high-level academic & intellectual vocabulary)
  barrels: string[]; // Mystery barrel words
  elites: string[]; // Elite mini-boss phrases
  cleanse: string[]; // Kraken ink cleanse words
  bossMegalodon: string[];
  bossKraken: string[];
  bossDragon: string[];
  bossBehemoth: string[];
  bossLeviathan: string[];
}

export const ENGLISH_WORDS: WordDictionary = {
  tier1: [
    'cat', 'dog', 'run', 'sun', 'sea', 'sky', 'red', 'fin', 'jaw', 'cod', 'ray',
    'eel', 'sub', 'oar', 'net', 'bay', 'wave', 'tide', 'deep', 'fish', 'gill',
    'dive', 'swim', 'ship', 'reef', 'sand', 'blue', 'salt', 'crab', 'dock', 'surf',
    'glow', 'iron', 'gold', 'star', 'moon', 'fire', 'wind', 'time', 'book', 'tree',
    'door', 'hero', 'code', 'echo', 'neon', 'core', 'peak', 'grid', 'atom', 'fast'
  ],
  tier2: [
    'planet', 'shadow', 'silver', 'dragon', 'matrix', 'falcon', 'rocket', 'castle',
    'stream', 'glider', 'knight', 'hunter', 'spirit', 'plasma', 'future', 'cosmic',
    'forest', 'signal', 'energy', 'vector', 'system', 'motion', 'flight', 'shield',
    'shark', 'coral', 'ocean', 'abyss', 'whale', 'squid', 'water', 'sonar', 'depth',
    'pearl', 'coast', 'anchor', 'marine', 'bubble', 'vessel', 'beacon', 'breeze', 'saline'
  ],
  tier3: [
    // Standard academic, scientific, technology & general vocabulary (6-8 chars)
    'galaxy', 'horizon', 'quantum', 'dynamic', 'complex', 'circuit', 'gravity', 'eclipse',
    'balance', 'element', 'formula', 'network', 'crystal', 'monarch', 'polygon', 'catalyst',
    'voltage', 'spectrum', 'velocity', 'variable', 'cylinder', 'acoustic', 'optics', 'magnetic',
    'terminal', 'nucleus', 'entropy', 'particle', 'cellular', 'friction', 'momentum', 'rotation',
    'pressure', 'sequence', 'absolute', 'abstract', 'compound', 'dominant', 'electron', 'function',
    'geometry', 'heritage', 'infinite', 'junction', 'kinetics', 'membrane', 'nitrogen', 'organism'
  ],
  tier4: [
    // Advanced academic, intellectual & standard English vocabulary (8-11 chars)
    'phenomenon', 'synchronize', 'architecture', 'equilibrium', 'magnificent', 'hypothesis',
    'atmosphere', 'resolution', 'trajectory', 'wavelength', 'hemisphere', 'coordinate',
    'laboratory', 'simulation', 'generation', 'metabolism', 'combustion', 'dimension',
    'foundation', 'reflection', 'efficiency', 'resistance', 'astronomy', 'microscope',
    'philosophy', 'ecosystem', 'navigation', 'gravitation', 'frequency', 'temperature',
    'calculation', 'acceleration', 'experiment', 'composition', 'equilibrium', 'exploration',
    'perspective', 'substantial', 'observation', 'reliability', 'probability', 'equilibrium'
  ],
  tier5: [
    // High-level academic, intellectual & complex English vocabulary (12-16 chars)
    'photosynthesis', 'crystallization', 'thermodynamics', 'electromagnet', 'transformation',
    'sophisticated', 'extraordinary', 'comprehensive', 'infrastructure', 'kaleidoscope',
    'juxtaposition', 'characteristic', 'unprecedented', 'differentiation', 'biotechnology',
    'quantumphysics', 'nanotechnology', 'telecommunication', 'gravitational', 'superconductivity',
    'bioluminescence', 'paleontology', 'interstellar', 'constellation', 'synchronization',
    'reproducibility', 'electrochemical', 'crystallography', 'macromolecules', 'generalization',
    'hypothetical', 'classification', 'crystallization', 'interdisciplinary', 'proportionality'
  ],
  barrels: [
    'LUCKY', 'CHEST', 'BARREL', 'BONUS', 'TREASURE', 'SUPPLY', 'FORTUNE', 'POWERUP',
    'BOUNTY', 'RELIC', 'SECRET', 'CRYSTAL', 'COFFER'
  ],
  elites: [
    'QUANTUM ORCA', 'ARMORED CYBORG', 'TITANIC BEHEMOTH', 'PHANTOM GHOST',
    'ELECTRIC MANTIS', 'ANCIENT LEVIATHAN', 'STEEL PREDATOR'
  ],
  cleanse: ['SONAR', 'CLEANSE', 'PURIFY', 'BUBBLE', 'LIGHT', 'OXYGEN', 'FLASH', 'WAVE', 'BEACON'],
  bossMegalodon: [
    'DOMINANCE', 'BLOODTHIRST', 'ANCIENTJAW', 'CARNIVORE', 'MEGATOOTH', 'FEROCIOUS',
    'APEXHUNTER', 'DEVOURING', 'TERRORBITE', 'DEEPCRUSH', 'PRIMALFURY'
  ],
  bossKraken: [
    'INKYVOID', 'TENTACLES', 'ABYSSGRASP', 'DREADCONSTRICT', 'SUCTIONMAW',
    'BLINDHORROR', 'OCEANSHADOW', 'NIGHTMARE', 'MAELSTROM', 'SUBMERGE'
  ],
  bossDragon: [
    'GLACIALFROST', 'BLIZZARDBREATH', 'ANCIENTSCALE', 'FROZENDEEP', 'FROSTBITETURN',
    'ARCTICMAJESTY', 'ICEBERGCLASH', 'ABYSSSERPENT', 'HYPOTHERMIA', 'SUBZEROBLAST'
  ],
  bossBehemoth: [
    'TITANCANNON', 'SEMECHWARRIOR', 'POSEIDONWRATH', 'STEELCARAPACE', 'THUNDERBOLT',
    'OVERCHARGED', 'SONARSHOCKWAVE', 'REACTORBEAM', 'HEAVYVOLTAGE', 'COLOSSUSPULSE'
  ],
  bossLeviathan: [
    'OBLIVIONTITAN', 'SINGULARITYVOID', 'CATACLYSMICRAGE', 'IMMORTALDIVINITY', 'SUPREMESOVEREIGN',
    'COSMICABYSS', 'REALMDESTROYER', 'INFINITEPRESSURE', 'ULTIMATECHAMPION', 'VOIDHARBINGER'
  ]
};

export const VIETNAMESE_WORDS: WordDictionary = {
  tier1: [
    'ca', 'bien', 'tau', 'vuc', 'sau', 'song', 'gio', 'boc', 'lan', 'boi',
    'muoi', 'cua', 'muc', 'ngoc', 'ngam', 'thuyen', 'neo', 'san', 'ho', 'bui',
    'luon', 'oc', 'tom', 'rong', 'nam', 'cat', 'da', 'giap', 'bom', 'dan',
    'vot', 'mung', 'luoi', 'phao', 'vinh', 'ngheo', 'be', 'ray', 'hoi', 'khi',
    'anh', 'sang', 'dien', 'nhiet', 'khoi', 'lua', 'sao', 'dem', 'ngay', 'troi'
  ],
  tier2: [
    'ca map', 'bach tuoc', 'hai au', 'ca voi', 'song than', 'thuy loi', 'ngu loi',
    'tau ngam', 'vuc tham', 'san ho', 'kho bau', 'chieu thuy', 'phu du', 'tam xa',
    'khi oxy', 'hai ma', 'ca duoi', 'chan vit', 'hai quan', 'den pha', 'bong bong',
    'nang luong', 'khong gian', 'dien tu', 'nguyen tu', 'phan ung', 'quy dao', 'ap suat'
  ],
  tier3: [
    'quang pho bien do', 'quang hoc co ban', 'van toc chuyen dong', 'trong luc trai dat',
    'dien truong xoay', 'song sieu am cao', 'tu truong vu tru', 'nang luong mat troi',
    'phan tu vat chat', 'chat xuc tac hoa', 'dong luc hoc bien', 'he thong tu dong',
    'thiet bi vi mach', 'ngoc trai den quy', 'giap hop kim thep', 'luon dien bien sau'
  ],
  tier4: [
    'hien tuong quang hop', 'khuc xa anh sang', 'phan ung hat nhan', 'tri tue nhan tao',
    'cong nghe sinh hoc', 'khoa hoc vu tru', 'bien doi khi hau', 'dieu khien tu dong',
    'song dien tu truong', 'nang luong nguyen tu', 'phan tich du lieu', 'vat ly luong tu'
  ],
  tier5: [
    'cong nghe nano vi mo', 'thuyet tuong doi hep', 'nhiet dong luc hoc',
    'khong thoi gian vo tan', 'buc xa dien tu cuc manh', 'bien doi nang luong vi mo',
    'he thong dien toan dam may', 'tri tue nhan tao tong quat', 'co hoc luong tu nang cao'
  ],
  barrels: [
    'KHO BAU', 'RUONG GO', 'MAY MAN', 'TIEP TE', 'SIEU BUFF', 'PHUC TINH', 'QUA TANG', 'TINH THE'
  ],
  elites: [
    'CA VOI SAT THU', 'HAI MA THIET GIAP', 'CUA HOANG DE', 'CA KIEM BONG MA',
    'TOM TIT SIEU LUC', 'LUON DIEN CO DAI'
  ],
  cleanse: ['SONAR', 'XOA MUC', 'THANH LOC', 'OXY', 'CHOP SANG', 'LA CHAN', 'HAI LUU', 'PHA SANG'],
  bossMegalodon: [
    'HAM RANG THEP', 'BA CHU THUONG CO', 'CUOP PHA DAI DUONG', 'SAN MOI BIEN SAU', 'CUONG NO CA MAP',
    'HUY DIET CON MOI', 'VAY LUNG KHONG LO', 'XUNG KICH MAT NUOC', 'MAU LANH VUC BIEN', 'NUOT CHUNG VAN VAT'
  ],
  bossKraken: [
    'MA THAN XUC TU', 'MUC DEN VO TAN', 'SIET CHAT CHIEN TAU', 'VUC THAM TOI TAM', 'CONG PHA DAY BIEN',
    'HO MAT AM ANH', 'XOAY CHUYEN THUY TRIEU', 'GONG KIM XUC TU', 'BONG MA KRAKEN', 'NGAT THO DAY DAI DUONG'
  ],
  bossDragon: [
    'BANG LONG CO DAI', 'HOI THO BANG GIA', 'DONG CUNG VUC SAU', 'VAY RONG HAN THEP', 'CON BAO TUYET BIEN',
    'CHIEN LON ANH SANG', 'TIENG GAM BANG TUYET', 'LONG VUONG HAI KY', 'UY AP NGAN NAM', 'DONG CHAY CUONG LOI'
  ],
  bossBehemoth: [
    'CU THAN CO GIOI', 'LOI DINH POSEIDON', 'GIAP SAT BAT DIET', 'PHAO DONG NANG', 'SIEU DINH AP SUAT',
    'XA THU BIEN SAU', 'XUNG PHONG CHIEN HAM', 'TIA CHOP XUYEN THAU', 'QUAN DOAN THEP', 'MAY KHI THUY TO'
  ],
  bossLeviathan: [
    'CHUA TE HU KHONG', 'LEVIATHAN TOI THUONG', 'TAN THE DAI DUONG', 'LOC XOAY VO TAN', 'CHAN DONG TRAI DAT',
    'CHIN TANG DIA NGUC', 'QUYEN UY HU VO', 'BAP BEP NGAN SAO', 'KHAI HOAN THANG LOI', 'VUA CUA MUON LOAI'
  ]
};

export function getRandomWordByTime(dict: WordDictionary, gameTimeSeconds: number): string {
  let pool = dict.tier1;
  const roll = Math.random();

  if (gameTimeSeconds < 180) {
    pool = roll < 0.85 ? dict.tier1 : dict.tier2;
  } else if (gameTimeSeconds < 420) {
    pool = roll < 0.2 ? dict.tier1 : roll < 0.85 ? dict.tier2 : dict.tier3;
  } else if (gameTimeSeconds < 780) {
    pool = roll < 0.15 ? dict.tier2 : roll < 0.75 ? dict.tier3 : dict.tier4;
  } else if (gameTimeSeconds < 1200) {
    pool = roll < 0.1 ? dict.tier3 : roll < 0.75 ? dict.tier4 : dict.tier5;
  } else {
    pool = roll < 0.3 ? dict.tier4 : dict.tier5;
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex].toUpperCase();
}

export function getRandomWord(dict: WordDictionary, tier: 1 | 2 | 3 | 4 | 5): string {
  let pool = dict.tier1;
  if (tier === 2) pool = dict.tier2;
  else if (tier === 3) pool = dict.tier3;
  else if (tier === 4) pool = dict.tier4;
  else if (tier === 5) pool = dict.tier5;

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex].toUpperCase();
}

export function getRandomCleanseWord(dict: WordDictionary): string {
  const pool = dict.cleanse;
  return pool[Math.floor(Math.random() * pool.length)].toUpperCase();
}

export function getRandomBarrelWord(dict: WordDictionary): string {
  const pool = dict.barrels;
  return pool[Math.floor(Math.random() * pool.length)].toUpperCase();
}

export function getRandomEliteWord(dict: WordDictionary): string {
  const pool = dict.elites;
  return pool[Math.floor(Math.random() * pool.length)].toUpperCase();
}

export function getRandomBossWord(
  dict: WordDictionary,
  bossId: 'megalodon' | 'kraken' | 'dragon' | 'behemoth' | 'leviathan'
): string {
  let pool = dict.bossMegalodon;
  if (bossId === 'kraken') pool = dict.bossKraken;
  else if (bossId === 'dragon') pool = dict.bossDragon;
  else if (bossId === 'behemoth') pool = dict.bossBehemoth;
  else if (bossId === 'leviathan') pool = dict.bossLeviathan;

  return pool[Math.floor(Math.random() * pool.length)].toUpperCase();
}
