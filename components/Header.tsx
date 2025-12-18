import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useGlobalEconomy } from '../context/GlobalEconomyContext';
import { SettingsModal } from './SettingsModal';
import { feedbackService } from '../services/feedbackService';

export const Header: React.FC = () => {
  const { state } = useGame();
  const { economy } = useGlobalEconomy();
  const player = state.player;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (!player) return <div className="h-16 bg-black border-b border-gray-800"></div>;

  const stability = economy?.stabilityIndex || 100;
  const isUnstable = stability < 50;

  return (
    <>
      <header className="h-16 bg-black border-b border-gray-800 flex items-center justify-between px-4 z-10 shrink-0 relative">
        {/* Background Alert for Low Stability */}
        {isUnstable && (
            <div className="absolute inset-0 bg-red-900/20 animate-pulse pointer-events-none z-0"></div>
        )}

        <div className="flex items-center space-x-3 z-10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-900 to-black border border-purple-500 flex items-center justify-center font-bold text-lg shadow-[0_0_10px_rgba(168,85,247,0.3)] relative">
            {player.level}
            {/* Online Status Dot */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white leading-none tracking-wide">{player.username}</span>
            <span className="text-[10px] text-purple-400 uppercase tracking-widest">{player.title}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 z-10">
          
          {/* Economy / Stability Widget */}
          <div className="flex flex-col items-end mr-1">
             <div className="flex items-center space-x-3">
                <div className="flex items-center text-yellow-500 font-bold text-sm">
                    <span>{player.gold}</span>
                    <span className="ml-0.5 text-[10px] text-yellow-700">G</span>
                </div>
                <div className="flex items-center text-cyan-400 font-bold text-xs">
                    <span>{player.crystals}</span>
                    <span className="ml-0.5 text-[10px]">💎</span>
                </div>
             </div>
             
             {/* Stability Bar */}
             <div className="flex items-center space-x-1 mt-0.5">
                 <span className="text-[9px] text-gray-500 tracking-wider">SYS:</span>
                 <div className="w-12 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-500 ${isUnstable ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} 
                        style={{ width: `${stability}%` }}
                    ></div>
                 </div>
                 <span className={`text-[9px] font-bold ${isUnstable ? 'text-red-500' : 'text-green-500'}`}>{stability}%</span>
             </div>
          </div>
          
          <button 
            onClick={() => { feedbackService.playClick(); setIsSettingsOpen(true); }}
            className="w-8 h-8 rounded bg-neutral-800 border border-neutral-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 active:scale-95 transition-all"
          >
            ⚙️
          </button>
        </div>
      </header>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};