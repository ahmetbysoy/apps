import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from '../context/ToastContext';

export const TasksScreen: React.FC = () => {
  const { state, claimTaskReward } = useGame();
  const { addToast } = useToast();
  const tasks = state.player?.tasks || [];

  const handleClaim = async (taskId: string) => {
    const result = await claimTaskReward(taskId);
    if (result.success) {
        addToast(result.message, 'success');
    } else {
        addToast(result.message, 'error');
    }
  };

  return (
    <div className="flex flex-col h-full bg-black p-4 pb-24 overflow-y-auto">
      <header className="mb-6">
        <h2 className="text-3xl font-bold text-white font-rajdhani">GÖREVLER</h2>
        <p className="text-gray-400 text-sm">İmparatorluğunu büyütmek için günlük hedefleri tamamla.</p>
      </header>

      <div className="space-y-4">
        {tasks.map(task => (
          <div key={task.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between shadow-lg">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="bg-blue-900 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  {task.type === 'DAILY' ? 'GÜNLÜK' : 'BAŞARIM'}
                </span>
                <h3 className="font-bold text-gray-200">{task.title}</h3>
              </div>
              <p className="text-sm text-gray-500">{task.description}</p>
              
              <div className="mt-3 flex items-center space-x-4 text-xs font-mono text-gray-400">
                <div className="flex items-center text-yellow-500">
                  <span className="mr-1">●</span> {task.reward.gold} G
                </div>
                <div className="flex items-center text-cyan-400">
                  <span className="mr-1">◈</span> {task.reward.crystals} K
                </div>
                <div className="flex items-center text-purple-400">
                  <span className="mr-1">★</span> {task.reward.xp} XP
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Progress Bar */}
              <div className="flex-1 md:w-32">
                 <div className="flex justify-between text-xs text-gray-500 mb-1">
                   <span>İlerleme</span>
                   <span>{task.completed || task.claimed ? task.requirement.target : task.requirement.current}/{task.requirement.target}</span>
                 </div>
                 <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                   <div 
                      className="h-full bg-green-600 transition-all duration-500" 
                      style={{ width: task.completed || task.claimed ? '100%' : `${(task.requirement.current / task.requirement.target) * 100}%` }}
                   ></div>
                 </div>
              </div>

              <button
                onClick={() => handleClaim(task.id)}
                disabled={task.claimed} // Real implementation should also check completion status
                className={`
                  px-6 py-2 rounded-lg font-bold text-sm min-w-[100px] transition-all
                  ${task.claimed 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-green-700 hover:bg-green-600 text-white shadow-[0_0_10px_rgba(22,163,74,0.4)]'
                  }
                `}
              >
                {task.claimed ? 'ALINDI' : 'AL'}
              </button>
            </div>
          </div>
        ))}
        
        {tasks.length === 0 && (
            <div className="text-center text-gray-500 py-10">
                Henüz görev yok. Yarın tekrar gel.
            </div>
        )}
      </div>
    </div>
  );
};