import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = "Анализируем..." }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100 max-w-max animate-pulse"
    >
      <Loader2 className="w-5 h-5 text-brand-medium animate-spin" />
      <span className="text-sm font-medium text-gray-500">{message}</span>
    </motion.div>
  );
};
