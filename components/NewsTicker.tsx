import React, { useEffect, useState } from 'react';
import { ContentGenerator } from '../services/ContentGenerator';

export const NewsTicker: React.FC = () => {
  const [news, setNews] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Generate initial news batch
    const items = Array.from({ length: 5 }, () => ContentGenerator.generateNewsHeadline());
    setNews(items);

    // Rotate news every 5 seconds
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (news.length === 0) return null;

  return (
    <div className="bg-black border-y border-gray-800 h-8 flex items-center overflow-hidden relative">
      <div className="bg-red-900 px-2 h-full flex items-center text-[10px] font-bold text-white z-10 shrink-0">
        SON DAKİKA
      </div>
      <div className="flex-1 overflow-hidden relative h-full">
        <div 
            key={currentIndex} 
            className="absolute inset-0 flex items-center px-3 text-xs text-gray-400 whitespace-nowrap animate-slide-up"
        >
            {news[currentIndex]}
        </div>
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent z-10"></div>
    </div>
  );
};