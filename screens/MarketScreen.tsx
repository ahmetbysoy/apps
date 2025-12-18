import React, { useState } from 'react';
import { ITEMS } from '../constants';
import { useGame } from '../context/GameContext';
import { Item, ItemType } from '../types';
import { BankModal } from '../components/BankModal';
import { useToast } from '../context/ToastContext';
import { useGlobalEconomy } from '../context/GlobalEconomyContext';

export const MarketScreen: React.FC = () => {
  const { state, dispatch, takeLoan, repayLoan } = useGame();
  const { economy } = useGlobalEconomy();
  const { addToast } = useToast();
  const playerGold = state.player?.gold || 0;
  const [isBankOpen, setIsBankOpen] = useState(false);

  const stability = economy?.stabilityIndex || 100;
  const isBlackMarketOpen = stability < 50;

  const handleBuy = (item: Item) => {
    if (playerGold >= item.price) {
      dispatch({ type: 'SPEND_GOLD', payload: item.price });
      dispatch({ type: 'ADD_ITEM', payload: item });
      addToast(`${item.name} satın alındı!`, 'success');
    } else {
      addToast('Yetersiz bakiye!', 'error');
    }
  };

  const handleTakeLoan = async (amount: number, interest: number, duration: number) => {
      const result = await takeLoan(amount, interest, duration);
      if (result.success) {
          addToast(result.message, 'success');
          setIsBankOpen(false);
      } else {
          addToast(result.message, 'error');
      }
  };

  const handleRepayLoan = async (loanId: string) => {
      const result = await repayLoan(loanId);
      if (result.success) {
          addToast(result.message, 'success');
      } else {
          addToast(result.message, 'error');
      }
  };

  const renderItemCard = (item: Item, isIllegal: boolean = false) => (
    <div key={item.id} className={`bg-neutral-800 border ${isIllegal ? 'border-red-600 bg-red-900/10' : 'border-neutral-700'} rounded-lg p-4 flex flex-col justify-between hover:border-yellow-500 transition-colors`}>
      <div>
        <div className="flex justify-between items-start mb-2">
          <h4 className={`font-bold ${isIllegal ? 'text-red-500' : 'text-white'}`}>{item.name}</h4>
          <span className={`text-xs px-1.5 py-0.5 rounded border ${
            item.rarity === 'COMMON' ? 'border-gray-500 text-gray-400' :
            item.rarity === 'RARE' ? 'border-blue-500 text-blue-400' :
            item.rarity === 'EPIC' ? 'border-purple-500 text-purple-400' :
            'border-yellow-500 text-yellow-500'
          }`}>
            {item.rarity}
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-3">{item.description}</p>
        <div className="text-xs text-green-400 mb-4">
          Etki: {item.effect ? `+${item.effect.value} ${item.effect.stat?.toUpperCase()}` : 'Özel'}
        </div>
      </div>
      
      <button
        onClick={() => handleBuy(item)}
        disabled={playerGold < item.price}
        className={`w-full py-2 rounded font-bold text-sm flex justify-between px-4 ${
          playerGold >= item.price 
            ? (isIllegal ? 'bg-red-700 text-white hover:bg-red-600' : 'bg-yellow-600 text-black hover:bg-yellow-500')
            : 'bg-neutral-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        <span>{isIllegal ? 'KAÇAK AL' : 'SATIN AL'}</span>
        <span>{item.price} G</span>
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-black bg-opacity-95 p-4 overflow-y-auto pb-24">
      <header className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-3xl font-bold text-yellow-500 font-rajdhani">KARAKÖY PAZARI</h2>
            <div className="text-xs text-gray-500">Güvenli alışverişin adresi</div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
            <div className="bg-neutral-800 px-4 py-1 rounded-full border border-yellow-600">
                <span className="text-yellow-500 font-bold">{playerGold} G</span>
            </div>
            <button 
                onClick={() => setIsBankOpen(true)}
                className="bg-red-900/50 border border-red-600 px-3 py-1 rounded text-xs text-red-300 font-bold hover:bg-red-900 transition-colors flex items-center"
            >
                <span className="mr-1">🏦</span> TEFECİ
            </button>
        </div>
      </header>

      <div className="space-y-6">
        {/* Black Market Section */}
        {isBlackMarketOpen && (
          <section className="animate-fade-in border-2 border-red-600 border-dashed p-4 rounded-xl bg-black relative overflow-hidden">
             <div className="absolute inset-0 bg-red-600 opacity-5 animate-pulse pointer-events-none"></div>
             <div className="flex items-center justify-between mb-4">
                 <h3 className="text-xl font-bold text-red-500 tracking-widest glitch-text">KARABORSA</h3>
                 <span className="text-xs bg-red-600 text-black font-bold px-2 py-1 rounded animate-bounce">AÇIK</span>
             </div>
             <p className="text-xs text-red-400 mb-4">Sistem dengesiz. Yasaklı ürünler erişilebilir.</p>
             <div className="grid grid-cols-1 gap-3">
                {ITEMS.filter(i => i.type === ItemType.ILLEGAL).map(item => renderItemCard(item, true))}
             </div>
          </section>
        )}

        <section>
          <h3 className="text-lg font-bold text-purple-400 mb-3 border-b border-gray-800 pb-1">YUMURTALAR</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             {ITEMS.filter(i => i.type === ItemType.EGG).map(i => renderItemCard(i))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold text-white mb-3 border-b border-gray-800 pb-1">TÜKETİLEBİLİR</h3>
          <div className="grid grid-cols-2 gap-3">
            {ITEMS.filter(i => i.type === ItemType.CONSUMABLE).map(i => renderItemCard(i))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold text-white mb-3 border-b border-gray-800 pb-1">EKİPMANLAR</h3>
          <div className="grid grid-cols-2 gap-3">
            {ITEMS.filter(i => i.type === ItemType.EQUIPMENT).map(i => renderItemCard(i))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold text-white mb-3 border-b border-gray-800 pb-1">GÜÇLENDİRİCİLER</h3>
          <div className="grid grid-cols-2 gap-3">
            {ITEMS.filter(i => i.type === ItemType.BOOSTER).map(i => renderItemCard(i))}
          </div>
        </section>
      </div>

      <BankModal 
        isOpen={isBankOpen}
        onClose={() => setIsBankOpen(false)}
        player={state.player}
        onTakeLoan={handleTakeLoan}
        onRepayLoan={handleRepayLoan}
      />
    </div>
  );
};