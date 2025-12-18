import React from 'react';
import { Modal } from './Modal';
import { useGame } from '../context/GameContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { state, toggleSetting, resetGame } = useGame();
  const settings = state.player?.settings;

  if (!settings) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AYARLAR">
      <div className="space-y-4">
        {/* Toggle Items */}
        <div className="bg-neutral-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                    <span className="text-2xl">🔊</span>
                    <div>
                        <div className="font-bold text-white">Ses Efektleri</div>
                        <div className="text-xs text-gray-400">Oyun içi sesler</div>
                    </div>
                </div>
                <button 
                    onClick={() => toggleSetting('soundEnabled')}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${settings.soundEnabled ? 'bg-green-600' : 'bg-gray-600'}`}
                >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <span className="text-2xl">📳</span>
                    <div>
                        <div className="font-bold text-white">Titreşim</div>
                        <div className="text-xs text-gray-400">Haptik geri bildirim</div>
                    </div>
                </div>
                <button 
                    onClick={() => toggleSetting('notificationsEnabled')}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${settings.notificationsEnabled ? 'bg-green-600' : 'bg-gray-600'}`}
                >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
            </div>
        </div>

        {/* Data Management */}
        <div className="bg-neutral-800 rounded-lg p-4 border border-red-900/30">
            <h4 className="text-red-500 font-bold text-sm mb-2">TEHLİKELİ BÖLGE</h4>
            <p className="text-xs text-gray-400 mb-4">Oyun verilerini sıfırlamak geri alınamaz.</p>
            <button 
                onClick={() => {
                    if (window.confirm("Bütün ilerlemen silinecek. Emin misin?")) {
                        resetGame();
                    }
                }}
                className="w-full bg-red-900/50 hover:bg-red-800 border border-red-600 text-red-200 font-bold py-2 rounded transition-colors text-sm"
            >
                OYUNU SIFIRLA
            </button>
        </div>

        <div className="text-center text-[10px] text-gray-600 mt-4">
            Horoz İmparatorluğu v1.0.0 (Alpha)<br/>
            ID: {state.player?.id}
        </div>
      </div>
    </Modal>
  );
};