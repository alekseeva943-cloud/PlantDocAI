import React, { useState } from 'react';
import { SendHorizonal } from 'lucide-react';
import { motion } from 'motion/react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isProcessing }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isProcessing) {
      onSendMessage(value);
      setValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 relative">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Задайте вопрос о растении..."
        disabled={isProcessing}
        className="w-full h-14 pl-6 pr-14 glass-card border-brand-accent/10 focus:border-brand-medium outline-none transition-all placeholder:text-gray-400"
      />
      <motion.button
        type="submit"
        whileTap={{ scale: 0.9 }}
        disabled={!value.trim() || isProcessing}
        className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center rounded-2xl bg-brand-medium text-white hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:bg-gray-300"
      >
        <SendHorizonal className="w-5 h-5" />
      </motion.button>
    </form>
  );
};
