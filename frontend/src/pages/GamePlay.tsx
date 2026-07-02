import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, AlertTriangle, ArrowRight, Dices, Award, Trophy, Info } from 'lucide-react';
import { GameState, Player, Card } from '../types';
import { DRAW_DECK } from '../constants/cards';
import confetti from 'canvas-confetti';

interface GamePlayProps {
  gameId: string;
  onBack: () => void;
}

// Chutes and Ladders definitions
const LADDERS: Record<number, number> = {
  4: 14,
  9: 31,
  20: 38,
  28: 84,
  40: 59,
  51: 67,
  63: 81,
  71: 91,
};

const CHUTES: Record<number, number> = {
  17: 7,
  54: 34,
  62: 18,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  99: 78,
};

// Card tiles
const CARD_TILES = new Set([7, 15, 23, 35, 44, 52, 68, 79, 88, 96]);

export const GamePlay: React.FC<GamePlayProps> = ({ gameId, onBack }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [rolling, setRolling] = useState(false);
  const [currentRoll, setCurrentRoll] = useState<number | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [cardPlayer, setCardPlayer] = useState<Player | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const boardRef = useRef<HTMLDivElement>(null);

  // Load game state
  useEffect(() => {
    const saved = localStorage.getItem('chutes_ladders_games');
    if (saved) {
      try {
        const list: GameState[] = JSON.parse(saved);
        const game = list.find(g => g.id === gameId);
        if (game) {
          setGameState(game);
          setLog([`Game loaded. It is ${game.players[game.currentPlayerIndex].name}'s turn.`]);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [gameId]);

  // Save game helper
  const saveGame = (updatedState: GameState) => {
    setGameState(updatedState);
    const saved = localStorage.getItem('chutes_ladders_games');
    if (saved) {
      try {
        const list: GameState[] = JSON.parse(saved);
        const updatedList = list.map(g => g.id === updatedState.id ? updatedState : g);
        localStorage.setItem('chutes_ladders_games', JSON.stringify(updatedList));
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (!gameState) {
    return <div className="text-center py-20 dark:text-white">Loading game...</div>;
  }

  const { players, currentPlayerIndex, winner } = gameState;
  const currentPlayer = players[currentPlayerIndex];

  // Board coordinate helper
  const getCoordinates = (cell: number) => {
    const zeroBased = cell - 1;
    const row = Math.floor(zeroBased / 10);
    const col = zeroBased % 10;
    const actualCol = row % 2 === 1 ? 9 - col : col;
    return {
      x: actualCol * 10 + 5, // Center offset
      y: (9 - row) * 10 + 5,
    };
  };

  const playSound = (type: 'roll' | 'ladder' | 'chute' | 'win' | 'card') => {
    if (!soundEnabled) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    if (type === 'roll') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    } else if (type === 'ladder') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.setValueAtTime(450, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(600, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    } else if (type === 'chute') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
    } else if (type === 'card') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    } else if (type === 'win') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(523.25, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3);
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
    }
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  };

  const handleRoll = () => {
    if (rolling || winner) return;

    setRolling(true);
    playSound('roll');

    // Simulate 3D-like rolling animation
    let rollInterval = setInterval(() => {
      setCurrentRoll(Math.floor(Math.random() * 6) + 1);
    }, 80);

    setTimeout(() => {
      clearInterval(rollInterval);
      const roll = Math.floor(Math.random() * 6) + 1;
      setCurrentRoll(roll);
      setRolling(false);
      applyMovement(roll);
    }, 800);
  };

  const applyMovement = (roll: number) => {
    let nextPos = currentPlayer.position + roll;
    let turnLog = [`${currentPlayer.name} rolled a ${roll}.`];
    let showCard = false;
    let drawnCard: Card | null = null;

    if (nextPos > 100) {
      // Must land exactly on 100 to win
      turnLog.push(`${currentPlayer.name} needs exact roll to win. Stays at ${currentPlayer.position}.`);
      nextPos = currentPlayer.position;
    } else if (nextPos === 100) {
      // Player won!
      playSound('win');
      confetti({ particleCount: 150, spread: 80 });
      
      const updatedPlayers = players.map((p, idx) => 
        idx === currentPlayerIndex ? { ...p, position: 100 } : p
      );
      saveGame({
        ...gameState,
        players: updatedPlayers,
        winner: currentPlayer.name,
      });
      setLog(prev => [turnLog.join(' '), ...prev]);
      return;
    } else {
      // Check ladders
      if (LADDERS[nextPos]) {
        const ladderTarget = LADDERS[nextPos];
        turnLog.push(`Climbed a ladder from ${nextPos} to ${ladderTarget}!`);
        nextPos = ladderTarget;
        playSound('ladder');
      } 
      // Check chutes
      else if (CHUTES[nextPos]) {
        const chuteTarget = CHUTES[nextPos];
        turnLog.push(`Oops! Slid down a chute from ${nextPos} to ${chuteTarget}.`);
        nextPos = chuteTarget;
        playSound('chute');
      }
      // Check card tile
      else if (CARD_TILES.has(nextPos)) {
        showCard = true;
        // Draw a random card
        const randomIndex = Math.floor(Math.random() * DRAW_DECK.length);
        drawnCard = DRAW_DECK[randomIndex];
        playSound('card');
      }
    }

    const updatedPlayers = players.map((p, idx) => 
      idx === currentPlayerIndex ? { ...p, position: nextPos } : p
    );

    if (showCard && drawnCard) {
      setCardPlayer({ ...currentPlayer, position: nextPos });
      setActiveCard(drawnCard);
      setLog(prev => [`${currentPlayer.name} landed on a Mystery Card!`, ...prev]);
    } else {
      // Next player's turn
      const nextIndex = (currentPlayerIndex + 1) % players.length;
      saveGame({
        ...gameState,
        players: updatedPlayers,
        currentPlayerIndex: nextIndex,
      });
      setLog(prev => [turnLog.join(' '), ...prev]);
    }
  };

  const handleResolveCard = () => {
    if (!activeCard || !cardPlayer) return;

    let targetPos = cardPlayer.position;
    let cardLog = `${cardPlayer.name} resolved card: "${activeCard.description}".`;

    switch (activeCard.actionType) {
      case 'MOVE_FORWARD':
        targetPos = Math.min(100, targetPos + activeCard.value);
        cardLog += ` Moved forward to ${targetPos}.`;
        break;
      case 'MOVE_BACKWARD':
        targetPos = Math.max(1, targetPos - activeCard.value);
        cardLog += ` Moved backward to ${targetPos}.`;
        break;
      case 'SWAP_PLACES':
        // Find player closest to lead, or another player
        const otherPlayers = players.filter((_, idx) => idx !== currentPlayerIndex);
        if (otherPlayers.length > 0) {
          // Swap with the player closest to 100
          const sorted = [...otherPlayers].sort((a, b) => b.position - a.position);
          const target = sorted[0];
          const oldTargetPos = target.position;
          
          const updatedPlayers = players.map((p, idx) => {
            if (idx === currentPlayerIndex) return { ...p, position: oldTargetPos };
            if (p.id === target.id) return { ...p, position: targetPos };
            return p;
          });

          cardLog += ` Swapped positions with ${target.name} (now at ${oldTargetPos}).`;
          const nextIndex = (currentPlayerIndex + 1) % players.length;
          saveGame({
            ...gameState,
            players: updatedPlayers,
            currentPlayerIndex: nextIndex,
          });
          setLog(prev => [cardLog, ...prev]);
          setActiveCard(null);
          setCardPlayer(null);
          return;
        }
        break;
      case 'GO_TO_START':
        targetPos = 1;
        cardLog += ` Returned to the starting space.`;
        break;
      case 'ROLL_AGAIN':
        cardLog += ` Gets another turn immediately!`;
        const updatedPlayersSelf = players.map((p, idx) => 
          idx === currentPlayerIndex ? { ...p, position: targetPos } : p
        );
        saveGame({
          ...gameState,
          players: updatedPlayersSelf,
        });
        setLog(prev => [cardLog, ...prev]);
        setActiveCard(null);
        setCardPlayer(null);
        return;
    }

    // Check ladders or chutes on landing spot again
    if (LADDERS[targetPos]) {
      const oldTarget = targetPos;
      targetPos = LADDERS[targetPos];
      cardLog += ` Clung onto a ladder and climbed to ${targetPos}!`;
    } else if (CHUTES[targetPos]) {
      const oldTarget = targetPos;
      targetPos = CHUTES[targetPos];
      cardLog += ` Slipped into a chute and fell to ${targetPos}!`;
    }

    const finalPlayers = players.map((p, idx) => 
      idx === currentPlayerIndex ? { ...p, position: targetPos } : p
    );

    const nextIndex = (currentPlayerIndex + 1) % players.length;
    saveGame({
      ...gameState,
      players: finalPlayers,
      currentPlayerIndex: nextIndex,
    });
    setLog(prev => [cardLog, ...prev]);
    setActiveCard(null);
    setCardPlayer(null);
  };

  const restartGame = () => {
    const resetPlayers = players.map(p => ({ ...p, position: 1 }));
    saveGame({
      ...gameState,
      players: resetPlayers,
      currentPlayerIndex: 0,
      winner: undefined,
    });
    setLog(['Game restarted! Roll dice to begin.']);
  };

  // Build grid of 100 cells
  const renderCells = () => {
    const cells = [];
    for (let r = 9; r >= 0; r--) {
      for (let c = 0; c < 10; c++) {
        const isRowOdd = r % 2 === 1;
        const colVal = isRowOdd ? 9 - c : c;
        const cellNum = r * 10 + colVal + 1;

        // Is it a special cell?
        const isLadderStart = !!LADDERS[cellNum];
        const isChuteStart = !!CHUTES[cellNum];
        const isCard = CARD_TILES.has(cellNum);

        // Find players on this cell
        const occupants = players.filter(p => p.position === cellNum);

        cells.push(
          <div
            key={cellNum}
            className={`relative border border-slate-200/50 dark:border-slate-800/50 flex flex-col items-center justify-center font-bold text-xs h-full w-full select-none transition-all duration-300 ${
              isCard ? 'bg-indigo-500/10 dark:bg-indigo-500/5' : ''
            }`}
          >
            <span className="absolute top-1 left-1 text-[9px] text-slate-400 dark:text-slate-600 font-normal">
              {cellNum}
            </span>

            {isCard && (
              <span className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-[10px] text-white shadow-md shadow-indigo-500/25 animate-pulse">
                ?
              </span>
            )}

            {/* Display occupants */}
            <div className="flex gap-0.5 justify-center flex-wrap max-w-full px-1">
              {occupants.map(p => (
                <div
                  key={p.id}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-lg border border-white dark:border-slate-900 transition-all duration-300 transform scale-110"
                  style={{ backgroundColor: p.color }}
                  title={p.name}
                >
                  {p.name.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Control panel */}
      <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
        {/* Game Stats & Players */}
        <div className="glassmorphism p-6 rounded-2xl border border-white/10 dark:border-gray-800/40 bg-white/40 dark:bg-slate-900/40">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Players</h2>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 bg-white/50 dark:bg-slate-950/40 rounded-xl hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 border border-gray-200/50 dark:border-gray-800/50"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-rose-500" />}
            </button>
          </div>

          <div className="space-y-3">
            {players.map((p, idx) => {
              const isCurrent = idx === currentPlayerIndex && !winner;
              return (
                <div
                  key={p.id}
                  className={`p-3.5 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                    isCurrent
                      ? 'border-indigo-500/50 bg-indigo-500/10 shadow-lg shadow-indigo-500/5 scale-102'
                      : 'border-transparent bg-white/40 dark:bg-slate-950/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded-full border border-white dark:border-slate-800 shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className={`font-semibold ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {p.name}
                    </span>
                  </div>
                  <span className="font-bold text-xs bg-slate-200/60 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-700 dark:text-slate-300">
                    Pos: {p.position}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dice Controller */}
        <div className="glassmorphism p-8 rounded-3xl border border-white/10 dark:border-gray-800/40 bg-white/40 dark:bg-slate-900/40 flex flex-col items-center justify-center text-center">
          {winner ? (
            <div className="space-y-4 py-4 w-full">
              <div className="inline-flex p-4 bg-emerald-500/10 rounded-full text-emerald-500 animate-bounce">
                <Trophy className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-850 dark:text-white">
                {winner} Wins!
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Congratulations, you completed the journey to 100!
              </p>
              <button
                onClick={restartGame}
                className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all"
              >
                <RotateCcw className="h-5 w-5" />
                <span>Play Again</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6 w-full">
              <div className="flex flex-col items-center">
                {/* 3D Dice Graphic */}
                <div 
                  className={`w-24 h-24 bg-gradient-to-tr from-white to-slate-100 dark:from-slate-800 dark:to-slate-950 rounded-2xl flex items-center justify-center text-5xl font-black text-indigo-600 dark:text-indigo-400 shadow-xl border border-slate-200 dark:border-slate-800 ${
                    rolling ? 'animate-spin' : ''
                  }`}
                >
                  {currentRoll || '?'}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                  Current Turn: <span className="font-bold text-slate-800 dark:text-white">{currentPlayer.name}</span>
                </p>
              </div>

              <button
                onClick={handleRoll}
                disabled={rolling}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white disabled:opacity-50 disabled:pointer-events-none rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all"
              >
                <Dices className="h-5 w-5" />
                <span>{rolling ? 'Rolling...' : 'Roll Dice'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Game Log */}
        <div className="glassmorphism p-6 rounded-2xl border border-white/10 dark:border-gray-800/40 bg-white/40 dark:bg-slate-900/40 flex-1 flex flex-col max-h-[220px]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Game Log
          </h3>
          <div className="overflow-y-auto space-y-2 flex-1 scrollbar-thin">
            {log.map((line, idx) => (
              <p key={idx} className="text-xs text-slate-600 dark:text-slate-300 border-l-2 border-indigo-500 pl-2">
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Board & SVG Overlay */}
      <div className="lg:col-span-8 order-1 lg:order-2 flex flex-col items-center">
        <div 
          ref={boardRef}
          className="relative w-full aspect-square max-w-[600px] bg-slate-50 dark:bg-slate-950/80 border-2 border-slate-350 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-10 grid-rows-10 p-1"
        >
          {renderCells()}

          {/* SVG Overlay to Draw Chutes and Ladders */}
          <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
            viewBox="0 0 100 100"
          >
            {/* Draw Ladders (Greenish Paths) */}
            {Object.entries(LADDERS).map(([start, end]) => {
              const startCoords = getCoordinates(Number(start));
              const endCoords = getCoordinates(end);
              return (
                <g key={`ladder-${start}`}>
                  <line
                    x1={startCoords.x}
                    y1={startCoords.y}
                    x2={endCoords.x}
                    y2={endCoords.y}
                    stroke="#10b981"
                    strokeWidth="1.2"
                    strokeDasharray="2 1"
                    className="opacity-70"
                  />
                  {/* Ladder Rungs */}
                  <circle cx={startCoords.x} cy={startCoords.y} r="1.5" fill="#10b981" />
                  <circle cx={endCoords.x} cy={endCoords.y} r="1.5" fill="#059669" />
                </g>
              );
            })}

            {/* Draw Chutes (Reddish Curves) */}
            {Object.entries(CHUTES).map(([start, end]) => {
              const startCoords = getCoordinates(Number(start));
              const endCoords = getCoordinates(end);
              // Calculate a quadratic bezier curve for the chute
              const midX = (startCoords.x + endCoords.x) / 2 + 5;
              const midY = (startCoords.y + endCoords.y) / 2 - 5;
              return (
                <g key={`chute-${start}`}>
                  <path
                    d={`M ${startCoords.x} ${startCoords.y} Q ${midX} ${midY} ${endCoords.x} ${endCoords.y}`}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="1.5"
                    className="opacity-80"
                  />
                  <polygon
                    points={`${endCoords.x},${endCoords.y} ${endCoords.x-1},${endCoords.y-3} ${endCoords.x+1},${endCoords.y-3}`}
                    fill="#be123c"
                    transform={`rotate(${Math.atan2(endCoords.y - midY, endCoords.x - midX) * 180 / Math.PI} ${endCoords.x} ${endCoords.y})`}
                  />
                  <circle cx={startCoords.x} cy={startCoords.y} r="1.5" fill="#f43f5e" />
                </g>
              );
            })}
          </svg>
        </div>

        <button
          onClick={onBack}
          className="mt-6 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Card Drawing Modal */}
      {activeCard && cardPlayer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-white/20 dark:border-gray-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            
            <div className="inline-flex p-4 bg-indigo-500/10 rounded-full text-indigo-500 mb-6 mt-2 animate-pulse">
              <Sparkles className="h-8 w-8" />
            </div>

            <h3 className="text-sm font-black uppercase tracking-wider text-indigo-500 mb-2">
              Mystery Card Drawn
            </h3>
            
            <p className="text-xl font-bold text-slate-800 dark:text-white mb-6 px-4">
              "{activeCard.description}"
            </p>

            <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl mb-8 border border-slate-100 dark:border-slate-800/40">
              <p className="text-sm text-slate-600 dark:text-slate-350">
                Action: <span className="font-semibold text-indigo-500">{activeCard.actionType.replace('_', ' ')}</span>
              </p>
            </div>

            <button
              onClick={handleResolveCard}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 transition-all transform hover:-translate-y-0.5"
            >
              <span>Apply & Continue</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
