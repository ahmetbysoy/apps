import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { RoosterAvatar } from '../components/RoosterAvatar';
import { useGlobalEconomy } from '../context/GlobalEconomyContext';
import { TrainingModal } from '../components/TrainingModal';
import { FeedingModal } from '../components/FeedingModal';
import { InventoryModal } from '../components/InventoryModal';
import { CoopModal } from '../components/CoopModal';
import { HatchingModal } from '../components/HatchingModal';
import { BreedingModal } from '../components/BreedingModal';
import { useToast } from '../context/ToastContext';
import { NewsTicker } from '../components/NewsTicker';
import { feedbackService } from '../services/feedbackService';
import { Rooster } from '../types';

export const HomeScreen: React.FC = () => {
  const { state, watchAd, trainRooster, feedRooster, hatchEgg, setActiveRooster, breedRoosters } = useGame();
  const { economy } = useGlobalEconomy();
  const { addToast } = useToast();
  const player = state.player;
  const roosters = player?.roosters || [];
  const activeRooster = roosters[0]; // Logic: Index 0 is always the active one

  // Modal States
  const [isTrainingOpen, setIsTrainingOpen] = useState(false);
  const [isFeedingOpen, setIsFeedingOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isCoopOpen, setIsCoopOpen] = useState(false);
  const [isBreedingOpen, setIsBreedingOpen] = useState(false);
  
  // Hatching State
  const [isHatchingOpen, setIsHatchingOpen] = useState(false);
  const [hatchedRooster, setHatchedRooster] = useState<Rooster | null>(null);

  const handleTrain = async (type: 'strength' | 'speed' | 'endurance') => {
    if (!activeRooster) return;
    const result = await trainRooster(activeRooster.id, type);
    if (result.success) {
        addToast(result.message, 'success');
        setIsTrainingOpen(false);
    } else {
        addToast(result.message, 'error');
    }
  };

  const handleFeed = async (itemId: string) => {
    if (!activeRooster) return;
    const result = await feedRooster(activeRooster.id, itemId);
    if (result.success) {
        addToast(result.message, 'success');
        setIsFeedingOpen(false);
    } else {
        addToast(result.message, 'warning');
    }
  };

  const handleHatch = async (itemId: string, rarity: any) => {
      // Close inventory first
      setIsInventoryOpen(false);
      
      const result = await hatchEgg(itemId, rarity);
      if (result.success && result.rooster) {
          setHatchedRooster(result.rooster);
          setIsHatchingOpen(true);
      } else {
          addToast(result.message, 'error');
      }
  };

  const handleBreed = async (id1: string, id2: string) => {
      const result = await breedRoosters(id1, id2);
      if (result.success) {
          addToast(result.message, 'success');
          setIsBreedingOpen(false);
      } else {
          addToast(result.message, 'error');
      }
  };

  const handleSwitchRooster = (id: string) => {
      setActiveRooster(id);
      setIsCoopOpen(false);
      addToast('Lider horoz değiştirildi!', 'info');
  };

  const cycleRooster = (direction: 'prev' | 'next') => {
      if (roosters.length <= 1) return;
      
      // In the current context logic, setActiveRooster moves the selected one to index 0.
      // So to "cycle", we just pick the next one in the array and make it active.
      
      let nextIndex = 0;
      if (direction === 'next') {
          // Since index 0 is active, next in carousel logic is index 1.
          // If we want to simulate a circle, we grab index 1.
          nextIndex = 1; 
      } else {
          // Prev logic: take the last one
          nextIndex = roosters.length - 1;
      }

      setActiveRooster(roosters[nextIndex].id);
      feedbackService.playClick();
  };

  const openModal = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
      feedbackService.playClick();
      setter(true);
  }

  if (!player) return <div className="p-8 text-center text-gray-500 animate-pulse">Sistem yükleniyor...</div>;
  
  if (!activeRooster) {
    return (
        <div className="p-8 text-center flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl text-red-500 font-bold">HOROZUN YOK!</h2>
            <p className="text-gray-400 mt-2 mb-6">Pazara gidip bir yumurta bulmalısın.</p>
            <button 
                onClick={() => openModal(setIsInventoryOpen)}
                className="bg-purple-600 text-white px-6 py-3 rounded-full font-bold animate-bounce"
            >
                ÇANTANI KONTROL ET
            </button>
            <InventoryModal
                isOpen={isInventoryOpen}
                onClose={() => setIsInventoryOpen(false)}
                inventory={player.inventory}
                onHatch={handleHatch}
            />
            <HatchingModal 
                isOpen={isHatchingOpen}
                onClose={() => setIsHatchingOpen(false)}
                rooster={hatchedRooster}
            />
        </div>
    );
  }

  const StatBox = ({ label, value, color }: { label: string, value: number, color: string }) => {
    const colors: {[key: string]: string} = {
        red: 'text-red-500 border-red-900/30 bg-red-900/10',
        blue: 'text-blue-500 border-blue-900/30 bg-blue-900/10',
        green: 'text-green-500 border-green-900/30 bg-green-900/10',
        yellow: 'text-yellow-500 border-yellow-900/30 bg-yellow-900/10',
    };
    
    return (
        <div className={`rounded-lg p-2 flex flex-col items-center border ${colors[color] || colors.red}`}>
            <span className={`font-bold text-lg ${color === 'yellow' ? 'text-yellow-500' : ''} ${color === 'red' ? 'text-red-500' : ''} ${color === 'blue' ? 'text-blue-500' : ''} ${color === 'green' ? 'text-green-500' : ''}`}>{value}</span>
            <span className="text-[9px] text-gray-500 tracking-wider font-bold">{label}</span>
        </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-neutral-900 via-neutral-900 to-black overflow-y-auto pb-24">
      
      <NewsTicker />

      <div className="p-4 flex flex-col items-center">
        {/* Top Controls */}
        <div className="w-full flex justify-between items-center mb-4">
            <div className="flex space-x-2">
                <button 
                    onClick={() => openModal(setIsCoopOpen)}
                    className="bg-neutral-800 border border-neutral-700 px-3 py-2 rounded-lg text-xs font-bold text-gray-300 hover:text-white hover:border-purple-500 flex items-center space-x-2 active:scale-95 transition-transform"
                >
                    <span>🏠 KÜMES ({player.roosters.length})</span>
                </button>
                <button 
                    onClick={() => openModal(setIsBreedingOpen)}
                    className="bg-pink-900/30 border border-pink-900/50 px-3 py-2 rounded-lg text-xs font-bold text-pink-300 hover:text-white hover:border-pink-500 flex items-center space-x-2 active:scale-95 transition-transform"
                >
                    <span>❤️</span>
                </button>
            </div>
            <button 
                onClick={() => openModal(setIsInventoryOpen)}
                className="bg-neutral-800 border border-neutral-700 px-3 py-2 rounded-lg text-xs font-bold text-gray-300 hover:text-white hover:border-purple-500 flex items-center space-x-2 active:scale-95 transition-transform"
            >
                <span>🎒 ÇANTA</span>
            </button>
        </div>

        {/* Active Rooster Carousel */}
        <div className="relative w-full flex items-center justify-center py-2">
            {/* Left Arrow */}
            {roosters.length > 1 && (
                <button 
                    onClick={() => cycleRooster('prev')}
                    className="absolute left-0 z-20 p-2 text-gray-600 hover:text-purple-400 active:scale-90 transition-all text-4xl"
                >
                    ‹
                </button>
            )}

            {/* Rooster Visuals */}
            <div className="flex flex-col items-center relative z-10" onClick={() => openModal(setIsCoopOpen)}>
                <div className="relative group cursor-pointer transition-transform duration-300">
                    {/* Aura Effect based on Rank */}
                    <div className="absolute inset-0 bg-purple-600 blur-[60px] opacity-20 rounded-full animate-pulse group-hover:opacity-30 transition-opacity"></div>
                    <RoosterAvatar seed={activeRooster.visualSeed} size={220} className="relative z-10 transition-transform group-hover:scale-105 duration-300" />
                    
                    {/* Level Badge */}
                    <div className="absolute bottom-0 right-4 z-20 bg-black border border-purple-500 rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">{activeRooster.level}</span>
                    </div>
                </div>
                
                <h2 className="text-4xl font-bold mt-4 text-white tracking-wide uppercase font-rajdhani drop-shadow-lg text-center leading-none">
                    {activeRooster.name}
                </h2>
                
                <div className="flex items-center space-x-2 mt-2">
                    <span className="text-purple-400 text-[10px] font-bold tracking-[0.2em] uppercase border border-purple-900 bg-purple-900/20 px-2 py-0.5 rounded">
                        {activeRooster.breed}
                    </span>
                    <span className="text-gray-500 text-[10px]">•</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border bg-opacity-20 ${
                         activeRooster.rank === 'LEGENDARY' ? 'text-yellow-500 border-yellow-500 bg-yellow-900' :
                         activeRooster.rank === 'EPIC' ? 'text-purple-500 border-purple-500 bg-purple-900' :
                         activeRooster.rank === 'RARE' ? 'text-blue-400 border-blue-500 bg-blue-900' :
                         'text-gray-400 border-gray-600 bg-gray-800'
                    }`}>
                        {activeRooster.rank}
                    </span>
                </div>
            </div>

            {/* Right Arrow */}
            {roosters.length > 1 && (
                <button 
                    onClick={() => cycleRooster('next')}
                    className="absolute right-0 z-20 p-2 text-gray-600 hover:text-purple-400 active:scale-90 transition-all text-4xl"
                >
                    ›
                </button>
            )}
        </div>

        {/* Energy Bar */}
        <div className="w-full max-w-[200px] mt-4">
            <div className="flex justify-between text-[9px] text-gray-500 mb-1 uppercase tracking-wider font-bold">
                <span>Enerji</span>
                <span>{activeRooster.energy}/100</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all" style={{ width: `${activeRooster.energy}%` }}></div>
            </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mt-6 w-full max-w-sm">
            <StatBox label="GÜÇ" value={activeRooster.stats.attack} color="red" />
            <StatBox label="HIZ" value={activeRooster.stats.speed} color="blue" />
            <StatBox label="CAN" value={activeRooster.stats.health} color="green" />
            <StatBox label="DEF" value={activeRooster.stats.defense} color="yellow" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mt-6 w-full max-w-sm">
            <button 
                className="bg-neutral-800 border border-neutral-700 p-4 rounded-xl flex flex-col items-center justify-center hover:border-purple-500 hover:bg-neutral-750 transition-all active:scale-95 group relative overflow-hidden"
                onClick={() => openModal(setIsTrainingOpen)}
            >
                <div className="absolute inset-0 bg-purple-500 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">💪</span>
                <span className="font-bold text-sm text-gray-300 group-hover:text-white">ANTRENMAN</span>
            </button>
            <button 
                className="bg-neutral-800 border border-neutral-700 p-4 rounded-xl flex flex-col items-center justify-center hover:border-purple-500 hover:bg-neutral-750 transition-all active:scale-95 group relative overflow-hidden"
                onClick={() => openModal(setIsFeedingOpen)}
            >
                <div className="absolute inset-0 bg-purple-500 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🍗</span>
                <span className="font-bold text-sm text-gray-300 group-hover:text-white">BESLE</span>
            </button>
        </div>

        {/* Ad / Shield Promo */}
        <div className="mt-6 w-full max-w-sm bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl p-[1px] shadow-lg">
            <div className="bg-black bg-opacity-80 backdrop-blur-md rounded-[11px] p-4 flex justify-between items-center h-full">
            <div>
                <h3 className="font-bold text-white flex items-center text-sm">
                    <span className="mr-2">🛡️</span> SİSTEM KORUMASI
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Reklam izle, enerji dalgalanmalarından korun.</p>
            </div>
            <button 
                onClick={() => { watchAd(); addToast('Reklam izleniyor...', 'info'); }} 
                className="bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg text-xs hover:bg-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)] transition-all active:scale-95 whitespace-nowrap"
            >
                İZLE (+3%)
            </button>
            </div>
        </div>
      </div>

      {/* Modals */}
      <TrainingModal 
        isOpen={isTrainingOpen} 
        onClose={() => setIsTrainingOpen(false)} 
        rooster={activeRooster}
        onTrain={handleTrain}
      />

      <FeedingModal
        isOpen={isFeedingOpen}
        onClose={() => setIsFeedingOpen(false)}
        rooster={activeRooster}
        inventory={player.inventory}
        onFeed={handleFeed}
      />

      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        inventory={player.inventory}
        onHatch={handleHatch}
      />

      <CoopModal
        isOpen={isCoopOpen}
        onClose={() => setIsCoopOpen(false)}
        roosters={player.roosters}
        activeRoosterId={activeRooster.id}
        onSelectActive={handleSwitchRooster}
      />
      
      <BreedingModal
        isOpen={isBreedingOpen}
        onClose={() => setIsBreedingOpen(false)}
        roosters={player.roosters}
        onBreed={handleBreed}
      />

      <HatchingModal 
        isOpen={isHatchingOpen}
        onClose={() => setIsHatchingOpen(false)}
        rooster={hatchedRooster}
      />

    </div>
  );
};