import React, { useState } from 'react';
import { DISTRICTS } from '../constants';
import { useGame } from '../context/GameContext';
import { useToast } from '../context/ToastContext';
import { feedbackService } from '../services/feedbackService';
import { ScannerModal } from '../components/ScannerModal';

export const CityScreen: React.FC = () => {
  const { state, enterCombat, scavengeArea, scanEnvironment } = useGame();
  const { addToast } = useToast();
  const playerLevel = state.player?.level || 1;
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScavenging, setIsScavenging] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleEnterCombat = async () => {
    if (!selectedDistrict) return;
    
    setIsLoading(true);
    const result = await enterCombat(selectedDistrict);
    setIsLoading(false);
    
    if (result.success) {
        addToast("Arena'ya giriliyor...", 'success');
        setSelectedDistrict(null); // Close modal
    } else {
        addToast(result.message, 'error');
    }
  };

  const handleScavenge = async () => {
    setIsScavenging(true);
    feedbackService.playClick();

    if (!navigator.geolocation) {
        addToast('GPS desteklenmiyor.', 'error');
        setIsScavenging(false);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            const result = await scavengeArea(latitude, longitude);
            
            if (result.success) {
                addToast(result.message, 'success');
                if (result.reward) {
                    let msg = `+${result.reward.gold} Altın bulundu!`;
                    if (result.reward.item) msg += ` ve ${result.reward.item.name}!`;
                    addToast(msg, 'success');
                }
            } else {
                addToast(result.message, 'warning');
            }
            setIsScavenging(false);
        },
        (error) => {
            console.error(error);
            addToast('GPS izni gerekli!', 'error');
            setIsScavenging(false);
        }
    );
  };

  const handleScanComplete = async () => {
      setIsScannerOpen(false);
      const result = await scanEnvironment();
      if (result.success && result.reward) {
          addToast(result.message, 'success');
          addToast(`+${result.reward.gold}G ve +${result.reward.crystals} Kristal!`, 'success');
      } else {
          addToast(result.message, 'error');
      }
  };

  return (
    <div className="flex flex-col h-full bg-black bg-opacity-95 p-4 overflow-y-auto pb-24">
      <div className="flex flex-col mb-6 space-y-3">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 font-rajdhani tracking-wider">
            İSTANBUL BÖLGELERİ
        </h2>
        
        <div className="flex space-x-2">
            <button 
                onClick={handleScavenge}
                disabled={isScavenging}
                className={`
                    flex-1 py-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 border
                    ${isScavenging 
                        ? 'bg-neutral-800 text-gray-500 border-neutral-700' 
                        : 'bg-green-900/30 text-green-400 border-green-600 hover:bg-green-900/50'
                    }
                `}
            >
                <span>📡</span>
                <span>{isScavenging ? 'TARANIYOR...' : 'GPS TARA'}</span>
            </button>
            <button 
                onClick={() => { feedbackService.playClick(); setIsScannerOpen(true); }}
                className="flex-1 py-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 border bg-blue-900/30 text-blue-400 border-blue-600 hover:bg-blue-900/50"
            >
                <span>📷</span>
                <span>GÖRSEL TARA</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DISTRICTS.map((district) => {
          const isLocked = playerLevel * 2 < district.difficulty; // Example lock logic
          
          return (
            <div 
              key={district.id}
              onClick={() => !isLocked && setSelectedDistrict(district.id)}
              className={`
                relative p-4 border rounded-xl transition-all duration-300
                ${isLocked 
                  ? 'border-neutral-800 bg-neutral-900 opacity-60 grayscale cursor-not-allowed' 
                  : 'border-purple-900 bg-neutral-900 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer active:scale-95'
                }
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className={`text-xl font-bold ${isLocked ? 'text-neutral-500' : 'text-purple-400'}`}>
                  {district.name}
                </h3>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  district.difficulty > 10 ? 'bg-red-900 text-red-200' : 
                  district.difficulty > 5 ? 'bg-yellow-900 text-yellow-200' : 
                  'bg-green-900 text-green-200'
                }`}>
                  LVL {district.difficulty}
                </span>
              </div>

              <p className="text-sm text-gray-400 mb-3 leading-snug">
                {district.description}
              </p>

              <div className="flex items-center space-x-2 text-xs text-gray-500 border-t border-gray-800 pt-2">
                <span className="text-red-500 font-bold">BOSS:</span>
                <span>{isLocked ? '???' : district.boss}</span>
              </div>

              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-xl">
                  <span className="text-red-500 font-bold tracking-widest border border-red-500 px-3 py-1 rounded rotate-[-15deg] backdrop-blur-sm">
                    KİLİTLİ
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* District Modal */}
      {selectedDistrict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4 animate-fade-in">
          <div className="bg-neutral-900 border border-purple-500 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500 via-transparent to-transparent"></div>
            
            <h3 className="text-2xl font-bold text-white mb-2 relative z-10">
              {DISTRICTS.find(d => d.id === selectedDistrict)?.name}
            </h3>
            <p className="text-gray-400 mb-6 relative z-10">
              Bu bölgeye giriş yapmak üzeresin. Yerel çeteler ve <span className="text-red-500 font-bold">{DISTRICTS.find(d => d.id === selectedDistrict)?.boss}</span> seni bekliyor.
            </p>
            
            <div className="bg-neutral-800 p-3 rounded mb-6 relative z-10">
                 <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Giriş Ücreti:</span>
                    <span className="text-yellow-500 font-bold">10 Enerji</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Zorluk:</span>
                    <span className="text-purple-400 font-bold">Seviye {DISTRICTS.find(d => d.id === selectedDistrict)?.difficulty}</span>
                 </div>
            </div>

            <div className="flex space-x-3 relative z-10">
              <button 
                onClick={() => setSelectedDistrict(null)}
                className="flex-1 py-3 bg-neutral-800 rounded-lg text-gray-300 font-bold hover:bg-neutral-700"
                disabled={isLoading}
              >
                İptal
              </button>
              <button 
                onClick={handleEnterCombat}
                disabled={isLoading}
                className="flex-1 py-3 bg-purple-600 rounded-lg text-white font-bold hover:bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] flex items-center justify-center"
              >
                {isLoading ? (
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                    "SAVAŞA GİR"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AR Scanner Modal */}
      <ScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={handleScanComplete}
      />
    </div>
  );
};