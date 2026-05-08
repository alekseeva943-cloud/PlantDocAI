import React, { useState, useRef, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { MessageItem } from './components/chat/MessageItem';
import { ChatInput } from './components/chat/ChatInput';
import { UploadZone } from './components/upload/UploadZone';
import { LoadingState } from './components/chat/LoadingState';
import { ChatMessage, AIResponse } from './types';
import { plantService } from './services/plantService';
import { motion, AnimatePresence } from 'motion/react';
import { Info } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingText, setLoadingText] = useState('Анализируем...');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleImageSelect = async (file: File) => {
    try {
      setIsProcessing(true);
      setLoadingText('Обрабатываем изображение...');
      
      const imageUrl = URL.createObjectURL(file);
      addMessage({
        id: Date.now().toString(),
        role: 'user',
        content: 'Анализ состояния растения по фото',
        type: 'image',
        imageUrl,
      });

      setLoadingText('Проверяем листья на вредителей и болезни...');
      const response = await plantService.analyzeImage(file);
      
      addAssistantMessage(response);
    } catch (error: any) {
      addMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: `Ошибка: ${error.message}`,
        type: 'text',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    try {
      setIsProcessing(true);
      setLoadingText('Обдумываем ответ...');
      
      addMessage({
        id: Date.now().toString(),
        role: 'user',
        content: text,
        type: 'text',
      });

      const history = messages.slice(-6).map(m => ({ 
        role: m.role, 
        content: m.role === 'assistant' ? JSON.stringify(m.data) : m.content 
      }));

      const response = await plantService.sendChatMessage(text, history);
      addAssistantMessage(response);
    } catch (error: any) {
      addMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: `Ошибка: ${error.message}`,
        type: 'text',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const addAssistantMessage = (data: AIResponse) => {
    addMessage({
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: data.summary,
      type: 'text',
      data,
    });
  };

  return (
    <div className="min-h-screen flex flex-col pb-40">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 pt-28">
        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-10 mb-20 text-center"
            >
              <h1 className="text-4xl sm:text-6xl font-bold text-brand-dark mb-6 leading-tight">
                Ваш карманный <br />
                <span className="text-brand-medium">ботаник-аналитик</span>
              </h1>
              <p className="text-gray-600 max-w-lg mx-auto text-lg mb-10 leading-relaxed">
                Сделайте фото или задайте вопрос, чтобы узнать, почему ваше растение болеет и как ему помочь.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
                 <div className="glass-card p-6 flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">1</div>
                    <span className="text-sm font-medium">Загрузите фото</span>
                 </div>
                 <div className="glass-card p-6 flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">2</div>
                    <span className="text-sm font-medium">Получите анализ</span>
                 </div>
                 <div className="glass-card p-6 flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">3</div>
                    <span className="text-sm font-medium">Следуйте советам</span>
                 </div>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6 pb-12">
              {messages.map((msg) => (
                <MessageItem 
                  key={msg.id} 
                  message={msg} 
                  onActionClick={handleSendMessage}
                />
              ))}
              {isProcessing && <LoadingState message={loadingText} />}
              <div ref={chatEndRef} />
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-brand-light via-brand-light/95 to-transparent pt-10 pb-6 px-6">
        <div className="max-w-xl mx-auto space-y-4">
          <UploadZone onFileSelect={handleImageSelect} isProcessing={isProcessing} />
          <ChatInput onSendMessage={handleSendMessage} isProcessing={isProcessing} />
          
          <div className="flex items-start justify-center gap-2 px-6">
            <Info className="w-3 h-3 text-gray-400 mt-1 shrink-0" />
            <p className="text-[10px] text-gray-400 text-center leading-normal">
              Рекомендации ИИ могут быть неточными и не заменяют профессиональную ботаническую консультацию.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
