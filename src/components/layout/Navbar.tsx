import React from 'react';
import { Leaf } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between glass-card px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="bg-brand-medium p-2 rounded-xl">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-brand-dark">Plant AI</span>
        </div>
        <div className="text-xs text-gray-500 font-medium hidden sm:block">
          Помощник по уходу за растениями
        </div>
      </div>
    </nav>
  );
};
