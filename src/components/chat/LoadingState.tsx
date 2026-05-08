import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, XCircle } from 'lucide-react';

interface LoadingStateProps {
  initialMessage?: string;
  type?: 'image' | 'voice' | 'chat';
  onCancel?: () => void;
}

const IMAGE_MESSAGES = [
  "Анализируем структуру листьев...",
  "Ищем признаки вредителей...",
  "Проверяем влажность и пятна...",
  "Сверяемся с базой болезней...",
  "Почти готово, формируем отчет..."
];

const VOICE_MESSAGES = [
  "Распознаем ваш голос...",
  "Преобразуем аудио в текст...",
  "Анализируем запрос...",
  "Подготавливаем ботанический ответ..."
];

const CHAT_MESSAGES = [
  "Обдумываем ответ...",
  "Ищем лучшее решение...",
  "Сверяемся с базой знаний...",
  "Печатаем рекомендации..."
];

export const LoadingState: React.FC<LoadingStateProps> = ({ initialMessage, type = 'image', onCancel }) => {
  const [index, setIndex] = useState(0);

  const currentMessages = type === 'voice' ? VOICE_MESSAGES : type === 'chat' ? CHAT_MESSAGES : IMAGE_MESSAGES;

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % currentMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [currentMessages]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-brand-accent/20 max-w-max shadow-sm"
    >
      <Loader2 className="w-4 h-4 text-brand-medium animate-spin" />
      <div className="overflow-hidden h-5 flex items-center min-w-[150px]">
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -15, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-xs font-medium text-gray-500 block whitespace-nowrap"
          >
            {initialMessage && index === 0 ? initialMessage : currentMessages[index]}
          </motion.span>
        </AnimatePresence>
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
          title="Отменить"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
};
