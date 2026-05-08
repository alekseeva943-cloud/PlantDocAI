import { motion } from 'motion/react';
import { Leaf, Trash2 } from 'lucide-react';

interface NavbarProps {
  onClearChat?: () => void;
  showClear?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onClearChat, showClear }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between glass-card px-6 py-3 border-brand-accent/10">
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
          {/* Animated Clear Chat Button */}
          {showClear && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, x: 2 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClearChat}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors uppercase tracking-wider text-[10px] sm:text-xs font-bold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Очистить чат</span>
            </motion.button>
          )}
        </div>
      </div>
    </nav>
  );
};
