import React from 'react';
import { Modal } from './Modal';
import { Rooster } from '../types';
import { RoosterAvatar } from './RoosterAvatar';
import { useGame } from '../context/GameContext';
import { useToast } from '../context/ToastContext';

interface CoopModalProps {
  isOpen: boolean;
  onClose: () => void;
  roosters: Rooster[];
  activeRoosterId: string;
  onSelectActive: (id: string) => void;
}

export const CoopModal: React.FC<CoopModalProps> = ({ isOpen, onClose, roosters, activeRoosterId, onSelectActive }) => {
  const { sellRooster } = useGame();
  const { addToast } = useToast();

  const handleSell = async (roosterId: string) => {
      if (window.confirm("Bu horozu satmak istediğine emin misin?")) {
          const result = await sellRooster(roosterId);
          if (result.success) {
              addToast(result.message, 'success');
          } else {
              addToast(result.message, 'error');
          }
      }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="KÜMES YÖNETİMİ">
      <div className="space-y-3">
        {roosters.map((rooster) => {
          const isActive = rooster.id === activeRoosterId;
          // Calculate estimated value
          const rankMultiplier = { COMMON: 1, RARE: 2, EPIC: 4, LEGENDARY: 10, MYTHIC: 50 };
          const value = rooster.level * 100 * (rankMultiplier[rooster.rank] || 1);

          return (
            <div 
              key={rooster.id}
              className={`
                relative p-3 rounded-xl border-2 transition-all flex flex-col space-y-2
                ${isActive 
                  ? 'bg-purple-900/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                  : 'bg-neutral-800 border-neutral-700'
                }
              `}
            >
              <div 
                className="flex items-center space-x-4 cursor-pointer"
                onClick={() => !isActive && onSelectActive(rooster.id)}
              >
                  <div className="relative">
                     <RoosterAvatar seed={rooster.visualSeed} size={60} />
                     <span className="absolute -bottom-1 -right-1 bg-black text-white text-[10px] px-1.5 rounded border border-gray-700">
                        Lvl {rooster.level}
                     </span>
                  </div>
                  
                  <div className="flex-1">
                     <div className="flex items-center justify-between">
                        <h4 className={`font-bold ${isActive ? 'text-purple-300' : 'text-gray-200'}`}>{rooster.name}</h4>
                        {isActive && <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded font-bold">LİDER</span>}
                     </div>
                     <p className="text-[10px] text-gray-500 uppercase tracking-wider">{rooster.breed} • {rooster.rank}</p>
                     
                     {/* Mini Stats */}
                     <div className="flex space-x-3 mt-1 text-[10px] text-gray-400">
                        <span>⚔️ {rooster.stats.attack}</span>
                        <span>🛡️ {rooster.stats.defense}</span>
                        <span>⚡ {rooster.stats.speed}</span>
                     </div>
                  </div>
              </div>

              {!isActive && (
                  <div className="border-t border-gray-700 pt-2 flex justify-end">
                      <button 
                        onClick={() => handleSell(rooster.id)}
                        className="text-[10px] font-bold bg-red-900/30 text-red-400 border border-red-900/50 px-3 py-1 rounded hover:bg-red-900 hover:text-white transition-colors"
                      >
                          SAT ({value} G)
                      </button>
                  </div>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
};