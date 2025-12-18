import { GlobalEconomy, Player, Rooster, Item, RoosterRank, BreedType, ElementType, Stats, CombatResult, CombatRound, Loan, ItemType } from '../types';
import { ECONOMY_CONFIG, ITEMS, COMMENTARY, DISTRICTS } from '../constants';
import { ContentGenerator } from './ContentGenerator';
import { storageService } from './storageService';

// Mock Data Storage
let mockGlobalEconomy: GlobalEconomy = {
  dailyCrystalPool: ECONOMY_CONFIG.DAILY_CRYSTAL_POOL,
  claimedCrystals: 1250,
  activePlayers: 342,
  totalAdViewsToday: 856,
  stabilityIndex: 85,
  lastDrainTime: Date.now() - 3600000,
  nextDrainTime: Date.now() + (ECONOMY_CONFIG.DRAIN_INTERVAL - 3600000),
  marketTaxRate: 0.05,
  status: 'STABLE'
};

const createMockRooster = (id: string, name: string): Rooster => ({
  id,
  name,
  breed: BreedType.DENIZLI,
  rank: RoosterRank.COMMON,
  element: ElementType.WIND,
  level: 1,
  xp: 0,
  maxXp: 100,
  stats: { health: 100, attack: 15, defense: 5, speed: 12, criticalChance: 10 },
  energy: 100,
  hunger: 100,
  hygiene: 100,
  mood: 100,
  traits: ['Loud Crow'],
  visualSeed: Math.random().toString(36).substring(7),
  matchesWon: 0,
  matchesLost: 0,
  createdAt: Date.now()
});

// Initialize Player from Storage or Default
let mockPlayer: Player;
const savedPlayer = storageService.loadPlayer();

if (savedPlayer) {
  mockPlayer = savedPlayer;
} else {
  mockPlayer = {
    id: 'p1',
    username: 'NewPlayer',
    title: 'Çaylak',
    level: 1,
    xp: 0,
    gold: 500,
    crystals: 10,
    prestige: 0,
    roosters: [createMockRooster('r1', 'Garip')],
    inventory: [
      { ...ITEMS[0], quantity: 5 }, // 5 Buğday
      { ...ITEMS[2], quantity: 2 }  // 2 İksir
    ],
    tasks: [],
    loans: [],
    stats: {
      totalBattles: 0,
      wins: 0,
      losses: 0,
      totalAdViews: 0,
      lastLogin: Date.now()
    },
    settings: {
      soundEnabled: true,
      notificationsEnabled: true
    },
    shieldExpiresAt: 0
  };
}

// Utilities to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Combat Helper
const generateEnemyRooster = (difficulty: number, bossName?: string): Rooster => {
  const level = difficulty;
  const baseStats = { health: 80, attack: 10, defense: 5, speed: 10, criticalChance: 5 };
  
  return {
    id: `enemy_${Date.now()}`,
    name: bossName || ContentGenerator.generateRoosterName(),
    breed: BreedType.HINT, // Randomize this later
    rank: level > 10 ? RoosterRank.LEGENDARY : level > 5 ? RoosterRank.EPIC : RoosterRank.COMMON,
    element: ElementType.FIRE,
    level: level,
    xp: 0,
    maxXp: 100,
    stats: {
      health: baseStats.health + (level * 20),
      attack: baseStats.attack + (level * 3),
      defense: baseStats.defense + (level * 2),
      speed: baseStats.speed + (level * 1.5),
      criticalChance: baseStats.criticalChance + Math.floor(level / 2),
    },
    energy: 100,
    hunger: 100,
    hygiene: 100,
    mood: 100,
    traits: [],
    visualSeed: bossName ? bossName : Math.random().toString(36),
    matchesWon: level * 5,
    matchesLost: 0,
    createdAt: Date.now()
  };
};

export const apiService = {
  // Global Economy
  getGlobalEconomy: async (): Promise<GlobalEconomy> => {
    await delay(300);
    // Simulate dynamic changes
    mockGlobalEconomy.activePlayers += Math.floor(Math.random() * 3) - 1;
    mockGlobalEconomy.totalAdViewsToday += Math.floor(Math.random() * 5);
    return { ...mockGlobalEconomy };
  },

  // Player
  getPlayer: async (id: string): Promise<Player> => {
    await delay(500);
    // Refresh from storage in case another tab updated it (basic sync)
    const current = storageService.loadPlayer();
    if (current) mockPlayer = current;
    
    if (id === 'p1') return { ...mockPlayer };
    throw new Error('Player not found');
  },

  updatePlayer: async (player: Player): Promise<boolean> => {
    await delay(200);
    mockPlayer = { ...player };
    storageService.savePlayer(mockPlayer);
    return true;
  },

  // Actions
  claimCrystals: async (playerId: string, amount: number): Promise<{ success: boolean; message: string }> => {
    await delay(400);
    if (mockGlobalEconomy.claimedCrystals + amount > mockGlobalEconomy.dailyCrystalPool) {
      return { success: false, message: 'Havuz tükendi! Yarını bekle.' };
    }
    
    mockGlobalEconomy.claimedCrystals += amount;
    return { success: true, message: 'Kristal alındı.' };
  },

  watchAd: async (playerId: string): Promise<{ success: boolean; reward: number }> => {
    await delay(2000); // Ad duration
    mockGlobalEconomy.totalAdViewsToday += 1;
    
    // Simulate pool boost if many ads watched
    if (mockGlobalEconomy.totalAdViewsToday % 100 === 0) {
      mockGlobalEconomy.dailyCrystalPool += 500;
    }

    return { success: true, reward: ECONOMY_CONFIG.AD_BONUS_PER_VIEW };
  },

  getEnemyForDistrict: async (districtId: string): Promise<Rooster> => {
    await delay(300);
    const district = DISTRICTS.find(d => d.id === districtId);
    if (!district) throw new Error("Invalid district");
    return generateEnemyRooster(district.difficulty, district.boss);
  },

  scavenge: async (coords: { lat: number, lng: number }): Promise<{ success: boolean; message: string; reward?: { gold: number, item?: Item } }> => {
    await delay(1500);
    
    // Mock logic: Use coords to seed random
    const seed = coords.lat + coords.lng;
    const isLucky = Math.random() > 0.3; // 70% success chance
    
    if (!isLucky) {
      return { success: false, message: 'Bu bölgede kayda değer bir şey bulamadın.' };
    }
    
    const goldFound = Math.floor(Math.random() * 50) + 10;
    let itemFound: Item | undefined;
    
    // 10% chance to find an item
    if (Math.random() < 0.1) {
      itemFound = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    }
    
    return {
      success: true,
      message: 'Hurda yığınları arasında bir şeyler parlıyor!',
      reward: {
        gold: goldFound,
        item: itemFound
      }
    };
  },

  scanEnvironment: async (): Promise<{ success: boolean; message: string; reward?: { crystals: number, gold: number } }> => {
    await delay(2000); // Simulate analysis time

    const isLucky = Math.random() > 0.4; // 60% chance to find "glitch"

    if (!isLucky) {
        return { success: false, message: 'Sinyal zayıf. Veri kurtarılamadı.' };
    }

    const crystals = Math.floor(Math.random() * 3) + 1;
    const gold = Math.floor(Math.random() * 25) + 5;

    return {
        success: true,
        message: 'Gizli veri paketi çözüldü!',
        reward: { crystals, gold }
    };
  },

  // Hatching
  hatchEgg: async (rank: RoosterRank): Promise<Rooster> => {
    await delay(1000);
    
    const baseStats = { health: 100, attack: 15, defense: 5, speed: 12, criticalChance: 10 };
    const multiplier = rank === RoosterRank.RARE ? 1.5 : rank === RoosterRank.EPIC ? 2.0 : 1.0;
    
    const newRooster: Rooster = {
        id: `r_${Date.now()}`,
        name: ContentGenerator.generateRoosterName(),
        breed: BreedType.DENIZLI, // Should be randomized
        rank: rank,
        element: ElementType.WIND, // Should be randomized
        level: 1,
        xp: 0,
        maxXp: 100,
        stats: {
            health: Math.floor(baseStats.health * multiplier),
            attack: Math.floor(baseStats.attack * multiplier),
            defense: Math.floor(baseStats.defense * multiplier),
            speed: Math.floor(baseStats.speed * multiplier),
            criticalChance: baseStats.criticalChance
        },
        energy: 100,
        hunger: 100,
        hygiene: 100,
        mood: 100,
        traits: [],
        visualSeed: Math.random().toString(36),
        matchesWon: 0,
        matchesLost: 0,
        createdAt: Date.now()
    };
    return newRooster;
  },

  breedRoosters: async (rooster1Id: string, rooster2Id: string): Promise<{ success: boolean; message: string; egg?: Item }> => {
    await delay(1000);
    
    const r1 = mockPlayer.roosters.find(r => r.id === rooster1Id);
    const r2 = mockPlayer.roosters.find(r => r.id === rooster2Id);
    
    if (!r1 || !r2) return { success: false, message: 'Horozlar bulunamadı.' };
    
    // Determine egg rarity
    let eggRarity = RoosterRank.COMMON;
    const rnd = Math.random();
    
    if (r1.rank === RoosterRank.LEGENDARY || r2.rank === RoosterRank.LEGENDARY) {
        eggRarity = rnd > 0.5 ? RoosterRank.EPIC : RoosterRank.RARE;
    } else if (r1.rank === RoosterRank.EPIC || r2.rank === RoosterRank.EPIC) {
        eggRarity = rnd > 0.5 ? RoosterRank.RARE : RoosterRank.COMMON;
    }

    const egg: Item = {
        id: `egg_bred_${Date.now()}`,
        name: `${eggRarity} Yumurta`,
        description: `Çiftleştirme sonucu: ${r1.name} x ${r2.name}`,
        type: ItemType.EGG,
        price: 0,
        rarity: eggRarity
    };

    return { success: true, message: 'Çiftleştirme başarılı!', egg };
  },

  // Loans
  takeLoan: async (amount: number, interest: number, durationHours: number): Promise<{ success: boolean; loan?: Loan; message: string }> => {
    await delay(500);
    
    // Check if already has unpaid loan
    const hasUnpaid = mockPlayer.loans.some(l => !l.isPaid);
    if (hasUnpaid) {
        return { success: false, message: 'Ödenmemiş borcun varken yeni borç alamazsın!' };
    }

    const newLoan: Loan = {
        id: `loan_${Date.now()}`,
        amount: amount,
        interestRate: interest,
        dueDate: Date.now() + (durationHours * 60 * 60 * 1000),
        isPaid: false
    };

    return { success: true, loan: newLoan, message: 'Kredi onaylandı.' };
  },

  repayLoan: async (loanId: string): Promise<{ success: boolean; message: string }> => {
    await delay(500);
    return { success: true, message: 'Borç ödendi.' };
  },

  // Combat Simulation (Turn-based logic)
  simulateCombat: async (attacker: Rooster, defender: Rooster): Promise<CombatResult> => {
    await delay(1000);
    
    const rounds: CombatRound[] = [];
    let attackerHP = attacker.stats.health;
    let defenderHP = defender.stats.health;
    
    // Max 20 rounds to prevent infinite loops
    let roundCount = 0;
    
    // Speed check for first turn
    let playerTurn = attacker.stats.speed >= defender.stats.speed;

    while (attackerHP > 0 && defenderHP > 0 && roundCount < 20) {
        roundCount++;
        const currentAttacker = playerTurn ? attacker : defender;
        const currentDefender = playerTurn ? defender : attacker;
        
        // Hit calc
        const hitChance = 0.9 + ((currentAttacker.stats.speed - currentDefender.stats.speed) * 0.01);
        const isHit = Math.random() < Math.max(0.2, Math.min(1.0, hitChance));
        
        let damage = 0;
        let isCritical = false;
        let isMiss = !isHit;
        let logMessage = "";

        if (isHit) {
            isCritical = Math.random() < (currentAttacker.stats.criticalChance / 100);
            const critMultiplier = isCritical ? 2.0 : 1.0;
            const rawDamage = currentAttacker.stats.attack * critMultiplier;
            // Defense reduction (simplified)
            damage = Math.floor(Math.max(1, rawDamage - (currentDefender.stats.defense * 0.5)));
            
            // Apply damage
            if (playerTurn) defenderHP -= damage;
            else attackerHP -= damage;

            logMessage = ContentGenerator.getCommentary(isCritical ? 'CRITICAL' : 'HIT');
        } else {
            logMessage = ContentGenerator.getCommentary('MISS');
        }

        rounds.push({
            attackerId: currentAttacker.id,
            defenderId: currentDefender.id,
            damage,
            isCritical,
            isMiss,
            logMessage,
            attackerHealthRemaining: Math.max(0, attackerHP),
            defenderHealthRemaining: Math.max(0, defenderHP)
        });

        // Switch turn
        playerTurn = !playerTurn;
    }

    const winnerId = attackerHP > 0 ? attacker.id : defender.id;
    const loserId = attackerHP > 0 ? defender.id : attacker.id;

    // Calculate Rewards
    const isPlayerWinner = winnerId === attacker.id;
    const rewards = {
        gold: isPlayerWinner ? defender.level * 50 : 10,
        xp: isPlayerWinner ? defender.level * 20 : 5,
    };

    return {
      winnerId,
      loserId,
      rounds,
      rewards
    };
  }
};