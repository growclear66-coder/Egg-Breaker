import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Egg } from './Egg';
import { Leaderboard } from './Leaderboard';
import { Button } from './ui/Button';
import { getLevelConfig, saveProgress } from '../services/gameService';
import { UserProfile, LevelConfig } from '../types';

export const GameDashboard: React.FC = () => {
  const { profile, logout, refreshProfile } = useAuth();
  // Local state for immediate responsiveness
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(profile);
  const [currentHp, setCurrentHp] = useState(0);
  const [levelConfig, setLevelConfig] = useState<LevelConfig | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (profile) {
      setLocalProfile(profile);
      const config = getLevelConfig(profile.level);
      setLevelConfig(config);
      // If we are just loading, HP starts full. 
      // NOTE: In a complex app, we'd save current HP too. For this, we reset HP on reload or keep it client side.
      // We will simply start full for each session/level for simplicity of the demo requirements.
      setCurrentHp(config.hp);
    }
  }, [profile]);

  const handleEggClick = () => {
    if (!localProfile || !levelConfig || currentHp <= 0) return;

    const newHp = currentHp - 1;
    const newTotalClicks = localProfile.totalClicks + 1;
    let newLevel = localProfile.level;
    let newConfig = levelConfig;
    let newCurrentHp = newHp;

    // Check Level Up
    if (newHp <= 0) {
      newLevel++;
      newConfig = getLevelConfig(newLevel);
      newCurrentHp = newConfig.hp;
      // Play level up sound/effect here (omitted for strict code/no assets)
    }

    const updatedProfile = {
      ...localProfile,
      level: newLevel,
      clicks: 0, // Reset clicks for level? Or keep cumulative?
      totalClicks: newTotalClicks
    };

    // Update Local State
    setLocalProfile(updatedProfile);
    setCurrentHp(newCurrentHp);
    setLevelConfig(newConfig);

    // Debounced Save to Backend
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveProgress(updatedProfile);
    }, 1000);
  };

  if (!localProfile || !levelConfig) return <div className="p-10 text-center">Loading Game Data...</div>;

  const hpPercentage = (currentHp / levelConfig.hp) * 100;

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center">
      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-600 flex items-center justify-center font-bold text-white">
            {localProfile.level}
          </div>
          <div>
            <h1 className="font-bold text-white">Level {localProfile.level}</h1>
            <p className="text-xs text-slate-400">{levelConfig.name}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowLeaderboard(true)} className="!px-3">
             🏆
          </Button>
          <Button variant="ghost" onClick={() => logout()}>
            Logout
          </Button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-lg px-4 gap-8">
        
        {/* Progress Bar */}
        <div className="w-full space-y-2">
          <div className="flex justify-between text-sm text-slate-400 font-mono">
            <span>HP: {currentHp} / {levelConfig.hp}</span>
            <span>Total Clicks: {localProfile.totalClicks}</span>
          </div>
          <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-yellow-500 transition-all duration-200"
              style={{ width: `${hpPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* The Egg */}
        <div className="py-8">
          <Egg 
            onClick={handleEggClick} 
            hp={currentHp} 
            maxHp={levelConfig.hp} 
            config={levelConfig} 
          />
        </div>

        {/* Instructions */}
        <div className="text-center text-slate-500 text-sm max-w-xs">
          <p>Tap the egg to break it.</p>
          <p>Each level requires more clicks.</p>
        </div>

      </main>

      <Leaderboard isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
    </div>
  );
};