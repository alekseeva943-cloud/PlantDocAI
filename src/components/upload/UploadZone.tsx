import React, { useRef } from 'react';
import { Camera, Upload, Mic } from 'lucide-react';
import { motion } from 'motion/react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, isProcessing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
        className="flex-1 flex items-center justify-center gap-2 py-4 px-6 glass-card border-brand-accent/20 hover:border-brand-medium text-brand-dark font-medium transition-all group"
      >
        <div className="bg-brand-medium/10 p-2 rounded-xl group-hover:bg-brand-medium group-hover:text-white transition-colors">
          <Camera className="w-5 h-5" />
        </div>
        <span>Загрузить фото</span>
      </motion.button>
      
      <motion.button
        whileTap={{ scale: 0.95 }}
        disabled={isProcessing}
        className="glass-card px-5 border-brand-accent/20 hover:border-brand-medium text-brand-dark transition-all disabled:opacity-50"
      >
        <Mic className="w-5 h-5" />
      </motion.button>
    </div>
  );
};
