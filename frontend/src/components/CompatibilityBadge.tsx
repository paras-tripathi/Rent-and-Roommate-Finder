import { Zap, Info } from 'lucide-react';
import { Compatibility } from '../types';
import { useState } from 'react';

interface Props {
  compatibility: Compatibility;
  size?: 'sm' | 'md' | 'lg';
}

export default function CompatibilityBadge({ compatibility }: Props) {
  const [showExplanation, setShowExplanation] = useState(false);
  const { score, explanation, isAiFallback } = compatibility;

  const getColor = () => {
    if (score >= 80) return { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
    if (score >= 60) return { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' };
    return { bar: 'bg-red-500', text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' };
  };

  const colors = getColor();

  return (
    <div className={`${colors.bg} rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap size={16} className={colors.text} />
          <span className="font-semibold text-sm text-dark-700 dark:text-dark-300">AI Compatibility</span>
          {isAiFallback && (
            <span className="badge badge-yellow text-xs">Rule-Based</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-bold text-xl ${colors.text}`}>{Math.round(score)}</span>
          <span className="text-dark-400 text-sm">/100</span>
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-dark-400 hover:text-dark-600 dark:hover:text-dark-300 transition-colors"
          >
            <Info size={16} />
          </button>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-2 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors.bar} rounded-full transition-all duration-1000`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className="mt-3 p-3 bg-white dark:bg-dark-800 rounded-lg border border-dark-200 dark:border-dark-700">
          <p className="text-sm text-dark-600 dark:text-dark-400 leading-relaxed">{explanation}</p>
        </div>
      )}
    </div>
  );
}
