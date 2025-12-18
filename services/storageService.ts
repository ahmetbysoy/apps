import { Player } from '../types';

const STORAGE_KEY = 'horoz_imparatorlugu_save_v1';

export const storageService = {
  savePlayer: (player: Player) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
    } catch (e) {
      console.error('Save failed', e);
    }
  },

  loadPlayer: (): Player | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Load failed', e);
      return null;
    }
  },

  clearSave: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};