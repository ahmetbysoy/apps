import React, { useState } from 'react';
import { GlobalEconomyProvider } from './context/GlobalEconomyContext';
import { GameProvider, useGame } from './context/GameContext';
import { ToastProvider } from './context/ToastContext';
import { CityScreen } from './screens/CityScreen';
import { MarketScreen } from './screens/MarketScreen';
import { BazaarScreen } from './screens/BazaarScreen';
import { TasksScreen } from './screens/TasksScreen';
import { HomeScreen } from './screens/HomeScreen';
import { CombatScreen } from './screens/CombatScreen';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ToastContainer } from './components/ToastContainer';
import { TutorialOverlay } from './components/TutorialOverlay';
import { ParticleBackground } from './components/ParticleBackground';

const SplashScreen: React.FC = () => (
  <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 animate-fade-in">
    <div className="w-32 h-32 relative mb-8">
      <div className="absolute inset-0 border-4 border-purple-600 rounded-full animate-ping opacity-20"></div>
      <div className="absolute inset-2 border-4 border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center text-4xl">🐓</div>
    </div>
    <h1 className="text-4xl font-bold font-rajdhani tracking-widest text-white mb-2">HOROZ</h1>
    <h2 className="text-xl font-bold font-rajdhani tracking-[0.5em] text-purple-500">İMPARATORLUĞU</h2>
    <p className="text-gray-600 text-xs mt-8 animate-pulse">SUNUCU BAĞLANTISI KURULUYOR...</p>
  </div>
);

const VisualOverlay: React.FC = () => (
  <>
    <div className="scanlines"></div>
    <div className="vignette"></div>
    <div className="crt-flicker"></div>
  </>
);

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'city' | 'market' | 'bazaar' | 'tasks'>('home');
  const { state } = useGame();

  if (state.isLoading) {
    return <SplashScreen />;
  }

  return (
    <div className="w-full h-screen bg-neutral-900 text-white overflow-hidden flex flex-col font-rajdhani relative">
      <VisualOverlay />
      <ParticleBackground />
      <ToastContainer />
      <TutorialOverlay />
      
      {state.activeCombat && <CombatScreen />}

      <Header />
      <div className="flex-1 overflow-hidden relative z-10">
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'city' && <CityScreen />}
        {activeTab === 'market' && <MarketScreen />}
        {activeTab === 'bazaar' && <BazaarScreen />}
        {activeTab === 'tasks' && <TasksScreen />}
      </div>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <GlobalEconomyProvider>
      <GameProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </GameProvider>
    </GlobalEconomyProvider>
  );
};