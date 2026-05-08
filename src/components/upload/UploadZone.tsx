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
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        const file = new File([blob], 'voice.webm', { type: 'audio/webm;codecs=opus' });
        onVoiceSelect(file);
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
    <div className="flex gap-3 items-stretch h-14">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {/* Photo Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing || isRecording}
        className={`flex items-center justify-center gap-2 glass-card border-brand-accent/20 hover:border-brand-medium text-brand-dark font-medium transition-all group h-full ${
          hasMessages ? 'w-14 shrink-0' : 'flex-1'
        }`}
      >
        <div className={`transition-colors ${
          hasMessages ? 'text-brand-medium' : 'bg-brand-medium/10 p-2 rounded-xl text-brand-medium group-hover:bg-brand-medium group-hover:text-white'
        }`}>
          <Camera className={hasMessages ? 'w-6 h-6' : 'w-5 h-5'} />
        </div>
        {!hasMessages && <span>Фото растения</span>}
      </motion.button>
      
      {/* Voice Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`flex items-center justify-center gap-3 glass-card border-brand-accent/20 transition-all h-full ${
          isRecording ? 'bg-red-50 border-red-200 text-red-600' : 'hover:border-brand-medium text-brand-dark'
        } ${hasMessages ? 'w-14 shrink-0' : 'flex-1'}`}
      >
        <div className="relative flex items-center justify-center shrink-0">
          {isRecording && (
            <>
              <motion.div
                animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="absolute w-10 h-10 bg-red-400/30 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 2.4, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
                className="absolute w-10 h-10 bg-red-400/20 rounded-full"
              />
            </>
          )}
          {isRecording ? (
            <Square className="w-5 h-5 fill-current" />
          ) : isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin text-brand-medium" />
          ) : (
            <Mic className="w-6 h-6 text-brand-medium" />
          )}
        </div>
        
        {!hasMessages && (
          isRecording ? (
            <div className="flex items-end gap-1 h-4">
              {[0.4, 0.9, 0.6, 1, 0.5, 0.8].map((h, i) => (
                <motion.div
                  key={i}
                  animate={{ height: ["40%", "100%", "40%"] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                  className="w-1 bg-red-500 rounded-full"
                />
              ))}
            </div>
          ) : (
            <span className="font-medium">Голосовой вопрос</span>
          )
        )}
      </motion.button>
    </div>
  );
};
