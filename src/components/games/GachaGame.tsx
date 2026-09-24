import React, { useState, useEffect, useMemo } from 'react';
import { GachaItem, Rarity, CoreType } from '../../types/gacha';
import { GACHA_ITEMS, RARITY_CONFIG } from '../../data/gachaItems';
import { SHOP_TIERS } from '../../data/shopTiers';
import { CHALLENGE_ORDERS } from '../../data/ordersData';
import { ARCANE_CORES, CORE_TYPES, getCoreBonusMultiplier } from '../../data/coresData';
import { rollSingleGacha, rollTenGacha } from '../../utils/gachaEngine';
import { gachaAudio } from '../../utils/gachaAudio';
import { saveGameData } from '../../utils/security';
import { SummoningAltar } from '../SummoningAltar';
import { CardRevealModal } from '../CardRevealModal';
import { ShopUpgradeModal } from '../ShopUpgradeModal';
import { ParchmentOrderModal } from '../ParchmentOrderModal';
import { ArcaneCoresModal } from '../ArcaneCoresModal';
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
} from 'lucide-react';
import { UserAccount } from '../../types/auth';

interface GachaGameProps {
  onGainSessionExp?: () => void;
  currentUser?: UserAccount | null;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

const DEFAULT_CORES: Record<CoreType, number> = {
  alchemy: 0,
  destiny: 0,
  fortune: 0,
  harvester: 0,
  order: 0,
  channelling: 0,
  miracle: 0,
  enlighten: 0,
  treasury: 0,
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
      });
    }
  }, [coins, inventory, discoveredItemIds, shopTierIndex, challengeStage, coreLevels, storage, keyPrefix, currentUser]);

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

  // Multipliers from 9 Arcane Cores
  const alchemyBonusMultiplier = getCoreBonusMultiplier('alchemy', coreLevels.alchemy || 0);
  const orderBonusMultiplier = getCoreBonusMultiplier('order', coreLevels.order || 0);
  const fortuneChance = getCoreBonusMultiplier('fortune', coreLevels.fortune || 0);
  const harvesterChance = getCoreBonusMultiplier('harvester', coreLevels.harvester || 0);

  // Channelling Core calculations (discounts on 10-pull and Shop Tier)
  const channellingDiscount = getCoreBonusMultiplier('channelling', coreLevels.channelling || 0);
  const spin10Cost = Math.max(12, 20 - channellingDiscount);
  const shopDiscountPercent = [0, 0.1, 0.2, 0.3, 0.4, 0.5][Math.min(5, coreLevels.channelling || 0)];

  // Treasury Core calculations
  const treasuryGrantAmount = getCoreBonusMultiplier('treasury', coreLevels.treasury || 0) || 20;
  const treasuryInterestPer10 = [0, 0, 2, 5, 10, 20][Math.min(5, coreLevels.treasury || 0)];

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
    const val = Math.round(count * RARITY_CONFIG.common.sellPrice * (1 + alchemyBonusMultiplier) * 10) / 10;
    return { count, val };
  }, [inventory, alchemyBonusMultiplier]);

  const rareStats = useMemo(() => {
    let count = 0;
    GACHA_ITEMS.filter(it => it.rarity === 'rare').forEach(it => {
      count += inventory[it.id] || 0;
    });
    const val = Math.round(count * RARITY_CONFIG.rare.sellPrice * (1 + alchemyBonusMultiplier) * 10) / 10;
    return { count, val };
  }, [inventory, alchemyBonusMultiplier]);

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

    // Passive interest yield from Treasury Core on x10 pulls
    const treasuryYield = count === 10 ? treasuryInterestPer10 : 0;

    // Roll items (pure rates boosted by Destiny core, NO PITY)
    let pulled: GachaItem[] = [];
    if (count === 1) {
      pulled = [rollSingleGacha(currentTier, false, coreLevels.destiny || 0)];
    } else {
      pulled = rollTenGacha(currentTier, coreLevels.destiny || 0);
    }

    // Harvester Core: chance to multiply item quantities (x2, x3)
    let harvesterTriggerCount = 0;
    let miracleBonusCoins = 0;
    let enlightenBonusCoins = 0;

    const newDiscovered = new Set(discoveredItemIds);
    const updatedInventory = { ...inventory };

    pulled.forEach(item => {
      let addCount = 1;
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

      // Miracle Core: bonus gold on high-tier hits
      if (miracleBaseBonus > 0) {
        if (item.rarity === 'epic') miracleBonusCoins += miracleBaseBonus;
        else if (item.rarity === 'legend') miracleBonusCoins += miracleBaseBonus * 3.5;
        else if (item.rarity === 'mystic') miracleBonusCoins += miracleBaseBonus * 10;
      }

      // Enlighten Core: bonus gold for duplicates
      if (enlightenBonusPerDup > 0 && (updatedInventory[item.id] || 0) > 0) {
        enlightenBonusCoins += enlightenBonusPerDup * addCount;
      }

      updatedInventory[item.id] = (updatedInventory[item.id] || 0) + addCount;
      newDiscovered.add(item.id);
    });

    // Total net coins change
    const totalExtraEarnings = refundedCoins + treasuryYield + miracleBonusCoins + enlightenBonusCoins;
    const netCoinsDelta = totalExtraEarnings - cost;

    setCoins(prev => Math.max(0, Number((prev + netCoinsDelta).toFixed(1))));

    // Feedback toasts
    if (isJackpotRefund) {
      gachaAudio.playCoinsSound();
      showToast(`🪙 NỔ HŨ THẦN TÀI! Thưởng x3: Nhận lại +${refundedCoins} Đồng!`, 'text-yellow-300 font-black');
    } else if (refundedCoins > 0) {
      gachaAudio.playCoinsSound();
      showToast(`🪙 THẦN TÀI HOÀN TIỀN! Miễn phí lượt quay: Nhận lại +${refundedCoins} Đồng!`, 'text-amber-300 font-bold');
    } else if (miracleBonusCoins > 0) {
      gachaAudio.playCoinsSound();
      showToast(`✨ KỲ TÍCH HOÀNG KIM: Thưởng nóng +${Math.round(miracleBonusCoins)} Đồng từ báu vật hiếm!`, 'text-purple-300 font-bold');
    } else if (harvesterTriggerCount > 0) {
      showToast(`🌾 LÕI BỘI THU: ${harvesterTriggerCount} món được nhân thêm số lượng!`, 'text-emerald-300 font-bold');
    } else if (enlightenBonusCoins > 0) {
      showToast(`🔮 GIÁC NGỘ TINH HOA: Nhận thêm +${Math.round(enlightenBonusCoins * 10) / 10} Đồng từ đồ trùng!`, 'text-indigo-300 font-bold');
    }

    setInventory(updatedInventory);
    setDiscoveredItemIds(Array.from(newDiscovered));
    setRevealedItems(pulled);
    onGainSessionExp?.();
  };

  // SELL LOGIC (item price * alchemyMultiplier)
  const handleSellItem = (itemId: string, count: number, pricePerUnit: number) => {
    const available = inventory[itemId] || 0;
    if (available < count) return;

    const earned = Number((pricePerUnit * count).toFixed(1));
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
    const priceMult = 1 + alchemyBonusMultiplier;

    GACHA_ITEMS.filter(it => it.rarity === rarity).forEach(item => {
      const count = nextInventory[item.id] || 0;
      if (count > 0) {
        const sellAmount = preserveOne ? count - 1 : count;
        if (sellAmount > 0) {
          earned += sellAmount * (item.sellPrice * priceMult);
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
    const priceMult = 1 + alchemyBonusMultiplier;

    GACHA_ITEMS.forEach(item => {
      const count = nextInventory[item.id] || 0;
      if (count > 1) {
        const sellAmount = count - 1;
        earned += sellAmount * (item.sellPrice * priceMult);
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
    const priceMult = 1 + alchemyBonusMultiplier;

    GACHA_ITEMS.filter(it => it.rarity === 'common').forEach(item => {
      const count = nextInventory[item.id] || 0;
      if (count > 0) {
        earned += count * (item.sellPrice * priceMult);
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
    const priceMult = 1 + alchemyBonusMultiplier;

    GACHA_ITEMS.filter(it => it.rarity === 'rare').forEach(item => {
      const count = nextInventory[item.id] || 0;
      if (count > 0) {
        earned += count * (item.sellPrice * priceMult);
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
    const priceMult = 1 + alchemyBonusMultiplier;

    GACHA_ITEMS.filter(it => targetRarities.includes(it.rarity)).forEach(item => {
      const count = nextInventory[item.id] || 0;
      if (count > 0) {
        earned += count * (item.sellPrice * priceMult);
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

  // CHALLENGE STAGE COMPLETION
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

    setInventory(nextInventory);
    setCoins(prev => Number((prev + rewardCoins).toFixed(1)));

    // Advance challenge stage (up to 10)
    if (stage >= challengeStage && challengeStage < 10) {
      setChallengeStage(prev => prev + 1);
    }
    showToast(`🎉 Hoàn thành đơn hàng Đợt ${stage}! Nhận +${rewardCoins} Đồng!`);
  };

  // Emergency free coins grant (Treasury Core scale)
  const handleClaimGrant = () => {
    setCoins(prev => Number((prev + treasuryGrantAmount).toFixed(1)));
    gachaAudio.playCoinsSound();
    showToast(`Đã nhận trợ cấp ngân khố +${treasuryGrantAmount} Đồng!`);
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

        {/* Right: Gold Coins Balance, Cores, Account status, Fullscreen, Sound & Help */}
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

          {/* Arcane Cores Quick Button */}
          <button
            onClick={() => setIsCoresModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-950/60 to-purple-950/60 hover:from-amber-900/60 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
            title="Mở bảng 9 Lõi Ma Pháp Thượng Cổ"
          >
            <span className="text-sm">🔮</span>
            <span className="hidden sm:inline">9 Lõi Ma Pháp</span>
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
            onSellItem={handleSellItem}
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

      {/* 4. Arcane Cores Modal (9 Elemental Progression Cores) */}
      <ArcaneCoresModal
        isOpen={isCoresModalOpen}
        onClose={() => setIsCoresModalOpen(false)}
        coins={coins}
        coreLevels={coreLevels}
        onUpgradeCore={handleUpgradeCore}
      />

      {/* 5. Help & Price Exchange Rules Modal */}
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
              <span>Quy Tắc Vạn Cổ Kỳ Trân & 9 Lõi Ma Pháp</span>
            </h3>

            <div className="space-y-3.5 mt-4 text-xs text-neutral-300 leading-relaxed font-sans max-h-[70vh] overflow-y-auto pr-1">
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                <p className="font-bold text-amber-400">1. Ngân Khố Ban Đầu & Chi Phí:</p>
                <p>• Người mới vào nhận ngay <strong className="text-amber-300">100 Đồng</strong> vào ngân khố!</p>
                <p>• Quay 1 lần: <strong>2 Đồng</strong> | Quay 10 lần: <strong>{spin10Cost} Đồng</strong> (giảm giá khi có Lõi Pháp Điển).</p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                <p className="font-bold text-amber-400">2. Định Giá Bán Lại Vật Phẩm:</p>
                <p>• <strong className="text-slate-300">Common:</strong> 1 Đồng</p>
                <p>• <strong className="text-cyan-300">Rare:</strong> 4 Đồng (Lãi gấp đôi chi phí quay đơn!)</p>
                <p>• <strong className="text-purple-300">Epic:</strong> 20 Đồng (Lãi gấp 10 lần!)</p>
                <p>• <strong className="text-amber-300">Legend:</strong> 200 Đồng (Lãi gấp 100 lần!)</p>
                <p>• <strong className="text-rose-400">Mystic:</strong> 1,000 Đồng (Đại bảo vật siêu hiếm!)</p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                <p className="font-bold text-amber-400">3. Hệ Thống 9 Lõi Ma Pháp Thượng Cổ:</p>
                <p>• <strong>Lõi Giả Kim:</strong> Tăng giá bán lại lên đến +120% (Common lên 2.2đ, Rare 8.8đ, Mystic 2,200đ)!</p>
                <p>• <strong>Lõi Vận Mệnh:</strong> Tăng GẤP 4.5 LẦN tỉ lệ rớt Thần Thoại Mystic & nhân đôi Legend (thuần may mắn, không bảo hiểm)!</p>
                <p>• <strong>Lõi Thần Tài:</strong> Tỉ lệ hoàn tiền 100% hoặc kích hoạt NỔ HŨ THẦN TÀI gấp 3 lần (3x)!</p>
                <p>• <strong>Lõi Bội Thu:</strong> Xác suất nhân đôi x2 hoặc nhân ba x3 số lượng báu vật rơi ra!</p>
                <p>• <strong>Lõi Khế Ước:</strong> Tăng tới +160% tiền thưởng từ 10 đợt đơn hàng Bí Chỉ!</p>
                <p>• <strong>Lõi Pháp Điển:</strong> Giảm chi phí quay 10 lần xuống 15đ và giảm tới 50% tiền nâng bậc Cửa Hàng!</p>
                <p>• <strong>Lõi Kỳ Tích:</strong> Bốc trúng Epic/Legend/Mystic được thưởng nóng kim ngân bùng nổ!</p>
                <p>• <strong>Lõi Giác Ngộ:</strong> Chuyển hóa đồ trùng lặp thành tiền tươi thóc thật tức thì!</p>
                <p>• <strong>Lõi Ngân Khố:</strong> Tăng mức nhận Trợ Cấp lên đến 380đ và sinh lãi thụ động sau mỗi lần quay 10 thẻ!</p>
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
    </div>
  );
};
