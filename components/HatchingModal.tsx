import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Rooster } from '../types';
import { RoosterAvatar } from './RoosterAvatar';
import { feedbackService } from '../services/feedbackService';

interface HatchingModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooster: Rooster | null;
}

export const HatchingModal: React.FC<HatchingModalProps> = ({ isOpen, onClose, rooster }) => {
  const [phase, setPhase] = useState<'egg' | 'cracking' | 'hatched'>('egg');
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setPhase('egg');
      setClicks(0);
    }
  }, [isOpen]);

  const handleTap = () => {
    if (phase === 'hatched') return;

    setClicks(prev => prev + 1);
    feedbackService.playClick();

    if (clicks < 2) {
      // Shake animation effect handled by CSS via `active:scale` in button or keyframes
    } else if (clicks === 2) {
      setPhase('cracking');
      setTimeout(() => {
        setPhase('hatched');
        feedbackService.playSuccess();
      }, 1000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-95 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm p-8 flex flex-col items-center">
        
        {phase !== 'hatched' && (
           <h2 className="text-2xl font-bold text-white mb-8 animate-pulse text-center">
             {phase === 'egg' ? 'YUMURTAYI ÇATLAT!' : 'ÇIKIYOR...'}
           </h2>
        )}

        <div 
          onClick={handleTap}
          className="relative cursor-pointer transition-transform duration-100"
        >
          {phase === 'egg' && (
             <div className={`text-[150px] transition-transform ${clicks > 0 ? 'animate-shake' : ''}`}>
               🥚
             </div>
          )}
          
          {phase === 'cracking' && (
             <div className="text-[150px] animate-bounce">
               🐣
             </div>
          )}

          {phase === 'hatched' && rooster && (
             <div className="flex flex-col items-center animate-fade-in">
                 <div className="relative">
                    <div className="absolute inset-0 bg-yellow-500 blur-3xl opacity-30 rounded-full animate-pulse"></div>
                    <RoosterAvatar seed={rooster.visualSeed} size={200} className="relative z-10" />
                 </div>
                 
                 <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600 mt-6 mb-2">
                     {rooster.name}
                 </h2>
                 
                 <div className="flex items-center space-x-2 mb-4">
                     <span className={`px-3 py-1 rounded text-sm font-bold border ${
                         rooster.rank === 'LEGENDARY' ? 'border-yellow-500 text-yellow-500' : 
                         rooster.rank === 'EPIC' ? 'border-purple-500 text-purple-500' : 'border-gray-500 text-gray-500'
                     }`}>
                         {rooster.rank}
                     </span>
                     <span className="text-gray-400 text-sm">{rooster.breed}</span>
                 </div>

                 <div className="grid grid-cols-2 gap-4 w-full text-sm">
                     <div className="bg-neutral-800 p-2 rounded text-center">
                         <div className="text-red-400 font-bold">GÜÇ</div>
                         <div>{rooster.stats.attack}</div>
                     </div>
                     <div className="bg-neutral-800 p-2 rounded text-center">
                         <div className="text-blue-400 font-bold">HIZ</div>
                         <div>{rooster.stats.speed}</div>
                     </div>
                 </div>

                 <button 
                   onClick={onClose}
                   className="mt-8 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105"
                 >
                   TAMAM
                 </button>
             </div>
          )}
        </div>

        {phase === 'egg' && (
          <p className="text-gray-500 mt-8 text-sm animate-bounce">
            Tıkla ve kır! ({3 - clicks})
          </p>
        )}
      </div>
    </div>
  );
};