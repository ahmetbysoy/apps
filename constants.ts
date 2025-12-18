import { ElementType, Item, ItemType, RoosterRank } from './types';

export const ECONOMY_CONFIG = {
  // Global havuz
  DAILY_CRYSTAL_POOL: 10000,
  AD_THRESHOLD: 2000,
  
  // Spawn oranları
  BASE_CRYSTAL_CHANCE: 10, // %10
  AD_BONUS_PER_VIEW: 3,    // %3
  SHIELD_BONUS: 15,        // %15
  
  // Drain parametreleri
  DRAIN_INTERVAL: 6 * 60 * 60 * 1000, // 6 saat (ms)
  DRAIN_MIN: 1,
  DRAIN_MAX: 3,
  
  // Shield sistemi
  SHIELD_DURATION: 24 * 60 * 60 * 1000, // 24 saat (ms)
  ADS_FOR_SHIELD: 3,
  
  // Stabilite
  STABILITY_RECOVERY_RATE: 10,
  STABILITY_WARNING_THRESHOLD: 50,
  STABILITY_CRITICAL_THRESHOLD: 40,
};

export const DISTRICTS = [
  { id: 'd1', name: 'Tarlabaşı Çukuru', difficulty: 1, boss: 'Jilet Hasan', description: 'Başlangıç bölgesi. Tekinsiz ama ucuz.' },
  { id: 'd2', name: 'Dolapdere Yokuşu', difficulty: 2, boss: 'Kasap Nuri', description: 'Mekanikler ve hurdacılar diyarı.' },
  { id: 'd3', name: 'Kasımpaşa Sahil', difficulty: 3, boss: 'Pala Remzi', description: 'Eski denizcilerin horoz dövüştürdüğü yer.' },
  { id: 'd4', name: 'Balat Sokakları', difficulty: 4, boss: 'Antika Cemil', description: 'Tarihi dokuda modern dövüşler.' },
  { id: 'd5', name: 'Karaköy Limanı', difficulty: 5, boss: 'Zincir Kıran', description: 'İthal horozların giriş kapısı.' },
  { id: 'd6', name: 'Eminönü Meydanı', difficulty: 6, boss: 'Balıkçı Rıza', description: 'Kalabalık ve kaotik.' },
  { id: 'd7', name: 'Sultanahmet Altı', difficulty: 7, boss: 'Bizanslı', description: 'Yeraltı sarnıçlarında gizli arenalar.' },
  { id: 'd8', name: 'Kapalıçarşı', difficulty: 8, boss: 'Altın Diş', description: 'Para ve bahsin kalbi.' },
  { id: 'd9', name: 'Fikirtepe', difficulty: 9, boss: 'Beton Erol', description: 'Kentsel dönüşümün ortasında vahşi dövüşler.' },
  { id: 'd10', name: 'Bağcılar Meydan', difficulty: 10, boss: 'Apaçi Serkan', description: 'Hızlı ve öfkeli horozlar.' },
  { id: 'd11', name: 'Gazi Mahallesi', difficulty: 11, boss: 'Barikat', description: 'Sert kuralların işlediği bölge.' },
  { id: 'd12', name: 'Etiler', difficulty: 12, boss: 'Baron', description: 'Sadece VIP davetiyle girilen lüks arenalar.' },
  { id: 'd13', name: 'Maslak Cyberpark', difficulty: 13, boss: 'Neo', description: 'Teknolojik implantlı horozlar.' },
  { id: 'd14', name: 'Bebek Sahili', difficulty: 14, boss: 'Prenses', description: 'Görünüşe aldanma, ölümcül güzellik.' },
  { id: 'd15', name: 'Yeraltı Metrosu', difficulty: 15, boss: 'Hayalet', description: 'En derindeki karanlık arena.' }
];

export const ROOSTER_NAMES = [
  "Jilet", "Rüzgar", "Şimşek", "Barut", "Keleş", "Zalim", "Gaddar", 
  "Poyraz", "Karayel", "Lodos", "Tayfun", "Bora", "Kasırga", "Deprem", 
  "Volkan", "Alev", "Kor", "Duman", "Gölge", "Hayalet", "Azrail", 
  "Cellat", "Reis", "Paşa", "Sultan", "Hünkar", "Vezir", "Efe", 
  "Yiğit", "Cengaver", "Pehlivan", "Balyoz", "Çekiç", "Örs", "Kıvılcım", 
  "Yıldırım", "Atmaca", "Şahin", "Kartal", "Doğan", "Kuzgun", "Akbaba", 
  "Panzer", "Tank", "Roket", "Füze", "Mermi", "Hançer", "Kama", "Pala"
];

export const COMMENTARY = {
  START: [
    "Bahisler kapandı, tüyler diken diken!",
    "İki gladyatör arenaya iniyor!",
    "Bugün buradan sadece biri yürüyerek çıkacak!",
    "Kıyamet kopmaya hazır!"
  ],
  HIT: [
    "Gaga tam çeneye oturdu!",
    "Vay babam vay! Ciğerini söktü!",
    "Bu darbe dedesinin kemiklerini sızlattı!",
    "Kanat darbesiyle sersemletti!",
    "Adeta bir balyoz gibi indi!",
    "Tüyler havada uçuşuyor!",
    "Müthiş bir refleks!",
    "Göz açıp kapayıncaya kadar vurdu!",
    "Bu acıyı tribünler bile hissetti!",
    "Kemik sesi buraya kadar geldi!"
  ],
  CRITICAL: [
    "AMAN ALLAHIM! Resmen infaz etti!",
    "KRİTİK VURUŞ! Işıkları söndürdü!",
    "Bu vuruş tarih kitaplarına geçer!",
    "YIKIM! DEHŞET! VAHŞET!",
    "Buna can mı dayanır be!"
  ],
  MISS: [
    "Rüzgarı hissetti ama kendisini bulamadı!",
    "Karavana! Hedefi ıskaladı.",
    "Büyük bir ustalıkla sıyrıldı!",
    "Dans eder gibi kaçtı!",
    "Gölgesine vurdu!"
  ],
  SPECIAL: [
    "İçindeki canavarı serbest bıraktı!",
    "Gözlerinden ateş fışkırıyor!",
    "Bu dünya dışı bir hareket!",
    "Elementlerin gücünü kullanıyor!"
  ],
  WIN: [
    "Ve kazanan belli oldu! İmparator selamlıyor!",
    "Zafer sarhoşluğuyla kükrüyor!",
    "Rakibini toz duman etti!",
    "Bu arena artık onun çöplüğü!"
  ]
};

export const ITEMS: Item[] = [
  {
    id: 'food_basic',
    name: 'Buğday Kırığı',
    description: 'Standart yem. Karın doyurur.',
    type: ItemType.CONSUMABLE,
    price: 10,
    rarity: RoosterRank.COMMON,
    effect: { stat: 'hunger', value: 20 }
  },
  {
    id: 'food_premium',
    name: 'Protein Karışımı',
    description: 'Kas gelişimi için özel formül.',
    type: ItemType.CONSUMABLE,
    price: 50,
    rarity: RoosterRank.RARE,
    effect: { stat: 'hunger', value: 50 }
  },
  {
    id: 'potion_heal',
    name: 'Kırmızı İksir',
    description: 'Yaraları hızlı iyileştirir.',
    type: ItemType.CONSUMABLE,
    price: 30,
    rarity: RoosterRank.COMMON,
    effect: { stat: 'health', value: 50 }
  },
  {
    id: 'stim_speed',
    name: 'Adrenalin İğnesi',
    description: 'Geçici hız artışı sağlar.',
    type: ItemType.BOOSTER,
    price: 100,
    rarity: RoosterRank.EPIC,
    effect: { stat: 'speed', value: 20, duration: 300 }
  },
  {
    id: 'gear_spurs',
    name: 'Çelik Mahmuz',
    description: 'Saldırı gücünü artırır.',
    type: ItemType.EQUIPMENT,
    price: 500,
    rarity: RoosterRank.RARE,
    effect: { stat: 'attack', value: 15 }
  },
  {
    id: 'egg_common',
    name: 'Sıradan Yumurta',
    description: 'İçinden gelecek vadeden bir civciv çıkabilir.',
    type: ItemType.EGG,
    price: 500,
    rarity: RoosterRank.COMMON
  },
  {
    id: 'egg_rare',
    name: 'Nadir Yumurta',
    description: 'Güçlü genlere sahip bir soy taşıyor.',
    type: ItemType.EGG,
    price: 2000,
    rarity: RoosterRank.RARE
  },
  // Black Market Items
  {
    id: 'illegal_steroid',
    name: 'Sentetik Kas',
    description: 'YASAKLI. Muazzam güç verir ama sağlığı bozar.',
    type: ItemType.ILLEGAL,
    price: 1500,
    rarity: RoosterRank.EPIC,
    effect: { stat: 'attack', value: 50 } // Side effects handled in logic
  },
  {
    id: 'illegal_chip',
    name: 'Overclock Çipi',
    description: 'YASAKLI. Beyin sınırlarını kaldırır. Delirme riski.',
    type: ItemType.ILLEGAL,
    price: 2500,
    rarity: RoosterRank.LEGENDARY,
    effect: { stat: 'speed', value: 40 }
  }
];