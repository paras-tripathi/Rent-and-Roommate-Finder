import React from 'react';
import { Home, Trophy, Moon, Sun, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  currentView?: string;
  onNavigate?: (view: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView = 'list', onNavigate = () => {} }) => {
  const [darkMode, setDarkMode] = React.useState(true);
  const { user, logout } = useAuth();

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <nav className="glassmorphism sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/10 dark:border-gray-800/50 backdrop-blur-md bg-white/70 dark:bg-slate-900/80 transition-all duration-300">
      <div 
        className="flex items-center gap-3 cursor-pointer" 
        onClick={() => onNavigate('list')}
      >
        <div className="p-2 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-lg text-white shadow-lg shadow-indigo-500/30 animate-pulse">
          <Trophy className="h-6 w-6" />
        </div>
        <span className="font-extrabold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 drop-shadow-sm font-sans">
          Rent & Flatmate Finder
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => onNavigate('list')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            currentView === 'list' 
              ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20' 
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 border border-gray-200 dark:border-gray-800"
          aria-label="Toggle Theme"
        >
          {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
        </button>

        {user && (
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-450 border border-rose-500/20 rounded-full text-sm font-semibold transition-all duration-200"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
