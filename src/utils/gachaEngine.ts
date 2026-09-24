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
 * Rolls a single item according to shop tier rates boosted by Destiny Core (NO PITY/INSURANCE)
 */
export function rollSingleGacha(
  tier: ShopTier,
  forceMinRare: boolean = false,
  destinyLevel: number = 0
): GachaItem {
  // Destiny Core multipliers (up to 4.5x for Mystic, +180% for Legend/Epic)
  const mysticMultiplier =
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

  const rateBonus = getCoreBonusMultiplier('destiny', destinyLevel);

  const mysticRate = tier.rates.mystic * mysticMultiplier;
  const legendRate = tier.rates.legend * (1 + rateBonus);
  const epicRate = tier.rates.epic * (1 + rateBonus * 0.7);
  const rareRate = tier.rates.rare;

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

  const pool = ITEMS_BY_RARITY[rarity];
  const itemIndex = Math.floor(Math.random() * pool.length);
  return pool[itemIndex];
}

/**
 * Rolls 10 items for a 10-pull
 * Guarantees at least 1 item is Rare or better as standard courtesy
 */
export function rollTenGacha(
  tier: ShopTier,
  destinyLevel: number = 0
): GachaItem[] {
  const results: GachaItem[] = [];
  let hasRareOrBetter = false;

  for (let i = 0; i < 9; i++) {
    const item = rollSingleGacha(tier, false, destinyLevel);
    if (item.rarity !== 'common') {
      hasRareOrBetter = true;
    }
    results.push(item);
  }

  // 10th card gets at least Rare if not yet found
  const finalItem = rollSingleGacha(tier, !hasRareOrBetter, destinyLevel);
  results.push(finalItem);

  return results;
}
