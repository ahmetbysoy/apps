import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { RoosterAvatar } from '../components/RoosterAvatar';
import { feedbackService } from '../services/feedbackService';

// Physics & Gameplay Constants
const GRAVITY = 0.5; 
const AIR_RESISTANCE = 0.98; // Hava direnci
const SLING_POWER = 0.22; // Fırlatma gücü artırıldı
const MAX_DRAG_DIST = 150; // Çekme mesafesi artırıldı
const TRAJECTORY_STEPS = 20; // Daha uzun çizgi
const COLLISION_RADIUS = 70; // Vuruş alanı genişletildi

interface PhysicsState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isFlying: boolean;
  isDragging: boolean;
  anchorX: number;
  anchorY: number;
}

interface Point {
  x: number;
  y: number;
}

export const CombatScreen: React.FC = () => {
  const { state, resolveCombat, closeCombat } = useGame();
  const { activeCombat } = state;
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Game State
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);
  const [gameOver, setGameOver] = useState<'WIN' | 'LOSE' | null>(null);
  
  // Visual State
  const [roosterPos, setRoosterPos] = useState({ x: 0, y: 0, rotation: 0 });
  const [enemyPosState, setEnemyPosState] = useState({ x: 0, y: 0 });
  const [trajectory, setTrajectory] = useState<Point[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Mutable State
  const physics = useRef<PhysicsState>({
    x: 0, y: 0, vx: 0, vy: 0, 
    isFlying: false, isDragging: false,
    anchorX: 0, anchorY: 0
  });

  const enemyPos = useRef({ x: 0, y: 100, vx: 3, direction: 1 });
  const dragStartRef = useRef({ x: 0, y: 0 });

  if (!activeCombat || !activeCombat.playerRooster || !activeCombat.enemyRooster) return null;

  const maxPlayerHP = activeCombat.playerRooster.stats.health;
  const maxEnemyHP = activeCombat.enemyRooster.stats.health;

  useEffect(() => {
    if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        
        const anchorX = width / 2;
        const anchorY = height - 160;

        physics.current.anchorX = anchorX;
        physics.current.anchorY = anchorY;
        physics.current.x = anchorX;
        physics.current.y = anchorY;

        setRoosterPos({ x: anchorX, y: anchorY, rotation: 0 });
        
        enemyPos.current.x = width / 2;
        enemyPos.current.y = 100; 
        setEnemyPosState({ x: width / 2, y: 100 });

        setPlayerHP(maxPlayerHP);
        setEnemyHP(maxEnemyHP);
    }
    feedbackService.playBattleStart();
  }, []);

  // --- PHYSICS ENGINE CORE ---
  // Bu fonksiyon hem gerçek hareketi hem de tahmin çizgisini hesaplar.
  // Böylece çizgi ile gerçek hareket arasında fark olmaz.
  const simulateNextStep = (x: number, y: number, vx: number, vy: number) => {
      let nextVx = vx;
      let nextVy = vy;

      // Gravity
      nextVy += GRAVITY;

      // Air Resistance
      nextVx *= AIR_RESISTANCE;
      nextVy *= AIR_RESISTANCE;

      // Position
      const nextX = x + nextVx;
      const nextY = y + nextVy;

      return { x: nextX, y: nextY, vx: nextVx, vy: nextVy };
  };

  // Main Loop
  useEffect(() => {
    if (gameOver) return;

    let animationFrameId: number;

    const loop = () => {
        if (!containerRef.current) return;
        const { width, height } = containerRef.current.getBoundingClientRect();
        
        // --- ENEMY AI ---
        enemyPos.current.x += enemyPos.current.vx * enemyPos.current.direction;
        if (enemyPos.current.x > width - 50) enemyPos.current.direction = -1;
        if (enemyPos.current.x < 50) enemyPos.current.direction = 1;

        // --- PLAYER PHYSICS ---
        if (physics.current.isFlying) {
            // Calculate next step using the shared logic
            const nextState = simulateNextStep(
                physics.current.x, 
                physics.current.y, 
                physics.current.vx, 
                physics.current.vy
            );

            physics.current.x = nextState.x;
            physics.current.y = nextState.y;
            physics.current.vx = nextState.vx;
            physics.current.vy = nextState.vy;

            // Rotation
            const angle = Math.atan2(physics.current.vy, physics.current.vx) * (180 / Math.PI);
            
            // Wall Bounces
            if (physics.current.x < 20 || physics.current.x > width - 20) {
                physics.current.vx *= -0.7;
                physics.current.x = Math.max(20, Math.min(width - 20, physics.current.x));
            }
            if (physics.current.y < 20) {
                physics.current.vy *= -0.7;
                physics.current.y = 20;
            }

            // Miss
            if (physics.current.y > height + 50) {
                handleMiss();
            }

            // Hit Detection
            const dx = physics.current.x - enemyPos.current.x;
            const dy = physics.current.y - enemyPos.current.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < COLLISION_RADIUS) {
                handleHit();
            }

            setRoosterPos({ 
                x: physics.current.x, 
                y: physics.current.y, 
                rotation: angle + 90
            });
        }

        setEnemyPosState({ x: enemyPos.current.x, y: enemyPos.current.y });
        animationFrameId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameOver]);

  // --- LOGIC ---

  const calculateTrajectory = (startX: number, startY: number, vX: number, vY: number) => {
      const points: Point[] = [];
      let simX = startX;
      let simY = startY;
      let simVX = vX;
      let simVY = vY;

      // Simüle ederken gerçek fizik motorunun aynısını kullanıyoruz
      for (let i = 0; i < TRAJECTORY_STEPS; i++) {
          const next = simulateNextStep(simX, simY, simVX, simVY);
          simX = next.x;
          simY = next.y;
          simVX = next.vx;
          simVY = next.vy;
          
          points.push({ x: simX, y: simY });
          
          if (simY > physics.current.anchorY + 50) break;
      }
      setTrajectory(points);
  };

  const handleHit = () => {
      physics.current.isFlying = false;
      feedbackService.playHit();
      
      const dmg = Math.floor(activeCombat.playerRooster.stats.attack * (1 + Math.random() * 0.5));
      setEnemyHP(prev => {
          const next = Math.max(0, prev - dmg);
          if (next <= 0) handleWin();
          return next;
      });
      
      // Hit effect (bounce back slightly to show impact)
      setRoosterPos(prev => ({ ...prev, y: prev.y + 20 }));
      setTimeout(resetPosition, 200);
  };

  const handleMiss = () => {
      physics.current.isFlying = false;
      feedbackService.playError();
      const dmg = Math.floor(activeCombat.enemyRooster.stats.attack * 0.8);
      setPlayerHP(prev => {
          const next = Math.max(0, prev - dmg);
          if (next <= 0) handleLose();
          return next;
      });
      resetPosition();
  };

  const resetPosition = () => {
      physics.current.isFlying = false;
      physics.current.vx = 0;
      physics.current.vy = 0;
      physics.current.x = physics.current.anchorX;
      physics.current.y = physics.current.anchorY;
      setRoosterPos({ x: physics.current.anchorX, y: physics.current.anchorY, rotation: 0 });
      setTrajectory([]);
  };

  const handleWin = () => {
      setGameOver('WIN');
      feedbackService.playSuccess();
      resolveCombat(activeCombat.playerRooster.id, { 
          gold: activeCombat.enemyRooster.level * 100, 
          xp: activeCombat.enemyRooster.level * 50 
      });
  };

  const handleLose = () => {
      setGameOver('LOSE');
      resolveCombat(activeCombat.enemyRooster.id, { gold: 10, xp: 5 });
  };

  // --- INPUT HANDLERS ---

  const onDragStart = (cx: number, cy: number) => {
      if (physics.current.isFlying || gameOver) return;
      
      physics.current.isDragging = true;
      setIsDragging(true);
      dragStartRef.current = { x: cx, y: cy };
  };

  const onDragMove = (cx: number, cy: number) => {
      if (!physics.current.isDragging) return;

      const deltaX = cx - dragStartRef.current.x;
      const deltaY = cy - dragStartRef.current.y;

      const dist = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
      const angle = Math.atan2(deltaY, deltaX);
      
      const clampedDist = Math.min(dist, MAX_DRAG_DIST);
      
      // Calculate visual position relative to anchor
      const roosterX = physics.current.anchorX + (Math.cos(angle) * clampedDist);
      const roosterY = physics.current.anchorY + (Math.sin(angle) * clampedDist);

      physics.current.x = roosterX;
      physics.current.y = roosterY;

      setRoosterPos({ 
          x: roosterX, 
          y: roosterY, 
          rotation: (angle * 180 / Math.PI) - 90 
      });

      // Launch Vector
      const vX = -Math.cos(angle) * clampedDist * SLING_POWER;
      const vY = -Math.sin(angle) * clampedDist * SLING_POWER;

      calculateTrajectory(roosterX, roosterY, vX, vY);
  };

  const onDragEnd = () => {
      if (!physics.current.isDragging) return;
      
      physics.current.isDragging = false;
      setIsDragging(false);
      setTrajectory([]);

      const dx = physics.current.x - physics.current.anchorX;
      const dy = physics.current.y - physics.current.anchorY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist > 20) {
          physics.current.vx = -dx * SLING_POWER;
          physics.current.vy = -dy * SLING_POWER;
          physics.current.isFlying = true;
          feedbackService.playClick();
      } else {
          resetPosition();
      }
  };

  return (
    <div 
        ref={containerRef}
        className="fixed inset-0 z-50 bg-neutral-900 flex flex-col font-rajdhani touch-none select-none overflow-hidden"
        onMouseDown={(e) => onDragStart(e.clientX, e.clientY)}
        onMouseMove={(e) => onDragMove(e.clientX, e.clientY)}
        onMouseUp={onDragEnd}
        onTouchStart={(e) => onDragStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => onDragMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={onDragEnd}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800 via-black to-black"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      {/* --- UI HEADER --- */}
      <div className="absolute top-0 left-0 w-full p-4 z-20 flex justify-between pointer-events-none">
          <div className="w-1/3">
             <div className="flex items-center space-x-2 mb-1">
                <div className="w-8 h-8 rounded-full border border-blue-500 overflow-hidden bg-black">
                     <RoosterAvatar seed={activeCombat.playerRooster.visualSeed} size={32} />
                </div>
                <div className="text-xs text-blue-400 font-bold">{activeCombat.playerRooster.name}</div>
             </div>
             <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-blue-900/50">
                <div className="h-full bg-blue-500 transition-all duration-300 shadow-[0_0_10px_#3b82f6]" style={{ width: `${(playerHP / maxPlayerHP) * 100}%` }}></div>
             </div>
          </div>

          <div className="text-2xl font-black text-white/20 italic">VS</div>

          <div className="w-1/3 text-right">
             <div className="flex items-center justify-end space-x-2 mb-1">
                <div className="text-xs text-red-500 font-bold">{activeCombat.enemyRooster.name}</div>
                <div className="w-8 h-8 rounded-full border border-red-500 overflow-hidden bg-black">
                     <RoosterAvatar seed={activeCombat.enemyRooster.visualSeed} size={32} />
                </div>
             </div>
             <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-red-900/50">
                <div className="h-full bg-red-600 transition-all duration-300 shadow-[0_0_10px_#dc2626]" style={{ width: `${(enemyHP / maxEnemyHP) * 100}%` }}></div>
             </div>
          </div>
      </div>

      {/* --- GAME SCENE --- */}
      
      <svg className="absolute inset-0 pointer-events-none z-10 overflow-visible">
          {trajectory.map((p, i) => (
              <circle 
                key={i} 
                cx={p.x} 
                cy={p.y} 
                r={4} 
                fill="white" 
                opacity={Math.max(0.1, 1 - (i / TRAJECTORY_STEPS))}
              />
          ))}
          
          {physics.current && containerRef.current && (
             <>
                <line 
                  x1={physics.current.anchorX - 40} 
                  y1={physics.current.anchorY} 
                  x2={roosterPos.x - 10} 
                  y2={roosterPos.y} 
                  stroke="#5b21b6" 
                  strokeWidth={isDragging ? 4 : 2}
                  strokeLinecap="round"
                />
                <line 
                  x1={physics.current.anchorX + 40} 
                  y1={physics.current.anchorY} 
                  x2={roosterPos.x + 10} 
                  y2={roosterPos.y} 
                  stroke="#5b21b6" 
                  strokeWidth={isDragging ? 4 : 2}
                  strokeLinecap="round"
                />
             </>
          )}
      </svg>

      <div 
        className="absolute w-24 h-24 -ml-12 -mt-12 z-10 pointer-events-none transition-transform"
        style={{ transform: `translate(${enemyPosState.x}px, ${enemyPosState.y}px)` }}
      >
          <div className="relative animate-bounce">
             <div className="absolute -inset-4 bg-red-600/20 blur-xl rounded-full"></div>
             <RoosterAvatar seed={activeCombat.enemyRooster.visualSeed} size={96} />
             {/* Hitbox Debug Visual (Can be removed) */}
             {/* <div className="absolute inset-0 border border-green-500 rounded-full opacity-30" style={{ width: COLLISION_RADIUS*2, height: COLLISION_RADIUS*2, left: -COLLISION_RADIUS+48, top: -COLLISION_RADIUS+48 }}></div> */}
          </div>
      </div>

      <div 
        className="absolute z-0 pointer-events-none"
        style={{ 
            left: (physics.current?.anchorX || 0) - 50, 
            top: (physics.current?.anchorY || 0),
            width: 100,
            height: 10
        }}
      >
          <div className="absolute left-0 bottom-0 w-4 h-32 bg-gradient-to-t from-gray-900 to-gray-600 rounded-full border border-gray-700"></div>
          <div className="absolute right-0 bottom-0 w-4 h-32 bg-gradient-to-t from-gray-900 to-gray-600 rounded-full border border-gray-700"></div>
      </div>

      <div 
        className={`absolute w-20 h-20 -ml-10 -mt-10 z-20 pointer-events-none ${physics.current.isFlying ? 'animate-spin' : ''}`}
        style={{ 
            transform: `translate(${roosterPos.x}px, ${roosterPos.y}px) rotate(${roosterPos.rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.1s' 
        }}
      >
          <div className="relative">
             {!physics.current.isFlying && (
                 <div className="absolute -inset-4 bg-purple-500/20 blur-xl rounded-full"></div>
             )}
             <RoosterAvatar seed={activeCombat.playerRooster.visualSeed} size={80} />
          </div>
      </div>

      {!physics.current.isFlying && !isDragging && !gameOver && (
          <div className="absolute bottom-20 w-full text-center pointer-events-none animate-pulse z-30">
              <div className="inline-block bg-black/60 px-4 py-2 rounded-full border border-purple-500/50 backdrop-blur-sm">
                  <p className="text-purple-300 text-xs font-bold tracking-widest">ÇEK VE FIRLAT</p>
              </div>
          </div>
      )}

      {gameOver && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
              <div className="relative mb-8">
                  <div className={`absolute inset-0 blur-3xl opacity-50 ${gameOver === 'WIN' ? 'bg-yellow-500' : 'bg-red-900'}`}></div>
                  <h1 className={`relative text-7xl font-black tracking-tighter italic ${gameOver === 'WIN' ? 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600' : 'text-gray-500'}`}>
                      {gameOver === 'WIN' ? 'ZAFER!' : 'YENİLGİ'}
                  </h1>
              </div>
              
              {gameOver === 'WIN' && (
                  <div className="flex space-x-4 mb-8">
                      <div className="text-center">
                          <div className="text-yellow-500 font-bold text-xl">+{activeCombat.enemyRooster.level * 100} G</div>
                          <div className="text-gray-500 text-xs">GANİMET</div>
                      </div>
                      <div className="w-px bg-gray-800"></div>
                      <div className="text-center">
                          <div className="text-purple-400 font-bold text-xl">+{activeCombat.enemyRooster.level * 50} XP</div>
                          <div className="text-gray-500 text-xs">TECRÜBE</div>
                      </div>
                  </div>
              )}

              <button 
                onClick={closeCombat}
                className="group relative px-8 py-4 bg-white text-black font-bold rounded-xl overflow-hidden hover:scale-105 transition-transform"
              >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative z-10 group-hover:text-white transition-colors">ŞEHRE DÖN</span>
              </button>
          </div>
      )}

    </div>
  );
};