import { GachaItem, Rarity, ShopTier } from '../types/gacha';
import { GACHA_ITEMS } from '../data/gachaItems';
import { getCoreBonusMultiplier } from '../data/coresData';

// Group items by rarity for rapid O(1) sampling
const ITEMS_BY_RARITY: Record<Rarity, GachaItem[]> = {
  common: GACHA_ITEMS.filter(item => item.rarity === 'common'),
  rare: GACHA_ITEMS.filter(item => item.rarity === 'rare'),
  epic: GACHA_ITEMS.filter(item => item.rarity === 'epic'),
  legend: GACHA_ITEMS.filter(item => item.rarity === 'legend'),
  mystic: GACHA_ITEMS.filter(item => item.rarity === 'mystic'),
};

/**
 * Rolls a single item according to shop tier rates boosted by Destiny Core & Ancient Boons (NO PITY/INSURANCE)
 */
export function rollSingleGacha(
  tier: ShopTier,
  forceMinRare: boolean = false,
  destinyLevel: number = 0,
  boonSet?: Set<string>
): GachaItem {
  const hasBoon = (id: string) => boonSet?.has(id) ?? false;

  // Destiny Core multipliers (up to 4.5x for Mystic, +180% for Legend/Epic)
  let mysticMultiplier =
    destinyLevel >= 5
      ? 4.5
      : destinyLevel >= 4
      ? 3.5
      : destinyLevel >= 3
      ? 2.8
      : destinyLevel >= 2
      ? 2.0
      : destinyLevel >= 1
      ? 1.4
      : 1.0;

  if (hasBoon('boon-39')) {
    mysticMultiplier *= 1.2; // 20% all cores boost
  }

  const baseRateBonus = getCoreBonusMultiplier('destiny', destinyLevel);
  const rateBonus = baseRateBonus * (hasBoon('boon-39') ? 1.2 : 1.0);

  let mysticRate = tier.rates.mystic * mysticMultiplier;
  if (hasBoon('boon-03')) mysticRate += 0.5;
  if (hasBoon('boon-79')) mysticRate += 2.0;

  let legendRate = tier.rates.legend * (1 + rateBonus);
  if (hasBoon('boon-04')) legendRate += 3.0;
  if (hasBoon('boon-70')) legendRate *= 1.25;
  if (hasBoon('boon-75')) legendRate += 4.0;

  let epicRate = tier.rates.epic * (1 + rateBonus * 0.7);
  if (hasBoon('boon-05')) epicRate += 6.0;
  if (hasBoon('boon-75')) epicRate += 4.0;

  let rareRate = tier.rates.rare;
  if (hasBoon('boon-07')) rareRate += 8.0;

  if (hasBoon('boon-80')) {
    mysticRate *= 1.25;
    legendRate *= 1.25;
    epicRate *= 1.25;
  }

  const rand = Math.random() * 100; // 0.0 to 100.0

  let rarity: Rarity = 'common';

  // Check from highest rarity to lowest
  if (rand < mysticRate) {
    rarity = 'mystic';
  } else if (rand < mysticRate + legendRate) {
    rarity = 'legend';
  } else if (rand < mysticRate + legendRate + epicRate) {
    rarity = 'epic';
  } else if (rand < mysticRate + legendRate + epicRate + rareRate || forceMinRare) {
    rarity = 'rare';
  } else {
    rarity = 'common';
  }

  let pool = ITEMS_BY_RARITY[rarity];

  // Element affinity boons weighting inside the pool if relevant
  if (boonSet && (hasBoon('boon-09') || hasBoon('boon-10') || hasBoon('boon-11') || hasBoon('boon-12') || hasBoon('boon-13') || hasBoon('boon-14') || hasBoon('boon-15') || hasBoon('boon-16') || hasBoon('boon-17') || hasBoon('boon-18') || hasBoon('boon-19') || hasBoon('boon-48'))) {
    const weights = pool.map(item => {
      let w = 1.0;
      if (hasBoon('boon-09') && item.element.includes('Kim')) w *= 1.6;
      if (hasBoon('boon-10') && item.element.includes('Mộc')) w *= 1.6;
      if (hasBoon('boon-11') && item.element.includes('Thủy')) w *= 1.6;
      if (hasBoon('boon-12') && item.element.includes('Hỏa')) w *= 1.6;
      if (hasBoon('boon-13') && item.element.includes('Thổ')) w *= 1.6;
      if (hasBoon('boon-14') && item.element.includes('Phong')) w *= 1.6;
      if (hasBoon('boon-15') && item.element.includes('Lôi')) w *= 1.6;
      if (hasBoon('boon-16') && item.element.includes('Băng')) w *= 1.6;
      if (hasBoon('boon-17') && item.element.includes('Quang')) w *= 1.7;
      if (hasBoon('boon-18') && item.element.includes('Ám')) w *= 1.7;
      if (hasBoon('boon-19') && item.element.includes('Hư Không')) w *= 2.0;
      if (hasBoon('boon-48') && item.category === 'beast' && (item.rarity === 'rare' || item.rarity === 'epic')) w *= 1.4;
      return w;
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * totalWeight;
    for (let i = 0; i < pool.length; i++) {
      r -= weights[i];
      if (r <= 0) return pool[i];
    }
  }

  const itemIndex = Math.floor(Math.random() * pool.length);
  return pool[itemIndex];
}

/**
 * Rolls 10 items for a 10-pull
 * Guarantees at least 1 item is Rare or better as standard courtesy
 */
export function rollTenGacha(
  tier: ShopTier,
  destinyLevel: number = 0,
  boonSet?: Set<string>
): GachaItem[] {
  const results: GachaItem[] = [];
  let hasRareOrBetter = false;

  for (let i = 0; i < 9; i++) {
    const item = rollSingleGacha(tier, false, destinyLevel, boonSet);
    if (item.rarity !== 'common') {
      hasRareOrBetter = true;
    }
    results.push(item);
  }

  // 10th card gets at least Rare if not yet found
  const finalItem = rollSingleGacha(tier, !hasRareOrBetter, destinyLevel, boonSet);
  results.push(finalItem);

  return results;
}
