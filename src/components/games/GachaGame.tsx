import React, { useState, useEffect, useMemo } from 'react';
import { GachaItem, Rarity, CoreType } from '../../types/gacha';
import { AncientBoon } from '../../types/boon';
import { GACHA_ITEMS, RARITY_CONFIG } from '../../data/gachaItems';
import { SHOP_TIERS } from '../../data/shopTiers';
import { CHALLENGE_ORDERS } from '../../data/ordersData';
import { ARCANE_CORES, CORE_TYPES, getCoreBonusMultiplier } from '../../data/coresData';
import { rollThreeRandomBoons, getBoonById } from '../../data/boonsData';
import { rollSingleGacha, rollTenGacha } from '../../utils/gachaEngine';
import { gachaAudio } from '../../utils/gachaAudio';
import { saveGameData } from '../../utils/security';
import { SummoningAltar } from '../SummoningAltar';
import { CardRevealModal } from '../CardRevealModal';
import { ShopUpgradeModal } from '../ShopUpgradeModal';
import { ParchmentOrderModal } from '../ParchmentOrderModal';
import { ArcaneCoresModal } from '../ArcaneCoresModal';
import { BoonSelectionModal } from '../BoonSelectionModal';
import { ActiveBoonsModal } from '../ActiveBoonsModal';
import { InventoryView } from '../InventoryView';
import { CodexView } from '../CodexView';
import {
  Sparkles,
  Scroll,
  Store,
  Coins,
  Maximize2,
  Minimize2,
  HelpCircle,
  X,
  Volume2,
  VolumeX,
  Shield,
  ShieldAlert,
  Zap,
  Award,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { UserAccount } from '../../types/auth';

interface GachaGameProps {
  onGainSessionExp?: () => void;
  currentUser?: UserAccount | null;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

const DEFAULT_CORES: Record<CoreType, number> = {
  // Stage 1
  alchemy: 0,
  destiny: 0,
  fortune: 0,
  // Stage 2
  roll_surge: 0,
  harvester: 0,
  order: 0,
  // Stage 3
  free_roll: 0,
  channelling: 0,
  miracle: 0,
  // Stage 4
  enlighten: 0,
  treasury: 0,
  codex_master: 0,
  // Stage 5
  weapon_master: 0,
  armor_master: 0,
  potion_master: 0,
  // Stage 6
  relic_master: 0,
  beast_master: 0,
  rune_master: 0,
  // Stage 7
  roll_frenzy: 0,
  element_metal: 0,
  element_wood: 0,
  // Stage 8
  element_water: 0,
  element_fire: 0,
  element_earth: 0,
  // Stage 9
  element_wind: 0,
  element_ice: 0,
  void_abyss: 0,
  // Stage 10
  divine_light: 0,
  dark_shadow: 0,
  omnipresence: 0,
};

export const GachaGame: React.FC<GachaGameProps> = ({
  onGainSessionExp,
  currentUser,
  onOpenAuth,
}) => {
  // Storage target: localStorage for registered user, sessionStorage for transient guest
  const storage = typeof window !== 'undefined' ? (currentUser ? localStorage : sessionStorage) : null;
  const keyPrefix = currentUser ? `vcktr_user_${currentUser.id}_` : 'vcktr_guest_';

  // Persistence - default 100 coins
  const [coins, setCoins] = useState<number>(() => {
    if (!storage) return 100;
    const saved = storage.getItem(`${keyPrefix}coins`);
    return saved !== null ? Number(saved) : 100;
  });

  const [inventory, setInventory] = useState<Record<string, number>>(() => {
    if (!storage) return {};
    const saved = storage.getItem(`${keyPrefix}inventory`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  });

  const [discoveredItemIds, setDiscoveredItemIds] = useState<string[]>(() => {
    if (!storage) return [];
    const saved = storage.getItem(`${keyPrefix}discovered`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [shopTierIndex, setShopTierIndex] = useState<number>(() => {
    if (!storage) return 0;
    const saved = storage.getItem(`${keyPrefix}shop_tier_idx`);
    return saved !== null ? Math.min(5, Math.max(0, Number(saved))) : 0;
  });

  const [challengeStage, setChallengeStage] = useState<number>(() => {
    if (!storage) return 1;
    const saved = storage.getItem(`${keyPrefix}challenge_stage`);
    return saved !== null ? Math.min(10, Math.max(1, Number(saved))) : 1;
  });

  // Arcane Cores State (9 Cores)
  const [coreLevels, setCoreLevels] = useState<Record<CoreType, number>>(() => {
    if (!storage) return { ...DEFAULT_CORES };
    const saved = storage.getItem(`${keyPrefix}core_levels`);
    if (saved) {
      try {
        return { ...DEFAULT_CORES, ...JSON.parse(saved) };
      } catch {
        return { ...DEFAULT_CORES };
      }
    }
    return { ...DEFAULT_CORES };
  });

  // Active Boons State (Selected 1 of 3 from 80 Boons on completing orders)
  const [activeBoonIds, setActiveBoonIds] = useState<string[]>(() => {
    if (!storage) return [];
    const saved = storage.getItem(`${keyPrefix}active_boons`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Current view tab: 'gacha' | 'inventory' | 'codex'
  const [activeTab, setActiveTab] = useState<'gacha' | 'inventory' | 'codex'>('gacha');

  // Modal states
  const [revealedItems, setRevealedItems] = useState<GachaItem[] | null>(null);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isParchmentModalOpen, setIsParchmentModalOpen] = useState(false);
  const [isCoresModalOpen, setIsCoresModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Boon selection modal state (when completing an order)
  const [isBoonSelectionOpen, setIsBoonSelectionOpen] = useState(false);
  const [pendingBoonChoices, setPendingBoonChoices] = useState<AncientBoon[]>([]);
  const [completedStageForBoon, setCompletedStageForBoon] = useState(1);
  const [isActiveBoonsListOpen, setIsActiveBoonsListOpen] = useState(false);

  // Toast feedback (e.g. Fortune Cashback, Miracle Surge, Harvester Bonus)
  const [activeToast, setActiveToast] = useState<{ message: string; color: string } | null>(null);

  const showToast = (message: string, color: string = 'text-amber-300') => {
    setActiveToast({ message, color });
    setTimeout(() => {
      setActiveToast(null);
    }, 3500);
  };

  // Sync state to storage
  useEffect(() => {
    if (storage) {
      storage.setItem(`${keyPrefix}coins`, coins.toString());
      storage.setItem(`${keyPrefix}inventory`, JSON.stringify(inventory));
      storage.setItem(`${keyPrefix}discovered`, JSON.stringify(discoveredItemIds));
      storage.setItem(`${keyPrefix}shop_tier_idx`, shopTierIndex.toString());
      storage.setItem(`${keyPrefix}challenge_stage`, challengeStage.toString());
      storage.setItem(`${keyPrefix}core_levels`, JSON.stringify(coreLevels));
      storage.setItem(`${keyPrefix}active_boons`, JSON.stringify(activeBoonIds));
    }

    // Also mirror into global user game data store
    if (currentUser) {
      saveGameData(currentUser, {
        coins,
        inventory,
        discoveredItemIds,
        shopTierIndex,
        challengeStage,
        coreLevels,
        activeBoonIds,
      });
    }
  }, [coins, inventory, discoveredItemIds, shopTierIndex, challengeStage, coreLevels, activeBoonIds, storage, keyPrefix, currentUser]);

  // Clean guest transient data on tab close / exit
  useEffect(() => {
    if (!currentUser) {
      const handleCleanGuest = () => {
        try {
          sessionStorage.removeItem('vcktr_guest_coins');
          sessionStorage.removeItem('vcktr_guest_inventory');
          sessionStorage.removeItem('vcktr_guest_discovered');
          sessionStorage.removeItem('vcktr_guest_shop_tier_idx');
          sessionStorage.removeItem('vcktr_guest_challenge_stage');
          sessionStorage.removeItem('vcktr_guest_core_levels');
          sessionStorage.removeItem('vcktr_guest_active_boons');
        } catch {}
      };
      window.addEventListener('beforeunload', handleCleanGuest);
      window.addEventListener('pagehide', handleCleanGuest);
      return () => {
        window.removeEventListener('beforeunload', handleCleanGuest);
        window.removeEventListener('pagehide', handleCleanGuest);
      };
    }
  }, [currentUser]);

  // Derived states
  const currentTier = SHOP_TIERS[shopTierIndex] || SHOP_TIERS[0];
  const currentOrder = CHALLENGE_ORDERS[challengeStage - 1] || CHALLENGE_ORDERS[0];

  // Check active boons buffs
  const boonSet = useMemo(() => new Set(activeBoonIds), [activeBoonIds]);

  const hasExtraDiscountBoon = boonSet.has('boon-60'); // -2 coins on 10-pull
  const hasPassiveInterestBoon = boonSet.has('boon-25'); // +4 coins on 10-pull
  const hasDoubleFortuneBoon = boonSet.has('boon-63'); // double fortune chance
  const supremeStatsBoonMultiplier = boonSet.has('boon-80') ? 0.25 : 0;
  const extraSellMultiplierFromBoons =
    (boonSet.has('boon-69') ? 0.10 : 0) +
    (boonSet.has('boon-78') ? 0.30 : 0) +
    supremeStatsBoonMultiplier;

  // Multipliers from 9 Arcane Cores + Boons
  const baseAlchemyBonus = getCoreBonusMultiplier('alchemy', coreLevels.alchemy || 0);
  const alchemyBonusMultiplier = baseAlchemyBonus + extraSellMultiplierFromBoons;

  const baseOrderBonus = getCoreBonusMultiplier('order', coreLevels.order || 0);
  const boonOrderBonus = boonSet.has('boon-73') ? 0.40 : 0;
  const orderBonusMultiplier = baseOrderBonus + boonOrderBonus + supremeStatsBoonMultiplier;

  const rawFortuneChance = getCoreBonusMultiplier('fortune', coreLevels.fortune || 0);
  const fortuneChance = hasDoubleFortuneBoon ? Math.min(0.85, rawFortuneChance * 2) : rawFortuneChance;

  const harvesterChance = getCoreBonusMultiplier('harvester', coreLevels.harvester || 0);

  // Channelling Core calculations (discounts on 10-pull and Shop Tier)
  const channellingDiscount = getCoreBonusMultiplier('channelling', coreLevels.channelling || 0);
  const total10PullDiscount = channellingDiscount + (hasExtraDiscountBoon ? 2 : 0);
  const spin10Cost = Math.max(10, 20 - total10PullDiscount);

  let rawShopDiscount = [0, 0.1, 0.2, 0.3, 0.4, 0.5][Math.min(5, coreLevels.channelling || 0)];
  if (boonSet.has('boon-01')) rawShopDiscount = Math.min(0.8, rawShopDiscount + 0.5);
  const shopDiscountPercent = rawShopDiscount;

  // Treasury Core calculations + Boons
  const baseGrant = getCoreBonusMultiplier('treasury', coreLevels.treasury || 0) || 20;
  const boonGrantBonus = boonSet.has('boon-27') ? 45 : 0;
  const treasuryGrantAmount = baseGrant + boonGrantBonus;

  const baseTreasuryInterest = [0, 0, 2, 5, 10, 20][Math.min(5, coreLevels.treasury || 0)];
  const treasuryInterestPer10 = baseTreasuryInterest + (hasPassiveInterestBoon ? 4 : 0);

  // Miracle Core values
  const miracleBaseBonus = getCoreBonusMultiplier('miracle', coreLevels.miracle || 0);

  // Enlighten Core values (bonus gold per duplicate item)
  const enlightenBonusPerDup = getCoreBonusMultiplier('enlighten', coreLevels.enlighten || 0);

  // Set for CodexView
  const discoveredSet = useMemo(() => new Set(discoveredItemIds), [discoveredItemIds]);

  // Check if current challenge order is ready to complete
  const isOrderReady = useMemo(() => {
    return currentOrder.requirements.every(req => {
      const currentCount = inventory[req.itemId] || 0;
      return currentCount >= req.requiredCount;
    });
  }, [currentOrder, inventory]);

  // Total items in inventory
  const totalItemCount = useMemo(() => {
    return Object.values(inventory).reduce((a, b) => a + b, 0);
  }, [inventory]);

  // Common and Rare items statistics for Quick Sell
  const commonStats = useMemo(() => {
    let count = 0;
    GACHA_ITEMS.filter(it => it.rarity === 'common').forEach(it => {
      count += inventory[it.id] || 0;
    });
    const extraCommonBoon = boonSet.has('boon-52') ? 0.60 : 0;
    const val = Math.round(count * RARITY_CONFIG.common.sellPrice * (1 + alchemyBonusMultiplier + extraCommonBoon) * 10) / 10;
    return { count, val };
  }, [inventory, alchemyBonusMultiplier, boonSet]);

  const rareStats = useMemo(() => {
    let count = 0;
    GACHA_ITEMS.filter(it => it.rarity === 'rare').forEach(it => {
      count += inventory[it.id] || 0;
    });
    const extraRareBoon = boonSet.has('boon-08') ? 0.25 : 0;
    const val = Math.round(count * RARITY_CONFIG.rare.sellPrice * (1 + alchemyBonusMultiplier + extraRareBoon) * 10) / 10;
    return { count, val };
  }, [inventory, alchemyBonusMultiplier, boonSet]);

  // PULL LOGIC (x1: 2 coins, x10: dynamic spin10Cost coins) - PURE DROP RATES BOOSTED BY DESTINY, NO PITY
  const handlePull = (count: 1 | 10) => {
    const cost = count === 1 ? 2 : spin10Cost;
    if (coins < cost) {
      alert(`Bạn cần tối thiểu ${cost} Đồng để thực hiện lượt quay này!`);
      return;
    }

    // Check Fortune Core Cashback
    let refundedCoins = 0;
    let isJackpotRefund = false;
    if (fortuneChance > 0 && Math.random() < fortuneChance) {
      if (coreLevels.fortune >= 5 && Math.random() < 0.20) {
        // Nổ hũ Thần Tài cực đại: x3 chi phí!
        refundedCoins = cost * 3;
        isJackpotRefund = true;
      } else if (coreLevels.fortune >= 4 && Math.random() < 0.10) {
        // Nổ hũ Thần Tài: x2 chi phí
        refundedCoins = cost * 2;
        isJackpotRefund = true;
      } else {
        refundedCoins = cost;
      }
    }

    // Passive interest yield from Treasury Core and Boons on x10 pulls
    const treasuryYield = count === 10 ? treasuryInterestPer10 : 0;

    // Roll items with roll-boosting cores (roll_surge, roll_frenzy, free_roll)
    let totalCardsToPull = count;
    let rollSurgeExtra = 0;
    let rollFrenzyExtra = 0;
    let freeRollExtra = 0;

    if (count === 10) {
      // 1. Lõi Tụ Khí (roll_surge): Tăng số thẻ bốc khi quay 10 (+1, +2, +3, +4, +5)
      const surgeLvl = coreLevels.roll_surge || 0;
      if (surgeLvl > 0) {
        rollSurgeExtra = Math.min(5, surgeLvl);
        totalCardsToPull += rollSurgeExtra;
      }

      // 2. Lõi Cuồng Nộ (roll_frenzy): Xác suất kích hoạt bốc thêm từ 3 đến 8 thẻ miễn phí
      const frenzyLvl = coreLevels.roll_frenzy || 0;
      if (frenzyLvl > 0) {
        const frenzyChance = [0, 0.18, 0.28, 0.38, 0.48, 0.55][frenzyLvl];
        if (Math.random() < frenzyChance) {
          rollFrenzyExtra = [0, 3, 4, 5, 6, 8][frenzyLvl];
          totalCardsToPull += rollFrenzyExtra;
        }
      }
    }

    // 3. Lõi Thiên Lực (free_roll): Xác suất tặng thêm thẻ roll miễn phí trên mọi lượt quay
    const freeRollLvl = coreLevels.free_roll || 0;
    if (freeRollLvl > 0) {
      const freeRollChance = [0, 0.15, 0.25, 0.35, 0.45, 0.55][freeRollLvl];
      if (Math.random() < freeRollChance) {
        freeRollExtra = freeRollLvl >= 5 && Math.random() < 0.2 ? 5 : (freeRollLvl >= 3 && Math.random() < 0.25 ? 2 : 1);
        totalCardsToPull += freeRollExtra;
      }
    }

    // Roll items (pure rates boosted by Destiny core, NO PITY)
    let pulled: GachaItem[] = [];
    if (totalCardsToPull === 1) {
      pulled = [rollSingleGacha(currentTier, false, coreLevels.destiny || 0)];
    } else {
      for (let i = 0; i < totalCardsToPull; i++) {
        pulled.push(rollSingleGacha(currentTier, false, coreLevels.destiny || 0));
      }
    }

    // Transmutation Boons (boon-49: 25% Common -> Rare, boon-50: 15% Rare -> Epic, boon-51: 8% Epic -> Legend)
    if (boonSet.has('boon-49') || boonSet.has('boon-50') || boonSet.has('boon-51')) {
      pulled = pulled.map(item => {
        if (item.rarity === 'common' && boonSet.has('boon-49') && Math.random() < 0.25) {
          const rarePool = GACHA_ITEMS.filter(it => it.rarity === 'rare');
          return rarePool[Math.floor(Math.random() * rarePool.length)];
        }
        if (item.rarity === 'rare' && boonSet.has('boon-50') && Math.random() < 0.15) {
          const epicPool = GACHA_ITEMS.filter(it => it.rarity === 'epic');
          return epicPool[Math.floor(Math.random() * epicPool.length)];
        }
        if (item.rarity === 'epic' && boonSet.has('boon-51') && Math.random() < 0.08) {
          const legendPool = GACHA_ITEMS.filter(it => it.rarity === 'legend');
          return legendPool[Math.floor(Math.random() * legendPool.length)];
        }
        return item;
      });
    }

    // Harvester Core: chance to multiply item quantities (x2, x3)
    let harvesterTriggerCount = 0;
    let miracleBonusCoins = 0;
    let enlightenBonusCoins = 0;
    let codexBonusCoins = 0;

    const codexLvl = coreLevels.codex_master || 0;
    const coinPerNewItem = [0, 20, 50, 100, 220, 400][codexLvl];

    const newDiscovered = new Set(discoveredItemIds);
    const updatedInventory = { ...inventory };

    pulled.forEach(item => {
      let addCount = 1;

      // Codex Master core: reward coins for newly discovered items
      if (!discoveredItemIds.includes(item.id) && !newDiscovered.has(item.id)) {
        if (coinPerNewItem > 0) {
          codexBonusCoins += coinPerNewItem;
        }
      }

      // Beast mastery boon & Beast Master core
      if (item.category === 'beast') {
        if (boonSet.has('boon-44')) addCount += 1;
        const beastCoreLvl = coreLevels.beast_master || 0;
        if (beastCoreLvl >= 5) addCount += 2;
        else if (beastCoreLvl >= 4) addCount += 1;
        else if (beastCoreLvl >= 1 && Math.random() < [0, 0.3, 0.5, 0.75][beastCoreLvl]) addCount += 1;
      }

      if (harvesterChance > 0) {
        const isCommonOrRare = item.rarity === 'common' || item.rarity === 'rare';
        const isEpic = item.rarity === 'epic';
        const isHigh = item.rarity === 'legend' || item.rarity === 'mystic';

        if (coreLevels.harvester >= 5) {
          if (Math.random() < 0.15) addCount = 3; // Triple drop
          else if (isCommonOrRare || Math.random() < 0.5) addCount = 2;
        } else if (isCommonOrRare && Math.random() < harvesterChance) {
          addCount = 2;
        } else if (isEpic && coreLevels.harvester >= 2 && Math.random() < 0.2) {
          addCount = 2;
        } else if (isHigh && coreLevels.harvester >= 4 && Math.random() < 0.12) {
          addCount = 2;
        }
      }

      if (addCount > 1) harvesterTriggerCount++;

      // Miracle Core & Boon-71: bonus gold on high-tier hits
      if (miracleBaseBonus > 0 || boonSet.has('boon-71')) {
        if (item.rarity === 'epic') miracleBonusCoins += miracleBaseBonus;
        else if (item.rarity === 'legend') miracleBonusCoins += miracleBaseBonus * 3.5 + (boonSet.has('boon-71') ? 150 : 0);
        else if (item.rarity === 'mystic') miracleBonusCoins += miracleBaseBonus * 10 + (boonSet.has('boon-71') ? 150 : 0);
      }

      // Boon-45 & Rune Master Core
      if (item.category === 'rune') {
        if (boonSet.has('boon-45')) miracleBonusCoins += 12;
        const runeCoreLvl = coreLevels.rune_master || 0;
        if (runeCoreLvl > 0) {
          miracleBonusCoins += [0, 15, 30, 60, 100, 200][runeCoreLvl];
        }
      }

      // Enlighten Core: bonus gold for duplicates
      if (enlightenBonusPerDup > 0 && (updatedInventory[item.id] || 0) > 0) {
        enlightenBonusCoins += enlightenBonusPerDup * addCount;
      }

      updatedInventory[item.id] = (updatedInventory[item.id] || 0) + addCount;
      newDiscovered.add(item.id);
    });

    // Dark Shadow Core: protection against bad rolls (no Epic/Legend/Mystic)
    let shadowRefund = 0;
    const shadowLvl = coreLevels.dark_shadow || 0;
    if (shadowLvl > 0) {
      const hasHighTier = pulled.some(it => it.rarity === 'epic' || it.rarity === 'legend' || it.rarity === 'mystic');
      if (!hasHighTier) {
        const refundPercent = [0, 0.20, 0.30, 0.40, 0.50, 0.65][shadowLvl];
        shadowRefund = Number((cost * refundPercent).toFixed(1));
      }
    }

    // Total net coins change
    const totalExtraEarnings = refundedCoins + treasuryYield + miracleBonusCoins + enlightenBonusCoins + codexBonusCoins + shadowRefund;
    const netCoinsDelta = totalExtraEarnings - cost;

    setCoins(prev => Math.max(0, Number((prev + netCoinsDelta).toFixed(1))));

    // Feedback toasts
    if (rollSurgeExtra > 0 || rollFrenzyExtra > 0 || freeRollExtra > 0) {
      const extraList: string[] = [];
      if (rollSurgeExtra > 0) extraList.push(`+${rollSurgeExtra} Tụ Khí`);
      if (rollFrenzyExtra > 0) extraList.push(`+${rollFrenzyExtra} Cuồng Nộ`);
      if (freeRollExtra > 0) extraList.push(`+${freeRollExtra} Thiên Lực`);
      showToast(`🎲 TĂNG LƯỢT ROLL: Bốc tổng cộng ${totalCardsToPull} THẺ (${extraList.join(', ')})!`, 'text-cyan-300 font-black');
    }

    if (isJackpotRefund) {
      gachaAudio.playCoinsSound();
      showToast(`🪙 NỔ HŨ THẦN TÀI! Thưởng x3: Nhận lại +${refundedCoins} Đồng!`, 'text-yellow-300 font-black');
    } else if (refundedCoins > 0) {
      gachaAudio.playCoinsSound();
      showToast(`🪙 THẦN TÀI HOÀN TIỀN! Miễn phí lượt quay: Nhận lại +${refundedCoins} Đồng!`, 'text-amber-300 font-bold');
    } else if (miracleBonusCoins > 0) {
      gachaAudio.playCoinsSound();
      showToast(`✨ KỲ TÍCH HOÀNG KIM: Thưởng nóng +${Math.round(miracleBonusCoins)} Đồng!`, 'text-purple-300 font-bold');
    } else if (harvesterTriggerCount > 0) {
      showToast(`🌾 LÕI BỘI THU: ${harvesterTriggerCount} món được nhân thêm số lượng!`, 'text-emerald-300 font-bold');
    } else if (enlightenBonusCoins > 0) {
      showToast(`🔮 GIÁC NGỘ TINH HOA: Nhận thêm +${Math.round(enlightenBonusCoins * 10) / 10} Đồng từ đồ trùng!`, 'text-indigo-300 font-bold');
    } else if (codexBonusCoins > 0) {
      showToast(`📖 LÕI BÁCH KHOA: Khám phá báu vật mới, thưởng nóng +${codexBonusCoins} Đồng!`, 'text-amber-400 font-bold');
    } else if (shadowRefund > 0) {
      showToast(`🌑 LÕI ÁM ẢNH: Bảo hiểm lượt quay thường, hoàn trả +${shadowRefund} Đồng!`, 'text-purple-400 font-bold');
    }

    setInventory(updatedInventory);
    setDiscoveredItemIds(Array.from(newDiscovered));
    setRevealedItems(pulled);
    onGainSessionExp?.();
  };

  // SELL LOGIC (item price * alchemyMultiplier * category boons * 30 cores)
  const getItemEffectiveSellPrice = (item: GachaItem): number => {
    let multiplier = 1 + alchemyBonusMultiplier;

    // Category specialization boons & cores
    if (item.category === 'weapon') {
      if (boonSet.has('boon-40')) multiplier *= 2;
      const wLvl = coreLevels.weapon_master || 0;
      if (wLvl > 0) multiplier *= (1 + [0, 0.30, 0.60, 1.00, 1.50, 2.00][wLvl]);
    }
    if (item.category === 'armor') {
      if (boonSet.has('boon-41')) multiplier *= 2;
      const aLvl = coreLevels.armor_master || 0;
      if (aLvl > 0) multiplier *= (1 + [0, 0.30, 0.60, 1.00, 1.50, 2.00][aLvl]);
    }
    if (item.category === 'potion') {
      if (boonSet.has('boon-42')) multiplier *= 2.2;
      const pLvl = coreLevels.potion_master || 0;
      if (pLvl > 0) multiplier *= (1 + [0, 0.35, 0.70, 1.10, 1.60, 2.20][pLvl]);
    }
    if (item.category === 'relic') {
      if (boonSet.has('boon-43')) multiplier *= 2;
      const rLvl = coreLevels.relic_master || 0;
      if (rLvl > 0) multiplier *= (1 + [0, 0.40, 0.80, 1.20, 1.75, 2.50][rLvl]);
    }
    if (item.category === 'beast') {
      const bLvl = coreLevels.beast_master || 0;
      if (bLvl > 0) multiplier *= (1 + [0, 0.30, 0.50, 1.00, 1.50, 2.00][bLvl]);
    }
    if (item.category === 'rune') {
      const rLvl = coreLevels.rune_master || 0;
      if (rLvl > 0) multiplier *= (1 + [0, 0.35, 0.70, 1.10, 1.60, 2.50][rLvl]);
    }

    // Element cores
    if (item.element.includes('Kim')) {
      const kLvl = coreLevels.element_metal || 0;
      if (kLvl > 0) multiplier *= (1 + [0, 0.40, 0.80, 1.20, 1.80, 2.50][kLvl]);
    }
    if (item.element.includes('Mộc')) {
      const mLvl = coreLevels.element_wood || 0;
      if (mLvl > 0) multiplier *= (1 + [0, 0.40, 0.80, 1.20, 1.80, 2.50][mLvl]);
    }
    if (item.element.includes('Thủy')) {
      const tLvl = coreLevels.element_water || 0;
      if (tLvl > 0) multiplier *= (1 + [0, 0.40, 0.80, 1.25, 1.90, 2.60][tLvl]);
    }
    if (item.element.includes('Hỏa')) {
      const hLvl = coreLevels.element_fire || 0;
      if (hLvl > 0) multiplier *= (1 + [0, 0.40, 0.80, 1.25, 1.90, 2.60][hLvl]);
    }
    if (item.element.includes('Thổ')) {
      const dLvl = coreLevels.element_earth || 0;
      if (dLvl > 0) multiplier *= (1 + [0, 0.40, 0.80, 1.25, 1.90, 2.60][dLvl]);
    }
    if (item.element.includes('Phong') || item.element.includes('Lôi')) {
      const pLvl = coreLevels.element_wind || 0;
      if (pLvl > 0) multiplier *= (1 + [0, 0.45, 0.90, 1.40, 2.00, 3.00][pLvl]);
    }
    if (item.element.includes('Băng')) {
      const iLvl = coreLevels.element_ice || 0;
      if (iLvl > 0) multiplier *= (1 + [0, 0.45, 0.90, 1.40, 2.00, 3.00][iLvl]);
    }
    if (item.element.includes('Quang')) {
      const qLvl = coreLevels.divine_light || 0;
      if (qLvl > 0) multiplier *= (1 + [0, 0.60, 1.20, 1.80, 2.50, 3.50][qLvl]);
    }
    if (item.element.includes('Ám') || item.element.includes('U')) {
      const dLvl = coreLevels.dark_shadow || 0;
      if (dLvl > 0) multiplier *= (1 + [0, 0.60, 1.20, 1.80, 2.50, 3.50][dLvl]);
    }

    // Omnipresence Core (Boosts everything)
    const omniLvl = coreLevels.omnipresence || 0;
    if (omniLvl > 0) {
      multiplier *= (1 + [0, 0.15, 0.30, 0.50, 0.75, 1.00][omniLvl]);
    }

    if (item.rarity === 'mystic' && boonSet.has('boon-72')) multiplier *= 2.5;

    const basePrice = RARITY_CONFIG[item.rarity]?.sellPrice ?? item.sellPrice;
    return Number((basePrice * multiplier).toFixed(1));
  };

  const handleSellItem = (itemId: string, count: number) => {
    const available = inventory[itemId] || 0;
    if (available < count) return;

    const targetItem = GACHA_ITEMS.find(it => it.id === itemId);
    if (!targetItem) return;

    const unitPrice = getItemEffectiveSellPrice(targetItem);
    const earned = Number((unitPrice * count).toFixed(1));
    setCoins(prev => Number((prev + earned).toFixed(1)));

    setInventory(prev => {
      const copy = { ...prev };
      const nextVal = copy[itemId] - count;
      if (nextVal <= 0) {
        delete copy[itemId];
      } else {
        copy[itemId] = nextVal;
      }
      return copy;
    });

    gachaAudio.playCoinsSound();
  };

  // Bulk sell in inventory
  const handleBulkSell = (rarity: Rarity, preserveOne: boolean) => {
    let earned = 0;
    const nextInventory = { ...inventory };

    GACHA_ITEMS.filter(it => it.rarity === rarity).forEach(item => {
      const count = nextInventory[item.id] || 0;
      if (count > 0) {
        const sellAmount = preserveOne ? count - 1 : count;
        if (sellAmount > 0) {
          const unitPrice = getItemEffectiveSellPrice(item);
          earned += sellAmount * unitPrice;
          if (preserveOne) {
            nextInventory[item.id] = 1;
          } else {
            delete nextInventory[item.id];
          }
        }
      }
    });

    if (earned > 0) {
      setCoins(prev => Number((prev + Math.round(earned * 10) / 10).toFixed(1)));
      setInventory(nextInventory);
      gachaAudio.playCoinsSound();
      showToast(`Thu được +${Math.round(earned * 10) / 10} Đồng từ bán vật phẩm!`);
    }
  };

  // Bulk sell duplicates across all items
  const handleBulkSellDuplicates = () => {
    let earned = 0;
    const nextInventory = { ...inventory };

    GACHA_ITEMS.forEach(item => {
      const count = nextInventory[item.id] || 0;
      if (count > 1) {
        const sellAmount = count - 1;
        const unitPrice = getItemEffectiveSellPrice(item);
        earned += sellAmount * unitPrice;
        nextInventory[item.id] = 1;
      }
    });

    if (earned > 0) {
      setCoins(prev => Number((prev + Math.round(earned * 10) / 10).toFixed(1)));
      setInventory(nextInventory);
      gachaAudio.playCoinsSound();
      showToast(`Thu được +${Math.round(earned * 10) / 10} Đồng từ toàn bộ đồ trùng lặp!`);
    }
  };

  // Quick sell all Common items
  const handleQuickSellCommon = () => {
    let earned = 0;
    const nextInventory = { ...inventory };

    GACHA_ITEMS.filter(it => it.rarity === 'common').forEach(item => {
      const count = nextInventory[item.id] || 0;
      if (count > 0) {
        const unitPrice = getItemEffectiveSellPrice(item);
        earned += count * unitPrice;
        delete nextInventory[item.id];
      }
    });

    if (earned > 0) {
      setCoins(prev => Number((prev + Math.round(earned * 10) / 10).toFixed(1)));
      setInventory(nextInventory);
      gachaAudio.playCoinsSound();
      showToast(`Đã bán toàn bộ Common: +${Math.round(earned * 10) / 10} Đồng!`);
    }
  };

  // Quick sell all Rare items
  const handleQuickSellRare = () => {
    let earned = 0;
    const nextInventory = { ...inventory };

    GACHA_ITEMS.filter(it => it.rarity === 'rare').forEach(item => {
      const count = nextInventory[item.id] || 0;
      if (count > 0) {
        const unitPrice = getItemEffectiveSellPrice(item);
        earned += count * unitPrice;
        delete nextInventory[item.id];
      }
    });

    if (earned > 0) {
      setCoins(prev => Number((prev + Math.round(earned * 10) / 10).toFixed(1)));
      setInventory(nextInventory);
      gachaAudio.playCoinsSound();
      showToast(`Đã bán toàn bộ Rare: +${Math.round(earned * 10) / 10} Đồng!`);
    }
  };

  // Sell selected rarities from card reveal modal
  const handleSellSelectedRarities = (targetRarities: Rarity[]) => {
    let earned = 0;
    const nextInventory = { ...inventory };

    GACHA_ITEMS.filter(it => targetRarities.includes(it.rarity)).forEach(item => {
      const count = nextInventory[item.id] || 0;
      if (count > 0) {
        const unitPrice = getItemEffectiveSellPrice(item);
        earned += count * unitPrice;
        delete nextInventory[item.id];
      }
    });

    if (earned > 0) {
      setCoins(prev => Number((prev + Math.round(earned * 10) / 10).toFixed(1)));
      setInventory(nextInventory);
      gachaAudio.playCoinsSound();
    }
  };

  // SHOP UPGRADE LOGIC
  const handleUpgradeTier = (nextTierIndex: number, cost: number) => {
    if (coins < cost) {
      alert(`Bạn cần ${cost} Đồng để nâng cấp lên Bậc ${nextTierIndex + 1}!`);
      return;
    }

    setCoins(prev => Number((prev - cost).toFixed(1)));
    setShopTierIndex(nextTierIndex);
    showToast(`Đã thăng cấp cửa hàng lên Bậc ${nextTierIndex + 1}!`);
  };

  // ARCANE CORE UPGRADE LOGIC
  const handleUpgradeCore = (coreType: CoreType, cost: number) => {
    if (coins < cost) {
      alert(`Bạn cần ${cost} Đồng để nâng cấp lõi này!`);
      return;
    }

    setCoins(prev => Number((prev - cost).toFixed(1)));
    setCoreLevels(prev => ({
      ...prev,
      [coreType]: Math.min(5, (prev[coreType] || 0) + 1),
    }));

    showToast(`🔮 Đã thăng cấp ${ARCANE_CORES[coreType].name} lên Cấp ${(coreLevels[coreType] || 0) + 1}!`, 'text-cyan-300 font-bold');
  };

  // CHALLENGE STAGE COMPLETION -> ROLLS 3 OF 80 ANCIENT BOONS
  const handleCompleteStage = (stage: number, rewardCoins: number) => {
    const orderToComplete = CHALLENGE_ORDERS[stage - 1];
    if (!orderToComplete) return;

    // Deduct required items from inventory
    const nextInventory = { ...inventory };
    orderToComplete.requirements.forEach(req => {
      nextInventory[req.itemId] = Math.max(0, (nextInventory[req.itemId] || 0) - req.requiredCount);
      if (nextInventory[req.itemId] <= 0) {
        delete nextInventory[req.itemId];
      }
    });

    const boonExtra = boonSet.has('boon-76') ? 80 : 0;
    const finalEarnedCoins = rewardCoins + boonExtra;

    setInventory(nextInventory);
    setCoins(prev => Number((prev + finalEarnedCoins).toFixed(1)));

    // Advance challenge stage (up to 10)
    if (stage >= challengeStage && challengeStage < 10) {
      setChallengeStage(prev => prev + 1);
    }

    // Roll 3 of 80 Ancient Boons for player to choose 1!
    const offeredBoons = rollThreeRandomBoons(activeBoonIds);
    setPendingBoonChoices(offeredBoons);
    setCompletedStageForBoon(stage);
    setIsBoonSelectionOpen(true);

    showToast(`🎉 Hoàn thành đơn hàng Đợt ${stage}! Nhận +${finalEarnedCoins} Đồng!`);
  };

  // PLAYER SELECTS 1 OF 3 ANCIENT BOONS
  const handleSelectBoon = (boon: AncientBoon) => {
    setIsBoonSelectionOpen(false);
    setActiveBoonIds(prev => [...prev, boon.id]);

    // Handle instant effects
    if (boon.instantCoinPercent) {
      const bonus = Math.max(20, Math.round(coins * boon.instantCoinPercent));
      setCoins(prev => prev + bonus);
      showToast(`🌟 Thần Lực ${boon.name}: Nhận ngay +${bonus} Đồng (+${Math.round(boon.instantCoinPercent * 100)}% ngân khố)!`, 'text-yellow-300 font-black');
    } else if (boon.instantCoinsFlat) {
      setCoins(prev => prev + boon.instantCoinsFlat!);
      showToast(`🌟 Thần Lực ${boon.name}: Ban tặng ngay +${boon.instantCoinsFlat} Đồng mặt!`, 'text-yellow-300 font-black');
    } else if (boon.instantCoreUpgrade) {
      const coreKey = boon.instantCoreUpgrade as CoreType;
      setCoreLevels(prev => ({
        ...prev,
        [coreKey]: Math.min(5, (prev[coreKey] || 0) + 1),
      }));
      showToast(`🌟 Thần Lực ${boon.name}: Nâng cấp miễn phí +1 Cấp cho ${ARCANE_CORES[coreKey]?.name}!`, 'text-cyan-300 font-bold');
    } else if (boon.freeShopTierUpgrade) {
      setShopTierIndex(prev => Math.min(5, prev + 1));
      showToast(`🌟 Thần Lực ${boon.name}: Đột phá miễn phí lên Bậc Cửa Hàng mới!`, 'text-purple-300 font-bold');
    } else {
      showToast(`🌟 Đã tiếp nhận Thần Lực: ${boon.name}!`, 'text-amber-300 font-bold');
    }
  };

  // Emergency free coins grant (Treasury Core scale)
  const handleClaimGrant = () => {
    setCoins(prev => Number((prev + treasuryGrantAmount).toFixed(1)));
    gachaAudio.playCoinsSound();
    showToast(`Đã nhận trợ cấp ngân khố +${treasuryGrantAmount} Đồng!`);
  };

  // Reset Game Progress anytime back to clean starting state (100 coins, empty inv, tier 0, stage 1, cores 0, boons empty)
  const handleResetGame = () => {
    const initialCoins = 100;
    const initialInventory = {};
    const initialDiscovered: string[] = [];
    const initialTier = 0;
    const initialStage = 1;
    const initialCores = { ...DEFAULT_CORES };
    const initialBoons: string[] = [];

    setCoins(initialCoins);
    setInventory(initialInventory);
    setDiscoveredItemIds(initialDiscovered);
    setShopTierIndex(initialTier);
    setChallengeStage(initialStage);
    setCoreLevels(initialCores);
    setActiveBoonIds(initialBoons);
    setRevealedItems(null);
    setIsResetModalOpen(false);

    if (storage) {
      storage.setItem(`${keyPrefix}coins`, initialCoins.toString());
      storage.setItem(`${keyPrefix}inventory`, JSON.stringify(initialInventory));
      storage.setItem(`${keyPrefix}discovered`, JSON.stringify(initialDiscovered));
      storage.setItem(`${keyPrefix}shop_tier_idx`, initialTier.toString());
      storage.setItem(`${keyPrefix}challenge_stage`, initialStage.toString());
      storage.setItem(`${keyPrefix}core_levels`, JSON.stringify(initialCores));
      storage.setItem(`${keyPrefix}active_boons`, JSON.stringify(initialBoons));
    }

    if (currentUser) {
      saveGameData(currentUser, {
        coins: initialCoins,
        inventory: initialInventory,
        discoveredItemIds: initialDiscovered,
        shopTierIndex: initialTier,
        challengeStage: initialStage,
        coreLevels: initialCores,
        activeBoonIds: initialBoons,
      });
    }

    gachaAudio.playCoinsSound();
    showToast('🔄 Đã khởi động lại toàn bộ tiến trình game từ đầu (Ngân khố 100 Đồng)!', 'text-amber-300 font-bold');
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    gachaAudio.setEnabled(next);
  };

  return (
    <div
      className={`relative w-full text-white font-sans selection:bg-amber-500 selection:text-neutral-950 transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 overflow-y-auto bg-neutral-950 p-4 sm:p-6'
          : 'min-h-[580px] bg-[#07030d] p-3 sm:p-5 rounded-xl'
      }`}
    >
      {/* Background ambient gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#3b1154_0%,#150524_45%,#07020e_100%)] pointer-events-none -z-10" />

      {/* FLOATING TOAST NOTIFICATION */}
      {activeToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-neutral-900/95 border-2 border-amber-500/70 shadow-[0_0_30px_rgba(245,158,11,0.35)] backdrop-blur-md animate-bounce text-xs font-mono flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className={activeToast.color}>{activeToast.message}</span>
        </div>
      )}

      {/* TOP CONTROLS & CURRENCY HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        {/* Left: Branding & Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-black text-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline font-mono uppercase tracking-wider">Vạn Cổ Kỳ Trân</span>
            <span className="sm:hidden font-mono uppercase">Gacha</span>
          </div>

          {/* Nav Tabs */}
          <div className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => setActiveTab('gacha')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'gacha'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Triệu Hồi
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>Túi Đồ</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300 font-mono">
                {totalItemCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('codex')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'codex'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>120 Món</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300 font-mono">
                {discoveredItemIds.length}/120
              </span>
            </button>
          </div>
        </div>

        {/* Right: Gold Coins Balance, Cores, Boons, Account status, Fullscreen, Sound & Help */}
        <div className="flex items-center gap-2">
          {/* Account Status Badge */}
          {currentUser ? (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono" title="Tiến trình được tự động lưu vĩnh viễn theo tài khoản này">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold truncate max-w-[100px]">{currentUser.displayName || currentUser.username}</span>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth?.('login')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono transition-colors cursor-pointer"
              title="Bạn đang ở chế độ Khách (dữ liệu biến mất khi đóng trang web). Nhấp để Đăng ký / Đăng nhập Tester123!"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Khách (Tạm thời)</span>
              <span className="md:hidden">Khách</span>
            </button>
          )}

          {/* Coins Display */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 shadow-inner">
            <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-mono text-amber-400/80 uppercase leading-none">Ngân Khố</span>
              <span className="text-sm font-black font-mono leading-tight">{coins.toLocaleString()} 🪙</span>
            </div>
          </div>

          {/* Pending Boon Notification Button */}
          {pendingBoonChoices.length > 0 && !isBoonSelectionOpen && (
            <button
              onClick={() => setIsBoonSelectionOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 font-black text-xs font-mono shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse hover:scale-105 transition-all cursor-pointer"
              title="Bạn có Thần Lực Đợt mới chưa chọn! Nhấp để mở bảng chọn 1 trong 3"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chọn Thần Lực Đợt {completedStageForBoon}</span>
              <span className="sm:hidden">Thần Lực #{completedStageForBoon}</span>
            </button>
          )}

          {/* Active Boons Badge Button */}
          <button
            onClick={() => setIsActiveBoonsListOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${
              activeBoonIds.length > 0
                ? 'bg-gradient-to-r from-purple-950/80 to-amber-950/80 border-amber-400 text-amber-300 animate-pulse'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title="Xem danh sách Thần Lực Thượng Cổ đã tiếp nhận"
          >
            <span className="text-sm">🌟</span>
            <span className="hidden sm:inline">Thần Lực</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
              {activeBoonIds.length}/80
            </span>
          </button>

          {/* Arcane Cores Quick Button (30 Cores) */}
          <button
            onClick={() => setIsCoresModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-950/60 to-purple-950/60 hover:from-amber-900/60 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
            title="Mở bảng 30 Lõi Ma Pháp Thượng Cổ (Khai mở theo từng Đợt)"
          >
            <span className="text-sm">🔮</span>
            <span className="hidden sm:inline">30 Lõi</span>
          </button>

          {/* Cuộn Bí Chỉ Quick Button */}
          <button
            onClick={() => setIsParchmentModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isOrderReady
                ? 'bg-amber-500 text-neutral-950 border-amber-400 animate-bounce'
                : 'bg-neutral-900 hover:bg-neutral-850 text-amber-300 border-amber-700/40'
            }`}
            title="Mở cuộn giấy đơn hàng thử thách"
          >
            <Scroll className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bí Chỉ Đợt {challengeStage}</span>
          </button>

          {/* Shop Upgrade Quick Button */}
          <button
            onClick={() => setIsShopModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/50 text-purple-200 text-xs font-bold transition-colors cursor-pointer"
            title="Nâng cấp cửa hàng thay đổi tỉ lệ"
          >
            <Store className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Bậc {shopTierIndex + 1}/6</span>
          </button>

          {/* Reset Game Button */}
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 hover:border-rose-400 text-rose-300 text-xs font-bold transition-all cursor-pointer shadow-sm group"
            title="Chơi lại từ đầu (Reset toàn bộ tiến trình bất kỳ lúc nào)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400 group-hover:-rotate-90 transition-transform duration-300" />
            <span className="hidden sm:inline">Chơi Lại</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(prev => !prev)}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Phóng to toàn màn hình'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Help */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Hướng dẫn & Bảng quy đổi giá"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ACTIVE VIEW CONTENT */}
      <div className="pt-4 pb-8">
        {activeTab === 'gacha' && (
          <SummoningAltar
            coins={coins}
            currentTier={currentTier}
            currentStage={challengeStage}
            currentOrder={currentOrder}
            isOrderReady={isOrderReady}
            onSpin1={() => handlePull(1)}
            onSpin10={() => handlePull(10)}
            onOpenOrderModal={() => setIsParchmentModalOpen(true)}
            onOpenShopModal={() => setIsShopModalOpen(true)}
            onOpenCoresModal={() => setIsCoresModalOpen(true)}
            onClaimDailyCoins={handleClaimGrant}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
            coreLevels={coreLevels}
            commonItemsCount={commonStats.count}
            rareItemsCount={rareStats.count}
            commonSellVal={commonStats.val}
            rareSellVal={rareStats.val}
            onQuickSellCommon={handleQuickSellCommon}
            onQuickSellRare={handleQuickSellRare}
            spin10Cost={spin10Cost}
            grantAmount={treasuryGrantAmount}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            inventory={inventory}
            coins={coins}
            alchemyBonusMultiplier={alchemyBonusMultiplier}
            onSellItem={(id, count, price) => handleSellItem(id, count)}
            onBulkSell={handleBulkSell}
            onBulkSellDuplicates={handleBulkSellDuplicates}
          />
        )}

        {activeTab === 'codex' && (
          <CodexView
            inventory={inventory}
            discoveredIds={discoveredSet}
          />
        )}
      </div>

      {/* MODALS */}
      {/* 1. 3D Card Reveal Modal with Skip & Rarity Fanfare */}
      {revealedItems && (
        <CardRevealModal
          items={revealedItems}
          coins={coins}
          alchemyBonusMultiplier={alchemyBonusMultiplier}
          onClose={() => setRevealedItems(null)}
          onSpinAgain1={() => {
            setRevealedItems(null);
            setTimeout(() => handlePull(1), 50);
          }}
          onSpinAgain10={() => {
            setRevealedItems(null);
            setTimeout(() => handlePull(10), 50);
          }}
          onSellSelected={rarities => handleSellSelectedRarities(rarities)}
        />
      )}

      {/* 2. Shop Upgrade Modal (6 Tiers) */}
      {isShopModalOpen && (
        <ShopUpgradeModal
          currentTierIndex={shopTierIndex}
          coins={coins}
          shopDiscountPercent={shopDiscountPercent}
          onUpgradeTier={handleUpgradeTier}
          onClose={() => setIsShopModalOpen(false)}
        />
      )}

      {/* 3. Parchment Order Modal (10 Stages with unroll animation) */}
      {isParchmentModalOpen && (
        <ParchmentOrderModal
          currentStage={challengeStage}
          inventory={inventory}
          orderBonusMultiplier={orderBonusMultiplier}
          onCompleteStage={handleCompleteStage}
          onClose={() => setIsParchmentModalOpen(false)}
          onGoToGacha={() => {
            setIsParchmentModalOpen(false);
            setActiveTab('gacha');
          }}
        />
      )}

      {/* 4. Arcane Cores Modal (30 Elemental Progression Cores, unlocked per Stage) */}
      <ArcaneCoresModal
        isOpen={isCoresModalOpen}
        onClose={() => setIsCoresModalOpen(false)}
        coins={coins}
        currentStage={challengeStage}
        coreLevels={coreLevels}
        onUpgradeCore={handleUpgradeCore}
      />

      {/* 5. Roguelike Boon Selection Modal (Choose 1 of 3 Random from 80 Boons on Order Complete!) */}
      <BoonSelectionModal
        isOpen={isBoonSelectionOpen}
        boons={pendingBoonChoices}
        stageNumber={completedStageForBoon}
        onSelectBoon={handleSelectBoon}
        onClose={() => setIsBoonSelectionOpen(false)}
      />

      {/* 6. Active Boons List Modal */}
      <ActiveBoonsModal
        isOpen={isActiveBoonsListOpen}
        onClose={() => setIsActiveBoonsListOpen(false)}
        activeBoonIds={activeBoonIds}
      />

      {/* 7. Help & Price Exchange Rules Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl">
            <button
              onClick={() => setIsHelpOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-amber-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Quy Tắc Vạn Cổ Kỳ Trân, 9 Lõi & 80 Thần Lực</span>
            </h3>

            <div className="space-y-3.5 mt-4 text-xs text-neutral-300 leading-relaxed font-sans max-h-[70vh] overflow-y-auto pr-1">
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                <p className="font-bold text-amber-400">1. Ngân Khố Ban Đầu & Chi Phí:</p>
                <p>• Người mới vào nhận ngay <strong className="text-amber-300">100 Đồng</strong> vào ngân khố!</p>
                <p>• Quay 1 lần: <strong>2 Đồng</strong> | Quay 10 lần: <strong>{spin10Cost} Đồng</strong>.</p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                <p className="font-bold text-amber-400">2. Định Giá Bán Lại Vật Phẩm:</p>
                <p>• <strong className="text-slate-300">Common:</strong> 1 Đồng</p>
                <p>• <strong className="text-cyan-300">Rare:</strong> 4 Đồng (Lãi gấp đôi chi phí quay đơn!)</p>
                <p>• <strong className="text-purple-300">Epic:</strong> 20 Đồng | <strong className="text-amber-300">Legend:</strong> 200 Đồng | <strong className="text-rose-400">Mystic:</strong> 1,000 Đồng</p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                <p className="font-bold text-amber-400">3. Thần Lực Cổ Đại (80 Sức Mạnh Roguelike):</p>
                <p>• Mỗi khi trả thành công 1 đợt Đơn Hàng Bí Chỉ, bạn được <strong className="text-yellow-300">chọn 1 trong 3 Thần Lực ngẫu nhiên</strong> từ kho 80 sức mạnh!</p>
                <p>• Mang lại sức mạnh bất ngờ: nhận ngay 20% - 35% ngân khố, gia cường cửa hàng, tăng tỉ lệ rơi nguyên tố (Kim, Mộc, Thủy, Hỏa, Thổ...), thăng cấp lõi miễn phí, chuyển hóa đồ Common thành Rare...</p>
              </div>
            </div>

            <button
              onClick={() => setIsHelpOpen(false)}
              className="w-full mt-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Đã Hiểu & Chinh Phục Ngay
            </button>
          </div>
        </div>
      )}

      {/* 8. Reset Game Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-neutral-900 border-2 border-rose-500/60 p-6 shadow-[0_0_50px_rgba(244,63,94,0.25)]">
            <button
              onClick={() => setIsResetModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-white font-mono uppercase tracking-wide">
                  Chơi Lại Từ Đầu?
                </h3>
                <p className="text-xs text-rose-300 font-medium">
                  Đặt lại toàn bộ tiến trình Vạn Cổ Kỳ Trân
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs text-neutral-300">
              <p className="font-semibold text-neutral-200">
                Hành động này sẽ thiết lập lại trò chơi về trạng thái ban đầu:
              </p>
              <ul className="space-y-1.5 text-[11px] text-neutral-400 font-mono">
                <li className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Ngân khố khởi điểm: <strong className="text-amber-300">100 Đồng</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Túi đồ & Bách Khoa: <strong className="text-rose-300">Làm mới hoàn toàn</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Bậc Cửa Hàng: <strong className="text-purple-300">Bậc 1</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Đơn Hàng Thử Thách: <strong className="text-cyan-300">Đợt 1</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>9 Lõi Ma Pháp: <strong className="text-indigo-300">Về Cấp 0</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>80 Thần Lực Thượng Cổ: <strong className="text-yellow-300">Giải trừ tất cả</strong></span>
                </li>
              </ul>
            </div>

            <p className="mt-3 text-[11px] text-neutral-400 italic text-center">
              Dữ liệu lưu trữ {currentUser ? `của tài khoản ${currentUser.displayName || currentUser.username}` : 'trong phiên'} sẽ được làm mới ngay tức thì.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 font-bold text-xs transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleResetGame}
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-900/40 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Xác Nhận Đặt Lại</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
