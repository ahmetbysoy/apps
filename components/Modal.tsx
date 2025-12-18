import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-purple-900 rounded-xl w-full max-w-sm shadow-[0_0_50px_rgba(88,28,135,0.4)] relative overflow-hidden transform transition-all scale-100">
        {/* Header */}
        <div className="bg-neutral-800 p-4 flex justify-between items-center border-b border-gray-800">
          <h3 className="text-xl font-bold text-white font-rajdhani tracking-wide">{title}</h3>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-700 text-gray-400 hover:text-white hover:bg-red-900 transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};