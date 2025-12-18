import React from 'react';
import { Modal } from './Modal';
import { InventoryItem, ItemType } from '../types';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  onHatch: (itemId: string, rarity: any) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose, inventory, onHatch }) => {
  const eggs = inventory.filter(i => i.type === ItemType.EGG);
  const others = inventory.filter(i => i.type !== ItemType.EGG);

  const renderItem = (item: InventoryItem, canUse: boolean) => (
    <div key={item.id} className="bg-neutral-800 border border-neutral-700 p-3 rounded-lg flex justify-between items-center mb-2">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-black rounded flex items-center justify-center text-xl">
           {item.type === ItemType.EGG ? '🥚' : 
            item.type === ItemType.CONSUMABLE ? '🍗' : '🛡️'}
        </div>
        <div>
           <div className="text-white text-sm font-bold">{item.name}</div>
           <div className="text-gray-500 text-[10px]">Miktar: {item.quantity}</div>
        </div>
      </div>
      
      {item.type === ItemType.EGG && (
         <button 
           onClick={() => onHatch(item.id, item.rarity)}
           className="bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-purple-500"
         >
           ÇATLAT
         </button>
      )}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ÇANTA">
      {eggs.length > 0 && (
          <div className="mb-4">
              <h4 className="text-purple-400 text-xs font-bold mb-2 uppercase tracking-wider">Yumurtalar</h4>
              {eggs.map(item => renderItem(item, true))}
          </div>
      )}
      
      {others.length > 0 && (
          <div>
              <h4 className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Diğer Eşyalar</h4>
              {others.map(item => renderItem(item, false))}
          </div>
      )}

      {inventory.length === 0 && (
          <div className="text-center text-gray-500 py-8">
              Çantan boş. Pazara gitmelisin.
          </div>
      )}
    </Modal>
  );
};