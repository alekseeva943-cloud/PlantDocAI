import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  initialMessage?: string;
}

const MESSAGES = [
  "Анализируем структуру листьев...",
  "Ищем признаки вредителей...",
  "Проверяем влажность и пятна...",
  "Сверяемся с базой болезней растений...",
  "Подбираем рекомендации по уходу...",
  "Почти готово, формируем отчет..."
];

export const LoadingState: React.FC<LoadingStateProps> = ({ initialMessage }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-5 bg-white/80 backdrop-blur-md rounded-3xl border border-brand-accent/20 max-w-max shadow-sm"
    >
      <Loader2 className="w-5 h-5 text-brand-medium animate-spin" />
      <div className="overflow-hidden h-5 flex items-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm font-medium text-gray-600 block whitespace-nowrap"
          >
            {initialMessage && index === 0 ? initialMessage : MESSAGES[index]}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
