import React, { useState } from 'react';
import { UserPlus, Trash2, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';
import { Player } from '../types';

interface GameSetupProps {
  onStart: (players: Omit<Player, 'position' | 'hasTurn'>[]) => void;
  onCancel: () => void;
}

const PRESET_COLORS = [
  '#4f46e5', // Indigo
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#ef4444', // Red
  '#f97316', // Orange
];

const FUN_NAMES = ['Aero', 'Nova', 'Shadow', 'Phoenix', 'Pixel', 'Echo', 'Quantum', 'Nebula'];

export const GameSetup: React.FC<GameSetupProps> = ({ onStart, onCancel }) => {
  const [players, setPlayers] = useState<Array<{ name: string; color: string }>>([
    { name: 'Player 1', color: PRESET_COLORS[0] },
    { name: 'Player 2', color: PRESET_COLORS[1] },
  ]);

  const addPlayer = () => {
    if (players.length >= 6) return;
    const nextColor = PRESET_COLORS[players.length % PRESET_COLORS.length];
    const defaultName = `Player ${players.length + 1}`;
    setPlayers([...players, { name: defaultName, color: nextColor }]);
  };

  const removePlayer = (index: number) => {
    if (players.length <= 2) return;
    const filtered = players.filter((_, idx) => idx !== index);
    setPlayers(filtered);
  };

  const updatePlayerName = (index: number, name: string) => {
    const updated = [...players];
    updated[index].name = name;
    setPlayers(updated);
  };

  const updatePlayerColor = (index: number, color: string) => {
    const updated = [...players];
    updated[index].color = color;
    setPlayers(updated);
  };

  const randomizeName = (index: number) => {
    const randomName = FUN_NAMES[Math.floor(Math.random() * FUN_NAMES.length)] + ' ' + Math.floor(Math.random() * 100);
    updatePlayerName(index, randomName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // basic validation
    const sanitized = players.map(p => ({
      name: p.name.trim() || 'Player',
      color: p.color
    }));
    onStart(sanitized);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white">
          Configure Players
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Add players, choose their colors, and get ready to roll!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glassmorphism p-8 rounded-3xl border border-white/10 dark:border-gray-800/50 bg-white/40 dark:bg-slate-900/40 shadow-xl">
        <div className="space-y-6">
          {players.map((player, idx) => (
            <div 
              key={idx} 
              className="p-5 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-slate-950/40 flex flex-col md:flex-row md:items-center gap-4 transition-all hover:border-indigo-500/30"
            >
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Player {idx + 1} Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={player.name}
                    onChange={(e) => updatePlayerName(idx, e.target.value)}
                    placeholder="Enter player name"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => randomizeName(idx)}
                    className="p-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 rounded-xl transition-all"
                    title="Generate Random Name"
                  >
                    <Sparkles className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Token Color
                </label>
                <div className="flex gap-2 flex-wrap max-w-[200px]">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => updatePlayerColor(idx, color)}
                      className={`w-7 h-7 rounded-full transition-transform transform active:scale-95 ${
                        player.color === color 
                          ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 scale-110' 
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {players.length > 2 && (
                <button
                  type="button"
                  onClick={() => removePlayer(idx)}
                  className="mt-6 md:mt-0 p-3 text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all self-end md:self-center"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <button
            type="button"
            onClick={addPlayer}
            disabled={players.length >= 6}
            className="w-full sm:w-auto px-6 py-3 border border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/5 disabled:opacity-50 disabled:pointer-events-none rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="h-5 w-5" />
            <span>Add Player ({players.length}/6)</span>
          </button>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onCancel}
              className="w-1/2 sm:w-auto px-6 py-3 text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              <span>Start Game</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
