import React from 'react';
import { useToast } from '../context/ToastContext';

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[60] flex flex-col items-center space-y-2 w-full max-w-xs pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            px-4 py-3 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)] 
            text-white text-sm font-bold flex items-center justify-center 
            border border-white/10 backdrop-blur-md pointer-events-auto
            animate-bounce
            ${toast.type === 'success' ? 'bg-green-900/90 text-green-200' : 
              toast.type === 'error' ? 'bg-red-900/90 text-red-200' : 
              toast.type === 'warning' ? 'bg-yellow-900/90 text-yellow-200' : 'bg-blue-900/90 text-blue-200'}
          `}
          style={{ minWidth: '200px' }}
        >
          {toast.type === 'success' && <span className="mr-2">✅</span>}
          {toast.type === 'error' && <span className="mr-2">❌</span>}
          {toast.type === 'warning' && <span className="mr-2">⚠️</span>}
          {toast.type === 'info' && <span className="mr-2">ℹ️</span>}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
};