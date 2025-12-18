import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { Player, Rooster, Item, Stats, CombatSession, RoosterRank, Loan } from '../types';
import { apiService } from '../services/apiService';
import { storageService } from '../services/storageService';
import { feedbackService } from '../services/feedbackService';
import { ContentGenerator } from '../services/ContentGenerator';
import { ECONOMY_CONFIG } from '../constants';

// State definition
interface GameState {
  player: Player | null;
  activeCombat: CombatSession | null;
  isLoading: boolean;
  error: string | null;
}

// Action Types
type Action =
  | { type: 'SET_PLAYER'; payload: Player }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'UPDATE_ROOSTER'; payload: Rooster }
  | { type: 'ADD_ROOSTER'; payload: Rooster }
  | { type: 'REMOVE_ROOSTER'; payload: string }
  | { type: 'SET_ACTIVE_ROOSTER'; payload: string } // id
  | { type: 'ADD_GOLD'; payload: number }
  | { type: 'SPEND_GOLD'; payload: number }
  | { type: 'ADD_CRYSTALS'; payload: number }
  | { type: 'SPEND_CRYSTALS'; payload: number }
  | { type: 'ACTIVATE_SHIELD'; payload: number } // duration in ms
  | { type: 'ADD_ITEM'; payload: Item }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string; amount: number } }
  | { type: 'START_COMBAT'; payload: CombatSession }
  | { type: 'END_COMBAT'; }
  | { type: 'UPDATE_COMBAT_RESULT'; payload: any }
  | { type: 'ADD_LOAN'; payload: Loan }
  | { type: 'PAY_LOAN'; payload: string }
  | { type: 'SET_TASKS'; payload: any[] }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Player['settings']> };

// Reducer
const gameReducer = (state: GameState, action: Action): GameState => {
  if (!state.player && action.type !== 'SET_PLAYER' && action.type !== 'SET_LOADING') return state;

  switch (action.type) {
    case 'SET_PLAYER':
      return { ...state, player: action.payload, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'UPDATE_ROOSTER':
      if (!state.player) return state;
      const updatedRoosters = state.player.roosters.map(r => 
        r.id === action.payload.id ? action.payload : r
      );
      return { ...state, player: { ...state.player, roosters: updatedRoosters } };
    case 'ADD_ROOSTER':
        if (!state.player) return state;
        return { ...state, player: { ...state.player, roosters: [...state.player.roosters, action.payload] } };
    case 'REMOVE_ROOSTER':
        if (!state.player) return state;
        return { ...state, player: { ...state.player, roosters: state.player.roosters.filter(r => r.id !== action.payload) } };
    case 'SET_ACTIVE_ROOSTER':
        if (!state.player) return state;
        const roosterIndex = state.player.roosters.findIndex(r => r.id === action.payload);
        if (roosterIndex <= 0) return state; // Already first or not found
        
        const newRoosters = [...state.player.roosters];
        const [movedRooster] = newRoosters.splice(roosterIndex, 1);
        newRoosters.unshift(movedRooster); // Move to front
        return { ...state, player: { ...state.player, roosters: newRoosters } };

    case 'ADD_GOLD':
      return state.player ? { ...state, player: { ...state.player, gold: state.player.gold + action.payload } } : state;
    case 'SPEND_GOLD':
      return state.player ? { ...state, player: { ...state.player, gold: state.player.gold - action.payload } } : state;
    case 'ADD_CRYSTALS':
      return state.player ? { ...state, player: { ...state.player, crystals: state.player.crystals + action.payload } } : state;
    case 'SPEND_CRYSTALS':
      return state.player ? { ...state, player: { ...state.player, crystals: state.player.crystals - action.payload } } : state;
    case 'ACTIVATE_SHIELD':
      return state.player ? { 
        ...state, 
        player: { 
          ...state.player, 
          shieldExpiresAt: Date.now() + action.payload 
        } 
      } : state;
    case 'ADD_ITEM':
      if (!state.player) return state;
      const existingItemIndex = state.player.inventory.findIndex(i => i.id === action.payload.id);
      let newInventory = [...state.player.inventory];
      if (existingItemIndex >= 0) {
        newInventory[existingItemIndex].quantity += 1;
      } else {
        newInventory.push({ ...action.payload, quantity: 1 });
      }
      return { ...state, player: { ...state.player, inventory: newInventory } };
    case 'REMOVE_ITEM':
        if (!state.player) return state;
        const targetIndex = state.player.inventory.findIndex(i => i.id === action.payload.itemId);
        if (targetIndex >= 0) {
            let updatedInv = [...state.player.inventory];
            updatedInv[targetIndex].quantity -= action.payload.amount;
            if (updatedInv[targetIndex].quantity <= 0) {
                updatedInv.splice(targetIndex, 1);
            }
            return { ...state, player: { ...state.player, inventory: updatedInv } };
        }
        return state;
    case 'START_COMBAT':
        return { ...state, activeCombat: action.payload };
    case 'UPDATE_COMBAT_RESULT':
        return state.activeCombat ? { ...state, activeCombat: { ...state.activeCombat, result: action.payload } } : state;
    case 'END_COMBAT':
        return { ...state, activeCombat: null };
    case 'ADD_LOAN':
        return state.player ? { ...state, player: { ...state.player, loans: [...state.player.loans, action.payload] } } : state;
    case 'PAY_LOAN':
        if (!state.player) return state;
        const loans = state.player.loans.map(l => l.id === action.payload ? { ...l, isPaid: true } : l);
        return { ...state, player: { ...state.player, loans } };
    case 'SET_TASKS':
        return state.player ? { ...state, player: { ...state.player, tasks: action.payload } } : state;
    case 'UPDATE_SETTINGS':
        return state.player ? { ...state, player: { ...state.player, settings: { ...state.player.settings, ...action.payload } } } : state;
    default:
      return state;
  }
};

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  refreshPlayer: () => Promise<void>;
  watchAd: () => Promise<void>;
  feedRooster: (roosterId: string, itemId: string) => Promise<{success: boolean, message: string}>;
  trainRooster: (roosterId: string, type: 'strength' | 'speed' | 'endurance') => Promise<{success: boolean, message: string}>;
  breedRoosters: (sireId: string, damId: string) => Promise<{success: boolean, message: string}>;
  scavengeArea: (lat: number, lng: number) => Promise<{success: boolean, message: string, reward?: any}>;
  scanEnvironment: () => Promise<{success: boolean, message: string, reward?: { crystals: number, gold: number } }>;
  enterCombat: (districtId: string) => Promise<{success: boolean, message: string}>;
  resolveCombat: (winnerId: string, rewards: { gold: number, xp: number }) => void;
  closeCombat: () => void;
  hatchEgg: (itemId: string, rarity: RoosterRank) => Promise<{success: boolean, message: string, rooster?: Rooster}>;
  setActiveRooster: (roosterId: string) => void;
  sellRooster: (roosterId: string) => Promise<{success: boolean, message: string}>;
  takeLoan: (amount: number, interest: number, durationHours: number) => Promise<{success: boolean, message: string}>;
  repayLoan: (loanId: string) => Promise<{success: boolean, message: string}>;
  claimTaskReward: (taskId: string) => Promise<{success: boolean, message: string}>;
  toggleSetting: (key: 'soundEnabled' | 'notificationsEnabled') => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, {
    player: null,
    activeCombat: null,
    isLoading: true,
    error: null
  });

  const refreshPlayer = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const player = await apiService.getPlayer('p1');
      
      // Auto-generate tasks if missing
      if (!player.tasks || player.tasks.length === 0) {
          const newTasks = ContentGenerator.generateDailyTasks(player.level);
          player.tasks = newTasks;
      }

      dispatch({ type: 'SET_PLAYER', payload: player });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Oyuncu verisi yüklenemedi.' });
    }
  };

  useEffect(() => {
    refreshPlayer();
  }, []);

  // Persistence Auto-Save & Settings Sync
  useEffect(() => {
    if (state.player) {
      storageService.savePlayer(state.player);
      apiService.updatePlayer(state.player); 
      
      // Sync feedback service
      feedbackService.setSoundEnabled(state.player.settings.soundEnabled);
      feedbackService.setHapticsEnabled(state.player.settings.notificationsEnabled); 
    }
  }, [state.player]);

  const watchAd = async () => {
    if (!state.player) return;
    feedbackService.playClick();
    try {
      const result = await apiService.watchAd(state.player.id);
      if (result.success) {
        const newTotalViews = state.player.stats.totalAdViews + 1;
        if (newTotalViews % ECONOMY_CONFIG.ADS_FOR_SHIELD === 0) {
          dispatch({ type: 'ACTIVATE_SHIELD', payload: ECONOMY_CONFIG.SHIELD_DURATION });
          feedbackService.playSuccess();
        }
      }
    } catch (error) {
      console.error("Ad failed", error);
      feedbackService.playError();
    }
  };

  const feedRooster = async (roosterId: string, itemId: string) => {
    if (!state.player) return { success: false, message: 'Oyuncu hatası' };
    
    const rooster = state.player.roosters.find(r => r.id === roosterId);
    const item = state.player.inventory.find(i => i.id === itemId);
    
    if (!rooster) { feedbackService.playError(); return { success: false, message: 'Horoz bulunamadı' }; }
    if (!item || item.quantity <= 0) { feedbackService.playError(); return { success: false, message: 'Eşya yok' }; }
    if (rooster.hunger >= 100) { feedbackService.playError(); return { success: false, message: 'Horoz zaten tok!' }; }

    const newHunger = Math.min(100, rooster.hunger + (item.effect?.value || 20));
    
    const updatedRooster = { ...rooster, hunger: newHunger };
    
    dispatch({ type: 'UPDATE_ROOSTER', payload: updatedRooster });
    dispatch({ type: 'REMOVE_ITEM', payload: { itemId, amount: 1 } });
    
    feedbackService.playSuccess();
    return { success: true, message: `${item.name} verildi.` };
  };

  const trainRooster = async (roosterId: string, type: 'strength' | 'speed' | 'endurance') => {
    if (!state.player) return { success: false, message: 'Oyuncu hatası' };
    const rooster = state.player.roosters.find(r => r.id === roosterId);
    if (!rooster) return { success: false, message: 'Horoz bulunamadı' };

    const energyCost = 20;
    if (rooster.energy < energyCost) { feedbackService.playError(); return { success: false, message: 'Enerji yetersiz!' }; }

    let statKey: keyof Stats = 'attack';
    let statName = 'Güç';
    if (type === 'speed') { statKey = 'speed'; statName = 'Hız'; }
    if (type === 'endurance') { statKey = 'health'; statName = 'Dayanıklılık'; }

    const statGain = 1;
    const xpGain = 15;

    const newStats = { ...rooster.stats, [statKey]: rooster.stats[statKey] + statGain };
    let newXp = rooster.xp + xpGain;
    let newLevel = rooster.level;
    let leveledUp = false;

    if (newXp >= rooster.maxXp) {
        newLevel++;
        newXp = newXp - rooster.maxXp;
        leveledUp = true;
    }

    const updatedRooster: Rooster = {
        ...rooster,
        energy: rooster.energy - energyCost,
        stats: newStats,
        xp: newXp,
        level: newLevel,
        maxXp: leveledUp ? Math.floor(rooster.maxXp * 1.2) : rooster.maxXp
    };

    dispatch({ type: 'UPDATE_ROOSTER', payload: updatedRooster });
    feedbackService.playSuccess();
    
    const msg = leveledUp 
        ? `TEBRİKLER! Seviye ${newLevel} oldu!` 
        : `Antrenman tamam. ${statName} +${statGain}`;

    return { success: true, message: msg };
  };

  const breedRoosters = async (sireId: string, damId: string) => {
    if (!state.player) return { success: false, message: 'Hata' };
    const costGold = 200;
    const costCrystals = 20;

    if (state.player.gold < costGold || state.player.crystals < costCrystals) {
        feedbackService.playError();
        return { success: false, message: 'Yetersiz kaynak!' };
    }

    const result = await apiService.breedRoosters(sireId, damId);
    if (result.success && result.egg) {
        dispatch({ type: 'SPEND_GOLD', payload: costGold });
        dispatch({ type: 'SPEND_CRYSTALS', payload: costCrystals });
        dispatch({ type: 'ADD_ITEM', payload: result.egg });
        feedbackService.playSuccess();
    } else {
        feedbackService.playError();
    }
    return { success: result.success, message: result.message };
  };

  const scavengeArea = async (lat: number, lng: number) => {
    if (!state.player) return { success: false, message: 'Hata' };
    
    const result = await apiService.scavenge({lat, lng});
    
    if (result.success && result.reward) {
        dispatch({ type: 'ADD_GOLD', payload: result.reward.gold });
        if (result.reward.item) {
            dispatch({ type: 'ADD_ITEM', payload: result.reward.item });
        }
        feedbackService.playSuccess();
    } else {
        feedbackService.playError();
    }
    return result;
  };

  const scanEnvironment = async () => {
    if (!state.player) return { success: false, message: 'Hata' };

    const result = await apiService.scanEnvironment();

    if (result.success && result.reward) {
        dispatch({ type: 'ADD_GOLD', payload: result.reward.gold });
        dispatch({ type: 'ADD_CRYSTALS', payload: result.reward.crystals });
        feedbackService.playSuccess();
    } else {
        feedbackService.playError();
    }
    return result;
  };

  const enterCombat = async (districtId: string) => {
    if (!state.player || !state.player.roosters[0]) return { success: false, message: 'Horozun yok!' };
    
    const playerRooster = state.player.roosters[0];
    if (playerRooster.energy < 10) { feedbackService.playError(); return { success: false, message: 'Enerji çok düşük!' }; }
    
    try {
        const enemyRooster = await apiService.getEnemyForDistrict(districtId);
        
        // Removed simulation logic here. 
        // We now just initialize the session. The CombatScreen handles the real-time fight.
        
        const session: CombatSession = {
            id: `combat_${Date.now()}`,
            playerRooster,
            enemyRooster,
            isActive: true,
            result: null
        };
        
        feedbackService.playBattleStart();
        dispatch({ type: 'START_COMBAT', payload: session });

        return { success: true, message: 'Dövüş başladı!' };

    } catch (e) {
        console.error(e);
        feedbackService.playError();
        return { success: false, message: 'Dövüş başlatılamadı.' };
    }
  };

  const resolveCombat = (winnerId: string, rewards: { gold: number, xp: number }) => {
    if (!state.player || !state.activeCombat) return;

    const playerRooster = state.activeCombat.playerRooster;
    const isPlayerWinner = winnerId === playerRooster.id;

    if (isPlayerWinner) {
        dispatch({ type: 'ADD_GOLD', payload: rewards.gold });
        let newXp = playerRooster.xp + rewards.xp;
        let newLevel = playerRooster.level;
        if (newXp >= playerRooster.maxXp) {
            newLevel++;
            newXp = newXp - playerRooster.maxXp;
        }
        const updatedRooster = { ...playerRooster, xp: newXp, level: newLevel, energy: Math.max(0, playerRooster.energy - 10) };
        dispatch({ type: 'UPDATE_ROOSTER', payload: updatedRooster });
    } else {
         const updatedRooster = { ...playerRooster, energy: Math.max(0, playerRooster.energy - 15) }; // More energy loss on loss
         dispatch({ type: 'UPDATE_ROOSTER', payload: updatedRooster });
    }
  };

  const closeCombat = () => {
    dispatch({ type: 'END_COMBAT' });
  };

  const hatchEgg = async (itemId: string, rarity: RoosterRank) => {
    if (!state.player) return { success: false, message: 'Oyuncu hatası' };
    
    try {
        dispatch({ type: 'REMOVE_ITEM', payload: { itemId, amount: 1 } });
        const newRooster = await apiService.hatchEgg(rarity);
        dispatch({ type: 'ADD_ROOSTER', payload: newRooster });
        feedbackService.playSuccess();
        return { success: true, message: `${newRooster.name} yumurtadan çıktı!`, rooster: newRooster };
    } catch (e) {
        feedbackService.playError();
        return { success: false, message: 'Yumurta çatlatılamadı.' };
    }
  };

  const setActiveRooster = (roosterId: string) => {
    dispatch({ type: 'SET_ACTIVE_ROOSTER', payload: roosterId });
    feedbackService.playClick();
  };

  const sellRooster = async (roosterId: string) => {
      if (!state.player) return { success: false, message: 'Hata' };
      if (state.player.roosters.length <= 1) return { success: false, message: 'Son horozunu satamazsın!' };

      const rooster = state.player.roosters.find(r => r.id === roosterId);
      if (!rooster) return { success: false, message: 'Horoz bulunamadı' };

      // Calculate price based on level and rank multiplier
      const rankMultiplier = { COMMON: 1, RARE: 2, EPIC: 4, LEGENDARY: 10, MYTHIC: 50 };
      const price = rooster.level * 100 * rankMultiplier[rooster.rank];

      dispatch({ type: 'REMOVE_ROOSTER', payload: roosterId });
      dispatch({ type: 'ADD_GOLD', payload: price });
      feedbackService.playCash();
      
      return { success: true, message: `${rooster.name} satıldı. +${price}G` };
  };

  const takeLoan = async (amount: number, interest: number, durationHours: number) => {
    if (!state.player) return { success: false, message: 'Oyuncu hatası' };
    
    const result = await apiService.takeLoan(amount, interest, durationHours);
    if (result.success && result.loan) {
        dispatch({ type: 'ADD_LOAN', payload: result.loan });
        dispatch({ type: 'ADD_GOLD', payload: amount });
        feedbackService.playCash();
    } else {
        feedbackService.playError();
    }
    return { success: result.success, message: result.message };
  };

  const repayLoan = async (loanId: string) => {
    if (!state.player) return { success: false, message: 'Oyuncu hatası' };
    const loan = state.player.loans.find(l => l.id === loanId);
    if (!loan) return { success: false, message: 'Borç bulunamadı' };
    
    const totalAmount = Math.floor(loan.amount * (1 + loan.interestRate / 100));
    if (state.player.gold < totalAmount) { feedbackService.playError(); return { success: false, message: 'Yetersiz altın!' }; }

    dispatch({ type: 'SPEND_GOLD', payload: totalAmount });
    dispatch({ type: 'PAY_LOAN', payload: loanId });
    feedbackService.playCash();
    return { success: true, message: 'Borç ödendi!' };
  };

  const claimTaskReward = async (taskId: string) => {
      if (!state.player) return { success: false, message: 'Hata' };
      const task = state.player.tasks.find(t => t.id === taskId);
      if (!task || task.claimed) return { success: false, message: 'Geçersiz işlem' };

      dispatch({ type: 'ADD_GOLD', payload: task.reward.gold });
      dispatch({ type: 'ADD_CRYSTALS', payload: task.reward.crystals });
      
      const updatedTasks = state.player.tasks.map(t => 
        t.id === taskId ? { ...t, completed: true, claimed: true } : t
      );
      dispatch({ type: 'SET_TASKS', payload: updatedTasks });
      
      feedbackService.playSuccess();
      return { success: true, message: 'Ödül alındı!' };
  };

  const toggleSetting = (key: 'soundEnabled' | 'notificationsEnabled') => {
      if (!state.player) return;
      const newValue = !state.player.settings[key];
      dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: newValue } });
      feedbackService.playClick();
  };

  const resetGame = () => {
      storageService.clearSave();
      window.location.reload();
  };

  return (
    <GameContext.Provider value={{ 
        state, 
        dispatch, 
        refreshPlayer, 
        watchAd, 
        feedRooster, 
        trainRooster, 
        breedRoosters,
        scavengeArea,
        scanEnvironment,
        enterCombat, 
        resolveCombat,
        closeCombat, 
        hatchEgg,
        setActiveRooster,
        sellRooster,
        takeLoan,
        repayLoan,
        claimTaskReward,
        toggleSetting,
        resetGame
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};