import React, { useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { fetchLeaderboard } from '../services/gameService';

export const Leaderboard: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [players, setPlayers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchLeaderboard()
        .then(data => setPlayers(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-bold text-center mb-6 text-yellow-500">🏆 Top Breakers</h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <span className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></span>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {players.length === 0 ? (
              <p className="text-center text-slate-400 py-4">No data available yet.</p>
            ) : (
              players.map((p, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${index === 0 ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-slate-800 border-slate-700'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full font-bold text-sm ${index === 0 ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-300'}`}>
                      {index + 1}
                    </span>
                    <span className="font-medium text-white truncate max-w-[150px]">{p.displayName || 'Anonymous'}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-yellow-400 font-bold text-sm">Lvl {p.level}</span>
                    <span className="text-slate-500 text-xs">{p.totalClicks} clicks</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};