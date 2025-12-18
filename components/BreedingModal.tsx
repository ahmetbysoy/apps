import React, { useState } from 'react';
import { Modal } from './Modal';
import { Rooster } from '../types';
import { RoosterAvatar } from './RoosterAvatar';
import { feedbackService } from '../services/feedbackService';

interface BreedingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roosters: Rooster[];
  onBreed: (id1: string, id2: string) => void;
}

export const BreedingModal: React.FC<BreedingModalProps> = ({ isOpen, onClose, roosters, onBreed }) => {
  const [selected1, setSelected1] = useState<string | null>(null);
  const [selected2, setSelected2] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    feedbackService.playClick();
    if (selected1 === id) setSelected1(null);
    else if (selected2 === id) setSelected2(null);
    else if (!selected1) setSelected1(id);
    else if (!selected2) setSelected2(id);
  };

  const handleBreedClick = () => {
    if (selected1 && selected2) {
      onBreed(selected1, selected2);
      setSelected1(null);
      setSelected2(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ÇİFTLEŞTİRME">
      <div className="mb-4 bg-neutral-800 p-3 rounded-lg text-sm text-center">
        <p className="text-gray-300">İki horoz seç ve yeni bir yumurta elde et.</p>
        <div className="mt-2 text-xs flex justify-center space-x-4">
            <span className="text-yellow-500 font-bold">Maliyet: 200 G</span>
            <span className="text-cyan-400 font-bold">20 💎</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto mb-4">
        {roosters.map(rooster => {
          const isSelected = selected1 === rooster.id || selected2 === rooster.id;
          return (
            <div 
              key={rooster.id}
              onClick={() => handleSelect(rooster.id)}
              className={`p-2 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected ? 'border-pink-500 bg-pink-900/20' : 'border-neutral-700 bg-neutral-800'
              }`}
            >
              <RoosterAvatar seed={rooster.visualSeed} size={60} className="mx-auto" />
              <div className="text-center mt-1">
                <div className="font-bold text-xs text-white truncate">{rooster.name}</div>
                <div className="text-[10px] text-gray-400">{rooster.rank}</div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        disabled={!selected1 || !selected2}
        onClick={handleBreedClick}
        className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
          selected1 && selected2 
            ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]' 
            : 'bg-neutral-800 text-gray-500 cursor-not-allowed'
        }`}
      >
        ❤️ ÇİFTLEŞTİR
      </button>
    </Modal>
  );
};