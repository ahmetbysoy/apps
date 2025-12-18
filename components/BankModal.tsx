import React from 'react';
import { Modal } from './Modal';
import { Loan, Player } from '../types';

interface BankModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  onTakeLoan: (amount: number, interest: number, durationHours: number) => void;
  onRepayLoan: (loanId: string) => void;
}

export const BankModal: React.FC<BankModalProps> = ({ isOpen, onClose, player, onTakeLoan, onRepayLoan }) => {
  if (!player) return null;

  const activeLoans = player.loans.filter(l => !l.isPaid);
  const hasActiveLoan = activeLoans.length > 0;

  const loanOffers = [
    { id: 1, name: 'Hızlı Nakit', amount: 1000, interest: 20, duration: 1, minLevel: 1 },
    { id: 2, name: 'Büyük Oynayanlar', amount: 5000, interest: 15, duration: 3, minLevel: 3 },
    { id: 3, name: 'İmparator Kredisi', amount: 20000, interest: 10, duration: 24, minLevel: 5 },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="TEFECİ CEMİL">
      <div className="space-y-6">
        {/* Active Loan Status */}
        {hasActiveLoan ? (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 animate-pulse">
            <h4 className="text-red-400 font-bold mb-2 flex items-center">
              <span className="mr-2">⚠️</span> ÖDENMEMİŞ BORÇ
            </h4>
            {activeLoans.map(loan => {
              const repaymentAmount = Math.floor(loan.amount * (1 + loan.interestRate / 100));
              const hoursLeft = Math.max(0, Math.ceil((loan.dueDate - Date.now()) / (1000 * 60 * 60)));
              
              return (
                <div key={loan.id} className="text-sm">
                  <div className="flex justify-between mb-1 text-gray-300">
                     <span>Ana Para:</span>
                     <span>{loan.amount} G</span>
                  </div>
                  <div className="flex justify-between mb-1 text-gray-300">
                     <span>Ödenecek:</span>
                     <span className="text-red-400 font-bold">{repaymentAmount} G</span>
                  </div>
                  <div className="flex justify-between mb-3 text-gray-300">
                     <span>Süre:</span>
                     <span>{hoursLeft} Saat Kaldı</span>
                  </div>
                  <button 
                    onClick={() => onRepayLoan(loan.id)}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded"
                  >
                    BORCU KAPAT ({repaymentAmount} G)
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-neutral-800 p-4 rounded-lg text-center text-gray-400 text-sm">
            Şu an aktif borcun yok. Temiz iş.
          </div>
        )}

        {/* Loan Offers */}
        {!hasActiveLoan && (
          <div>
            <h4 className="text-yellow-500 font-bold mb-3 uppercase tracking-wider text-sm border-b border-gray-800 pb-1">
              Kredi Teklifleri
            </h4>
            <div className="space-y-3">
              {loanOffers.map(offer => {
                const isLocked = player.level < offer.minLevel;
                const repayAmount = Math.floor(offer.amount * (1 + offer.interest / 100));
                
                return (
                  <button
                    key={offer.id}
                    disabled={isLocked}
                    onClick={() => onTakeLoan(offer.amount, offer.interest, offer.duration)}
                    className={`
                      w-full border rounded-lg p-3 text-left transition-all
                      ${isLocked 
                        ? 'border-gray-800 bg-neutral-900 opacity-50 cursor-not-allowed' 
                        : 'border-neutral-700 bg-neutral-800 hover:border-yellow-500 hover:bg-neutral-750'
                      }
                    `}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-bold ${isLocked ? 'text-gray-500' : 'text-white'}`}>{offer.name}</span>
                      {isLocked && <span className="text-[10px] text-red-500 border border-red-900 px-1 rounded">LVL {offer.minLevel}</span>}
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Al: <b className="text-green-500">{offer.amount} G</b></span>
                      <span>Öde: <b className="text-red-400">{repayAmount} G</b></span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">
                      Faiz: %{offer.interest} • Süre: {offer.duration} Saat
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        <p className="text-[10px] text-gray-600 text-center italic">
          "Zamanında ödemezsen, horozlarını alırım." - Cemil
        </p>
      </div>
    </Modal>
  );
};