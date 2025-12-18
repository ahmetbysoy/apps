import React from 'react';

interface BottomNavProps {
  activeTab: 'home' | 'city' | 'market' | 'bazaar' | 'tasks';
  setActiveTab: (tab: 'home' | 'city' | 'market' | 'bazaar' | 'tasks') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', label: 'KÜMES', icon: '🏠' },
    { id: 'city', label: 'ŞEHİR', icon: '🏙️' },
    { id: 'market', label: 'PAZAR', icon: '🛒' },
    { id: 'bazaar', label: 'YERALTI', icon: '🎲' },
    { id: 'tasks', label: 'GÖREV', icon: '📋' },
  ];

  return (
    <div className="h-20 bg-black border-t border-gray-800 flex justify-around items-center px-2 pb-safe shrink-0 z-10 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
      {navItems.map((item) => (
        <button 
          key={item.id}
          onClick={() => setActiveTab(item.id as any)}
          className={`
            flex flex-col items-center justify-center w-full h-full transition-all duration-200 active:scale-95
            ${activeTab === item.id 
              ? 'text-purple-500 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]' 
              : 'text-gray-600 hover:text-gray-400'
            }
          `}
        >
          <span className="text-2xl mb-1">{item.icon}</span>
          <span className="text-[9px] font-bold tracking-widest">{item.label}</span>
          {activeTab === item.id && (
            <div className="absolute bottom-1 w-1 h-1 bg-purple-500 rounded-full"></div>
          )}
        </button>
      ))}
    </div>
  );
};