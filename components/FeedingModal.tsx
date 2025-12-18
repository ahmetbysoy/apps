import React from 'react';
import { Modal } from './Modal';
import { InventoryItem, Rooster } from '../types';

interface FeedingModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooster: Rooster | undefined;
  inventory: InventoryItem[];
  onFeed: (itemId: string) => void;
}

export const FeedingModal: React.FC<FeedingModalProps> = ({ isOpen, onClose, rooster, inventory, onFeed }) => {
  if (!rooster) return null;

  const consumables = inventory.filter(i => i.type === 'CONSUMABLE');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`BESLEME: ${rooster.name}`}>
      <div className="mb-6 text-center">
         <div className="text-sm text-gray-400">Açlık Durumu</div>
         <div className="w-full bg-gray-800 h-4 rounded-full mt-1 overflow-hidden relative">
            <div 
                className={`h-full transition-all ${rooster.hunger < 30 ? 'bg-red-500' : 'bg-green-500'}`} 
                style={{ width: `${rooster.hunger}%` }}
            ></div>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow">
                %{rooster.hunger}
            </span>
         </div>
         {rooster.hunger >= 100 && <p className="text-xs text-green-500 mt-1">Horozun karnı tok!</p>}
      </div>

      {consumables.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <p className="mb-2">Çantanda yiyecek yok.</p>
          <p className="text-xs">Pazardan yiyecek alabilirsin.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {consumables.map(item => (
            <button
              key={item.id}
              onClick={() => onFeed(item.id)}
              disabled={rooster.hunger >= 100}
              className="w-full bg-neutral-800 border border-neutral-700 p-3 rounded-lg flex justify-between items-center hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex flex-col text-left">
                <span className="font-bold text-white text-sm">{item.name}</span>
                <span className="text-[10px] text-gray-400">Miktar: {item.quantity}</span>
              </div>
              <div className="text-right">
                <span className="text-green-500 text-xs font-bold block">
                    +{item.effect?.value || 0} Açlık
                </span>
                <span className="text-purple-400 text-[10px]">Tüket</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
};