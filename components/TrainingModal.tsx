import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Rooster } from '../types';
import { useShake } from '../hooks/useShake';
import { feedbackService } from '../services/feedbackService';

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooster: Rooster | undefined;
  onTrain: (type: 'strength' | 'speed' | 'endurance') => void;
}

export const TrainingModal: React.FC<TrainingModalProps> = ({ isOpen, onClose, rooster, onTrain }) => {
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [shakeProgress, setShakeProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingType, setTrainingType] = useState<'strength' | 'speed' | 'endurance'>('strength');
  
  const shakeIntensity = useShake(20);

  useEffect(() => {
    if (isOpen) {
      setMode('auto');
      setShakeProgress(0);
      setIsTraining(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (mode === 'manual' && isTraining && shakeIntensity > 20) {
      setShakeProgress(prev => {
        const next = prev + (shakeIntensity / 20);
        if (next >= 100) {
          handleManualComplete();
          return 100;
        }
        return next;
      });
      // Haptic feedback on strong shakes
      if (shakeIntensity > 50 && Math.random() > 0.8) {
        feedbackService.playHit();
      }
    }
  }, [shakeIntensity, mode, isTraining]);

  const handleManualComplete = () => {
    setIsTraining(false);
    feedbackService.playSuccess();
    onTrain(trainingType);
    setTimeout(() => {
        setShakeProgress(0);
    }, 1000);
  };

  const startManualTraining = (type: 'strength' | 'speed' | 'endurance') => {
    setTrainingType(type);
    setIsTraining(true);
    setShakeProgress(0);
    feedbackService.playClick();
  };

  if (!rooster) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`ANTRENMAN: ${rooster.name}`}>
      {/* Mode Switcher */}
      <div className="flex p-1 bg-neutral-800 rounded-lg mb-4">
        <button 
            onClick={() => { setMode('auto'); setIsTraining(false); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded ${mode === 'auto' ? 'bg-neutral-700 text-white' : 'text-gray-500'}`}
        >
            OTOMATİK (Altın)
        </button>
        <button 
            onClick={() => { setMode('manual'); setIsTraining(false); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded ${mode === 'manual' ? 'bg-purple-600 text-white' : 'text-gray-500'}`}
        >
            MANUEL (Salla)
        </button>
      </div>

      <div className="mb-4 text-center">
        <div className="text-sm text-gray-400">Mevcut Enerji</div>
        <div className="w-full bg-gray-800 h-2 rounded-full mt-1 overflow-hidden">
          <div className="bg-yellow-500 h-full" style={{ width: `${rooster.energy}%` }}></div>
        </div>
        <div className="text-xs text-yellow-500 font-bold mt-1">{rooster.energy}/100</div>
      </div>

      {mode === 'auto' ? (
        <div className="space-y-3">
            <TrainOption 
                type="strength" 
                label="Ağırlık Çalışması" 
                icon="🥊" 
                desc="+GÜÇ | -20 Enerji" 
                onClick={() => onTrain('strength')}
            />
            <TrainOption 
                type="speed" 
                label="Koşu Bandı" 
                icon="⚡" 
                desc="+HIZ | -20 Enerji" 
                onClick={() => onTrain('speed')}
            />
            <TrainOption 
                type="endurance" 
                label="Dayanıklılık" 
                icon="🛡️" 
                desc="+CAN | -20 Enerji" 
                onClick={() => onTrain('endurance')}
            />
        </div>
      ) : (
        <div className="text-center py-4">
            {!isTraining ? (
                <div className="space-y-4">
                    <p className="text-sm text-gray-400">
                        Antrenman türünü seç ve telefonu salla! 
                        <br/>
                        <span className="text-green-400 text-xs">Manuel eğitim Altın harcamaz.</span>
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => startManualTraining('strength')} className="p-3 bg-neutral-800 border border-neutral-700 rounded-lg hover:border-purple-500">
                            <div className="text-2xl mb-1">🥊</div>
                            <div className="text-[10px] font-bold">GÜÇ</div>
                        </button>
                        <button onClick={() => startManualTraining('speed')} className="p-3 bg-neutral-800 border border-neutral-700 rounded-lg hover:border-purple-500">
                            <div className="text-2xl mb-1">⚡</div>
                            <div className="text-[10px] font-bold">HIZ</div>
                        </button>
                        <button onClick={() => startManualTraining('endurance')} className="p-3 bg-neutral-800 border border-neutral-700 rounded-lg hover:border-purple-500">
                            <div className="text-2xl mb-1">🛡️</div>
                            <div className="text-[10px] font-bold">CAN</div>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="py-6 animate-pulse">
                    <div className="text-6xl mb-4 animate-shake">📱</div>
                    <h3 className="text-2xl font-bold text-purple-400 mb-2">SALLA!</h3>
                    <div className="w-full bg-gray-800 h-6 rounded-full overflow-hidden border border-gray-600">
                        <div 
                            className="bg-gradient-to-r from-purple-600 to-pink-500 h-full transition-all duration-100" 
                            style={{ width: `${shakeProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Daha hızlı salla!</p>
                    <button 
                        onClick={() => setIsTraining(false)}
                        className="mt-6 text-xs text-red-500 underline"
                    >
                        İptal
                    </button>
                </div>
            )}
        </div>
      )}
    </Modal>
  );
};

const TrainOption = ({ type, label, icon, desc, onClick }: { type: string, label: string, icon: string, desc: string, onClick: () => void }) => (
    <button 
      onClick={onClick}
      className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-purple-500 rounded-lg p-3 flex items-center justify-between transition-all group active:scale-95"
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-xl border border-gray-700">
          {icon}
        </div>
        <div className="text-left">
          <h4 className="font-bold text-white text-sm">{label}</h4>
          <p className="text-[10px] text-gray-500">{desc}</p>
        </div>
      </div>
      <div className="text-right">
        <span className="text-xs text-yellow-500 font-bold block">-50 G</span>
      </div>
    </button>
);