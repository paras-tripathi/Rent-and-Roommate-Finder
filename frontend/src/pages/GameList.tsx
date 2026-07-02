import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Users, Trophy, Play, CheckCircle, Search } from 'lucide-react';
import { GameState } from '../types';

interface GameListProps {
  onStartNew: () => void;
  onResumeGame: (gameId: string) => void;
}

export const GameList: React.FC<GameListProps> = ({ onStartNew, onResumeGame }) => {
  const [games, setGames] = useState<GameState[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'FINISHED'>('ALL');

  useEffect(() => {
    // Load games from localStorage
    const saved = localStorage.getItem('chutes_ladders_games');
    if (saved) {
      try {
        setGames(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading games', e);
      }
    }
  }, []);

  const deleteGame = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = games.filter(g => g.id !== id);
    setGames(updated);
    localStorage.setItem('chutes_ladders_games', JSON.stringify(updated));
  };

  const filteredGames = games.filter(game => {
    const matchesSearch = game.players.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = 
      filter === 'ALL' || 
      (filter === 'ACTIVE' && !game.winner) || 
      (filter === 'FINISHED' && game.winner);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
            Game Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Create a new adventure or resume your current match
          </p>
        </div>
        <button
          onClick={onStartNew}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="h-5 w-5" />
          <span>New Game</span>
        </button>
      </div>

      {/* Filters and search */}
      <div className="glassmorphism p-4 mb-8 rounded-2xl border border-white/10 dark:border-gray-800/40 bg-white/40 dark:bg-slate-900/40 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by player name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-slate-950/60 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {(['ALL', 'ACTIVE', 'FINISHED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                filter === tab
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border border-gray-200/50 dark:border-gray-800/50 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              {tab === 'ALL' && 'All Games'}
              {tab === 'ACTIVE' && 'Active'}
              {tab === 'FINISHED' && 'Completed'}
            </button>
          ))}
        </div>
      </div>

      {/* Games List Grid */}
      {filteredGames.length === 0 ? (
        <div className="text-center py-20 glassmorphism rounded-3xl border border-dashed border-gray-300 dark:border-gray-800">
          <div className="inline-flex p-4 bg-indigo-500/10 rounded-full text-indigo-500 mb-4 animate-bounce">
            <Trophy className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-gray-200">No Games Found</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
            {searchTerm || filter !== 'ALL'
              ? 'No games match your filters. Try modifying your search term or select another category.'
              : 'Create a new game with your friends to start playing!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              onClick={() => onResumeGame(game.id)}
              className="group cursor-pointer glassmorphism p-6 rounded-2xl border border-white/10 dark:border-gray-800/50 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between"
            >
              {/* Decorative gradient light */}
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-indigo-500/10 blur-xl group-hover:bg-indigo-500/20 transition-all" />

              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    game.winner 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  }`}>
                    {game.winner ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                        <span>In Progress</span>
                      </>
                    )}
                  </span>
                  
                  <button
                    onClick={(e) => deleteGame(game.id, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-200"
                    title="Delete Game"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-indigo-500 transition-colors line-clamp-1 mb-2">
                  Match {game.id.substring(0, 6).toUpperCase()}
                </h3>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Users className="h-4 w-4 shrink-0" />
                    <span>{game.players.length} Players</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>{new Date(game.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {game.players.map((p, idx) => (
                    <div
                      key={p.id}
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center font-bold text-xs text-white"
                      style={{ backgroundColor: p.color }}
                      title={p.name}
                    >
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>

                <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-500 group-hover:translate-x-1 transition-transform">
                  {game.winner ? 'View Results' : 'Resume'} <Play className="h-3.5 w-3.5 fill-current" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
