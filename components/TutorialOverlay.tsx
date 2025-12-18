import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { feedbackService } from '../services/feedbackService';

export const TutorialOverlay: React.FC = () => {
  const { state } = useGame();
  const player = state.player;
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (player && player.level === 1 && player.stats.totalBattles === 0 && !localStorage.getItem('tutorial_completed')) {
      setIsVisible(true);
    }
  }, [player]);

  const handleNext = () => {
    feedbackService.playClick();
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      setIsVisible(false);
      localStorage.setItem('tutorial_completed', 'true');
    }
  };

  if (!isVisible) return null;

  const steps = [
    {
      title: "HOŞ GELDİN ÇAYLAK",
      text: "Cyberpunk İstanbul'un yeraltı dünyasına hoş geldin. Burası Horoz İmparatorluğu. Kuralları biz koyarız.",
      target: "center"
    },
    {
      title: "HOROZUNU EĞİT",
      text: "Ana ekrandan horozunu besleyebilir ve antrenman yaptırabilirsin. Güçlü bir horoz, saygı demektir.",
      target: "bottom-left" // Hinting at bottom buttons
    },
    {
      title: "SAVAŞ VE KAZAN",
      text: "Şehir haritasından bölgelere gidip rakiplerle savaş. Tecrübe ve ganimet kazan.",
      target: "bottom" // Hinting at nav
    },
    {
      title: "EKONOMİYİ TAKİP ET",
      text: "Sistem stabilitesi önemli. Reklam izleyerek enerji dalgalanmalarından korunabilirsin. Bol şans!",
      target: "center"
    }
  ];

  return (
    <div className="fixed inset-0 z-[70] bg-black bg-opacity-80 flex flex-col items-center justify-center p-8 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-purple-600 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_30px_rgba(147,51,234,0.3)] relative">
        <div className="absolute -top-6 -left-6 text-6xl rotate-[-10deg]">
           🐓
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-4 font-rajdhani mt-4 border-b border-gray-800 pb-2">
          {steps[step].title}
        </h3>
        
        <p className="text-gray-300 mb-8 leading-relaxed">
          {steps[step].text}
        </p>

        <div className="flex justify-between items-center">
          <div className="flex space-x-1">
            {steps.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-purple-500' : 'bg-gray-700'}`}></div>
            ))}
          </div>
          
          <button 
            onClick={handleNext}
            className="bg-white text-black font-bold px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {step === steps.length - 1 ? 'BAŞLA' : 'İLERİ'}
          </button>
        </div>
      </div>
    </div>
  );
};