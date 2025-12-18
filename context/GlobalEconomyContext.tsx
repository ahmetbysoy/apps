import React, { createContext, useContext, useEffect, useState } from 'react';
import { GlobalEconomy } from '../types';
import { apiService } from '../services/apiService';
import { ECONOMY_CONFIG } from '../constants';

interface GlobalEconomyContextType {
  economy: GlobalEconomy | null;
  isLoading: boolean;
  error: string | null;
  refreshEconomy: () => Promise<void>;
  watchAdGlobalEffect: () => Promise<void>;
}

const GlobalEconomyContext = createContext<GlobalEconomyContextType | undefined>(undefined);

export const GlobalEconomyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [economy, setEconomy] = useState<GlobalEconomy | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEconomy = async () => {
    try {
      const data = await apiService.getGlobalEconomy();
      setEconomy(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch global economy', err);
      setError('Sunucu bağlantısı kurulamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEconomy();
    // Poll every 30 seconds for updates
    const interval = setInterval(fetchEconomy, 30000);
    return () => clearInterval(interval);
  }, []);

  const refreshEconomy = async () => {
    setIsLoading(true);
    await fetchEconomy();
  };

  const watchAdGlobalEffect = async () => {
    // Optimistic update
    if (economy) {
      setEconomy(prev => prev ? ({
        ...prev,
        totalAdViewsToday: prev.totalAdViewsToday + 1
      }) : null);
    }
  };

  return (
    <GlobalEconomyContext.Provider value={{ economy, isLoading, error, refreshEconomy, watchAdGlobalEffect }}>
      {children}
    </GlobalEconomyContext.Provider>
  );
};

export const useGlobalEconomy = () => {
  const context = useContext(GlobalEconomyContext);
  if (context === undefined) {
    throw new Error('useGlobalEconomy must be used within a GlobalEconomyProvider');
  }
  return context;
};