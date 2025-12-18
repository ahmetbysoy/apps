import { ROOSTER_NAMES, DISTRICTS, COMMENTARY } from '../constants';
import { Task, TaskType } from '../types';

export const ContentGenerator = {
  
  generateRoosterName: (): string => {
    const prefix = ROOSTER_NAMES[Math.floor(Math.random() * ROOSTER_NAMES.length)];
    const suffix = Math.random() > 0.7 ? ` ${Math.floor(Math.random() * 99) + 1}` : '';
    // Optional: Add titles based on rarity later
    return `${prefix}${suffix}`;
  },

  generateNewsHeadline: (): string => {
    const templates = [
      "SON DAKİKA: {district} bölgesinde polis baskını! 50 horoz gözaltında.",
      "EKONOMİ: Kristal borsası bugün %{percent} değer kazandı.",
      "YER ALTI: {district} arenasında efsanevi bir maç gerçekleşti.",
      "TEKNOLOJİ: Maslak Cyberpark'ta yeni bir sibernetik kanat geliştirildi.",
      "UYARI: Enerji dalgalanmaları bekleniyor, kalkanlarınızı aktif tutun.",
      "GOSSIP: Ünlü dövüşçü {name}, şampiyonluk maçına çıkacağını duyurdu.",
      "HAVA DURUMU: Asit yağmurları {district} üzerinde etkili olacak.",
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];
    const district = DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)].name;
    const name = ROOSTER_NAMES[Math.floor(Math.random() * ROOSTER_NAMES.length)];
    const percent = Math.floor(Math.random() * 20) + 5;

    return template
      .replace('{district}', district)
      .replace('{name}', name)
      .replace('{percent}', percent.toString());
  },

  getCommentary: (type: 'START' | 'HIT' | 'CRITICAL' | 'MISS' | 'SPECIAL' | 'WIN'): string => {
    const list = COMMENTARY[type];
    if (!list) return "Arenadan sesler yükseliyor...";
    return list[Math.floor(Math.random() * list.length)];
  },

  generateDailyTasks: (playerLevel: number): Task[] => {
    // Generate simple tasks based on level
    return [
      {
        id: `daily_${Date.now()}_1`,
        title: 'Antrenman Günü',
        description: 'Horozunu 3 kez antrenman yaptır.',
        type: TaskType.DAILY,
        requirement: { type: 'train', target: 3, current: 0 },
        reward: { gold: 100 * playerLevel, crystals: 2, xp: 50 },
        completed: false,
        claimed: false
      },
      {
        id: `daily_${Date.now()}_2`,
        title: 'Arena Tozu',
        description: '2 arena dövüşü kazan.',
        type: TaskType.DAILY,
        requirement: { type: 'fight', target: 2, current: 0 },
        reward: { gold: 200 * playerLevel, crystals: 5, xp: 100 },
        completed: false,
        claimed: false
      },
       {
        id: `daily_${Date.now()}_3`,
        title: 'Reklam Desteği',
        description: 'Sistemi desteklemek için 3 reklam izle.',
        type: TaskType.DAILY,
        requirement: { type: 'earn', target: 3, current: 0 },
        reward: { gold: 50, crystals: 10, xp: 20 },
        completed: false,
        claimed: false
      }
    ];
  }
};