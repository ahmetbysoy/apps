// Enums
export enum RoosterRank {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  MYTHIC = 'MYTHIC'
}

export enum BreedType {
  DENIZLI = 'Denizli',
  HINT = 'Hint',
  ASEEL = 'Aseel',
  SHAMO = 'Shamo',
  BRAHMA = 'Brahma',
  GERZE = 'Gerze',
  SUMATRA = 'Sumatra',
  MODERN_GAME = 'Modern Game',
  PHOENIX = 'Phoenix',
  AYAM_CEMANI = 'Ayam Cemani'
}

export enum ElementType {
  IRON = 'IRON',   // Defense focus
  WIND = 'WIND',   // Speed focus
  FIRE = 'FIRE',   // Attack focus
  EARTH = 'EARTH', // Health focus
  POISON = 'POISON' // Tech/DoT focus
}

export enum ItemType {
  CONSUMABLE = 'CONSUMABLE',
  EQUIPMENT = 'EQUIPMENT',
  BOOSTER = 'BOOSTER',
  EGG = 'EGG',
  ILLEGAL = 'ILLEGAL'
}

export enum TaskType {
  DAILY = 'DAILY',
  ACHIEVEMENT = 'ACHIEVEMENT'
}

// Interfaces

export interface Stats {
  health: number;
  attack: number;
  defense: number;
  speed: number;
  criticalChance: number;
}

export interface Rooster {
  id: string;
  name: string;
  breed: BreedType;
  rank: RoosterRank;
  element: ElementType;
  level: number;
  xp: number;
  maxXp: number;
  stats: Stats;
  energy: number; // 0-100
  hunger: number; // 0-100
  hygiene: number; // 0-100
  mood: number; // 0-100
  traits: string[];
  visualSeed: string; // For SVG generator
  matchesWon: number;
  matchesLost: number;
  createdAt: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  effect?: {
    stat?: keyof Stats | 'energy' | 'hunger' | 'hygiene' | 'mood';
    value: number;
    duration?: number; // seconds
  };
  price: number;
  image?: string;
  rarity: RoosterRank;
}

export interface InventoryItem extends Item {
  quantity: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  requirement: {
    type: 'fight' | 'train' | 'breed' | 'earn';
    target: number;
    current: number;
  };
  reward: {
    gold: number;
    crystals: number;
    xp: number;
  };
  completed: boolean;
  claimed: boolean;
}

export interface Loan {
  id: string;
  amount: number;
  interestRate: number;
  dueDate: number;
  isPaid: boolean;
}

export interface Player {
  id: string;
  username: string;
  title: string;
  level: number;
  xp: number;
  gold: number;      // Soft currency
  crystals: number;  // Hard currency (Pool based)
  prestige: number;  // Social score
  
  roosters: Rooster[];
  inventory: InventoryItem[];
  tasks: Task[];
  loans: Loan[];
  
  stats: {
    totalBattles: number;
    wins: number;
    losses: number;
    totalAdViews: number;
    lastLogin: number;
  };
  
  settings: {
    soundEnabled: boolean;
    notificationsEnabled: boolean;
  };

  shieldExpiresAt: number; // Timestamp
}

export interface GlobalEconomy {
  dailyCrystalPool: number;
  claimedCrystals: number;
  activePlayers: number;
  totalAdViewsToday: number;
  stabilityIndex: number; // 0-100
  lastDrainTime: number;
  nextDrainTime: number;
  marketTaxRate: number;
  status: 'STABLE' | 'VOLATILE' | 'CRITICAL' | 'DRAINING';
}

export interface CombatRound {
  attackerId: string;
  defenderId: string;
  damage: number;
  isCritical: boolean;
  isMiss: boolean;
  logMessage: string;
  attackerHealthRemaining: number;
  defenderHealthRemaining: number;
}

export interface CombatResult {
  winnerId: string;
  loserId: string;
  rounds: CombatRound[];
  rewards: {
    gold: number;
    xp: number;
    item?: Item;
  };
}

export interface CombatSession {
    id: string;
    playerRooster: Rooster;
    enemyRooster: Rooster;
    result: CombatResult | null; // Null initially
    isActive: boolean;
}

export interface TrainingSession {
  roosterId: string;
  type: 'strength' | 'speed' | 'endurance';
  duration: number; // seconds
  energyCost: number;
  xpGained: number;
  statGain?: Partial<Stats>;
}