import React, { useRef, useState } from 'react';
import { Camera, Mic, Square, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  onVoiceSelect: (blob: Blob) => void;
  isProcessing: boolean;
  hasMessages: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ 
  onFileSelect, 
  onVoiceSelect, 
  isProcessing, 
  hasMessages 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onVoiceSelect(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Ошибка доступа к микрофону:', err);
      alert('Не удалось получить доступ к микрофону. Убедитесь, что вы дали разрешение.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <AnimatePresence mode="wait">
        {!hasMessages ? (
          <motion.button
            key="large-upload"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-2 py-4 px-6 glass-card border-brand-accent/20 hover:border-brand-medium text-brand-dark font-medium transition-all group"
          >
            <div className="bg-brand-medium/10 p-2 rounded-xl group-hover:bg-brand-medium group-hover:text-white transition-colors">
              <Camera className="w-5 h-5" />
            </div>
            <span>Загрузить фото растения</span>
          </motion.button>
        ) : (
          <motion.button
            key="small-upload"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="glass-card p-4 border-brand-accent/20 hover:border-brand-medium text-brand-dark transition-all shrink-0"
            title="Загрузить фото"
          >
            <Camera className="w-6 h-6 text-brand-medium" />
          </motion.button>
        )}
      </AnimatePresence>
      
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`glass-card p-4 flex-1 sm:flex-none flex items-center justify-center gap-2 border-brand-accent/20 transition-all ${
          isRecording ? 'bg-red-50 border-red-200 text-red-600' : 'hover:border-brand-medium text-brand-dark'
        }`}
      >
        {isRecording ? (
          <>
            <Square className="w-5 h-5 fill-current" />
            <span className="text-sm font-bold animate-pulse">Идет запись...</span>
          </>
        ) : isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Mic className="w-5 h-5" />
            {!hasMessages && <span className="hidden sm:inline">Голосовой вопрос</span>}
          </>
        )}
      </motion.button>
    </div>
  );
};
