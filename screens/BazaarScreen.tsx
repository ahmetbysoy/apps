import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useGlobalEconomy } from '../context/GlobalEconomyContext';
import { feedbackService } from '../services/feedbackService';

export const BazaarScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  const { economy } = useGlobalEconomy();
  const [betAmount, setBetAmount] = useState(100);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const handleGamble = () => {
    if (!state.player || state.player.gold < betAmount) {
      setGameResult("Yetersiz bakiye!");
      feedbackService.playError();
      return;
    }

    setIsRolling(true);
    setGameResult(null);
    feedbackService.playClick();

    // Police Raid Check (Risk based on stability)
    const stability = economy?.stabilityIndex || 100;
    const raidChance = Math.max(0.05, (100 - stability) / 200); // Higher risk if unstable

    setTimeout(() => {
      setIsRolling(false);
      
      if (Math.random() < raidChance) {
        // Police Raid!
        const fine = Math.floor(state.player.gold * 0.2);
        dispatch({ type: 'SPEND_GOLD', payload: fine });
        setGameResult(`POLİS BASKINI! Kaçarken ${fine}G düşürdün!`);
        feedbackService.playError();
        return;
      }

      // Simple Dice Roll (Win 50% chance)
      const win = Math.random() > 0.5;
      if (win) {
        const profit = Math.floor(betAmount * 0.8); // House edge
        dispatch({ type: 'ADD_GOLD', payload: profit });
        setGameResult(`Kazandın! +${profit}G`);
        feedbackService.playCash();
      } else {
        dispatch({ type: 'SPEND_GOLD', payload: betAmount });
        setGameResult(`Kaybettin... -${betAmount}G`);
        feedbackService.playError();
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900 p-4 pb-24 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-900 to-black">
      <header className="mb-8 text-center">
        <h2 className="text-4xl font-bold text-red-600 font-rajdhani drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
          YERALTI ÇARŞISI
        </h2>
        <p className="text-gray-500 text-sm">Burada kural yok. Sadece şans ve risk var.</p>
      </header>

      <div className="bg-black border border-red-900 rounded-2xl p-6 shadow-2xl mb-6 relative overflow-hidden">
        {/* Atmosphere effects */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-pulse opacity-50"></div>
        
        <h3 className="text-xl text-center text-gray-300 mb-6 font-bold tracking-widest">
          ZAR AT (BARBUT)
        </h3>

        <div className="flex justify-center mb-8">
          <div className={`text-6xl font-bold transition-all duration-300 ${isRolling ? 'animate-bounce text-yellow-500' : 'text-white'}`}>
            {isRolling ? '...' : '🎲'}
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="w-full">
            <label className="text-gray-500 text-xs uppercase font-bold mb-1 block text-center">Bahis Miktarı</label>
            <div className="flex items-center justify-center space-x-2">
              <button 
                onClick={() => { setBetAmount(Math.max(10, betAmount - 50)); feedbackService.playClick(); }} 
                className="p-2 bg-neutral-800 rounded active:bg-neutral-700"
              >
                -
              </button>
              <span className="text-2xl font-bold text-yellow-500 w-24 text-center">{betAmount}G</span>
              <button 
                onClick={() => { setBetAmount(betAmount + 50); feedbackService.playClick(); }} 
                className="p-2 bg-neutral-800 rounded active:bg-neutral-700"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleGamble}
            disabled={isRolling}
            className={`
              w-full py-4 rounded-xl font-bold text-lg tracking-wider transition-all
              ${isRolling 
                ? 'bg-neutral-800 text-gray-500' 
                : 'bg-red-700 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(185,28,28,0.4)] active:scale-95'
              }
            `}
          >
            {isRolling ? 'ZARLAR DÖNÜYOR...' : 'ŞANSINI DENE'}
          </button>

          {gameResult && (
            <div className={`mt-4 text-center font-bold p-3 rounded w-full animate-fade-in ${gameResult.includes('Kazandın') ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
              {gameResult}
            </div>
          )}
        </div>
      </div>

      <div className="bg-neutral-800 rounded-xl p-4 border border-neutral-700">
        <h4 className="text-gray-400 font-bold mb-2 text-sm">GÜVENLİK DURUMU</h4>
        <div className="flex items-center space-x-2">
          <div className={`h-3 flex-1 rounded-full overflow-hidden bg-gray-900`}>
             <div 
               className={`h-full ${economy?.stabilityIndex && economy.stabilityIndex < 50 ? 'bg-red-600' : 'bg-green-600'}`} 
               style={{ width: `${economy?.stabilityIndex || 100}%` }}
             ></div>
          </div>
          <span className="text-xs text-gray-500">%{(economy?.stabilityIndex || 100)} Stabil</span>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          *Stabilite düştükçe polis baskını riski artar.
        </p>
      </div>
    </div>
  );
};