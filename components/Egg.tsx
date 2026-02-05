import React, { useState } from 'react';
import { LevelConfig } from '../types';

interface EggProps {
  onClick: () => void;
  hp: number;
  maxHp: number;
  config: LevelConfig;
}

export const Egg: React.FC<EggProps> = ({ onClick, hp, maxHp, config }) => {
  const [isWobbling, setIsWobbling] = useState(false);
  const [clickScale, setClickScale] = useState(1);

  const handleClick = () => {
    // Visual feedback
    setClickScale(0.95);
    setTimeout(() => setClickScale(1), 50);
    
    setIsWobbling(true);
    setTimeout(() => setIsWobbling(false), 300); // Reset wobble

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(50);

    onClick();
  };

  const damagePercentage = 1 - (hp / maxHp);
  
  // Determine gradient based on skin
  const getSkinClass = () => {
    switch (config.skin) {
      case 'gold': return 'egg-gradient-gold shadow-yellow-500/50';
      case 'diamond': return 'egg-gradient-diamond shadow-blue-500/50';
      case 'obsidian': return 'bg-neutral-900 shadow-purple-500/50 border-2 border-purple-500';
      default: return 'egg-gradient shadow-orange-500/30';
    }
  };

  return (
    <div className="relative flex justify-center items-center py-10">
      <div 
        onClick={handleClick}
        className={`
          w-64 h-80 rounded-[50%/60%_60%_40%_40%] 
          cursor-pointer transition-transform duration-75 select-none relative overflow-hidden
          shadow-[0_20px_50px_-12px]
          ${getSkinClass()}
          ${isWobbling ? 'animate-shake' : ''}
        `}
        style={{
          transform: `scale(${clickScale})`,
        }}
      >
        {/* Shine effect */}
        <div className="absolute top-10 left-10 w-16 h-24 bg-white/20 rounded-full blur-xl transform -rotate-12 pointer-events-none"></div>

        {/* Cracks Overlay */}
        {damagePercentage > 0.3 && (
           <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 100 120">
             <path d="M50 20 L45 40 L55 50 L40 70" stroke="rgba(0,0,0,0.6)" strokeWidth="2" fill="none" />
           </svg>
        )}
        {damagePercentage > 0.6 && (
           <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50" viewBox="0 0 100 120">
             <path d="M50 20 L60 35 L40 60 L70 80 M30 50 L20 70" stroke="rgba(0,0,0,0.6)" strokeWidth="2" fill="none" />
           </svg>
        )}
        {damagePercentage > 0.8 && (
           <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60" viewBox="0 0 100 120">
             <path d="M50 10 L50 110 M20 40 L80 40 M30 80 L70 80" stroke="rgba(0,0,0,0.7)" strokeWidth="3" fill="none" />
           </svg>
        )}
      </div>

      {/* Floating Damage Text (Placeholder for simplicity, usually done with a manager) */}
    </div>
  );
};