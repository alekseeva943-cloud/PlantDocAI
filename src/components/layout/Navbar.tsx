import React from 'react';
import { Leaf, Trash2 } from 'lucide-react';

interface NavbarProps {
  onClearChat?: () => void;
  showClear?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onClearChat, showClear }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between glass-card px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="bg-brand-medium p-2 rounded-xl">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-brand-dark">Plant AI</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-xs text-gray-500 font-medium hidden md:block">
            Помощник по уходу за растениями
          </div>
          {showClear && (
            <button
              onClick={onClearChat}
              className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Очистить чат</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
