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
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsProcessing(false);
      addMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Запрос отменен пользователем.',
        type: 'text',
      });
    }
  };

  const createSignal = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    return controller.signal;
  };

  const handleError = (error: any, context: string) => {
    if (error.name === 'AbortError') return;

    console.error(`[${context}]`, error);

    let friendlyMessage = "Ой! Кажется, у меня завяли листочки от такой сложной задачи. Попробуйте еще раз, пожалуйста. 🌿";

    if (error.message.includes('Failed to fetch')) {
      friendlyMessage = "Связь с оранжереей прервалась... Проверьте интернет, а я пока полив проверю. 📡";
    } else if (error.message.includes('Сбой нейросети')) {
      friendlyMessage = error.message;
    }

    addMessage({
      id: Date.now().toString(),
      role: 'assistant',
      content: friendlyMessage,
      type: 'text',
    });
  };

  const handleImageSelect = async (file: File) => {
    try {
      setIsProcessing(true);
      setLoadingText('Обрабатываем изображение...');
      const signal = createSignal();

      const imageUrl = URL.createObjectURL(file);
      addMessage({
        id: Date.now().toString(),
        role: 'user',
        content: 'Анализ состояния растения по фото',
        type: 'image',
        imageUrl,
      });

      setLoadingText('Проверяем листья на вредителей и болезни...');
      const response = await plantService.analyzeImage(file, signal);

      addAssistantMessage(response);
    } catch (error: any) {
      handleError(error, 'Ошибка при анализе');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceSelect = async (audio: File | Blob) => {
    try {
      setIsProcessing(true);
      setLoadingText('Распознаем ваш голос...');
      const signal = createSignal();

      addMessage({
        id: Date.now().toString(),
        role: 'user',
        content: '🎤 Голосовой запрос',
        type: 'voice',
      });

      const history = messages.slice(-5).map(m => ({
        role: m.role,
        content: m.role === 'assistant' ? m.content : m.content
      }));

      const response = await plantService.sendVoiceMessage(audio, history, signal);

      // Update the user message with transcribed text if available
      if (response.transcribed_text) {
        setMessages(prev => prev.map(m =>
          m.content === '🎤 Голосовой запрос' ? { ...m, content: `🎤 ${response.transcribed_text}` } : m
        ));
      }

      addAssistantMessage(response);
    } catch (error: any) {
      handleError(error, 'Ошибка при обработке голоса');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    try {

      // Очищаем текст от скрытых символов и лишних переносов
      text = text
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Если после очистки текст пустой — ничего не отправляем
      if (!text) {
        return;
      }

      setIsProcessing(true);
      setLoadingText('Обдумываем ответ...');
      const signal = createSignal();

      addMessage({
        id: Date.now().toString(),
        role: 'user',
        content: text,
        type: 'text',
      });

      const history = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.role === 'assistant' ? m.content : m.content
      }));

      const response = await plantService.sendChatMessage(text, history, signal);
      addAssistantMessage(response);
    } catch (error: any) {
      handleError(error, 'Ошибка');
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
    <div className="h-screen flex flex-col bg-brand-light">
      <Navbar onClearChat={handleClearChat} showClear={messages.length > 0} />

      {/* Scrollable Area */}
      <main className="flex-1 overflow-y-auto pt-24 pb-4 px-6 scroll-smooth">
        <div className="max-w-2xl mx-auto">
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
                  {[
                    { t: "Загрузите фото", i: "1" },
                    { t: "Получите анализ", i: "2" },
                    { t: "Следуйте советам", i: "3" }
                  ].map((item, idx) => (
                    <div key={idx} className="glass-card p-6 flex flex-col items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">{item.i}</div>
                      <span className="text-sm font-medium">{item.t}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg) => (
                  <MessageItem
                    key={msg.id}
                    message={msg}
                    onActionClick={handleSendMessage}
                  />
                ))}
                {isProcessing && (
                  <LoadingState
                    type={
                      messages[messages.length - 1]?.type === 'image' ? 'image' :
                        messages[messages.length - 1]?.type === 'voice' ? 'voice' : 'chat'
                    }
                    onCancel={handleCancel}
                  />
                )}
                <div ref={chatEndRef} className="h-4" />
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Fixed Bottom Panel */}
      <footer className="bg-white/80 backdrop-blur-xl border-t border-brand-accent/10 px-6 py-4 shadow-[0_-10px_20px_-10px_rgba(34,197,94,0.1)]">
        <div className="max-w-2xl mx-auto">
          {messages.length === 0 ? (
            <div className="space-y-4">
              <UploadZone
                onFileSelect={handleImageSelect}
                onVoiceSelect={handleVoiceSelect}
                isProcessing={isProcessing}
                hasMessages={false}
              />
              <ChatInput onSendMessage={handleSendMessage} isProcessing={isProcessing} />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ChatInput onSendMessage={handleSendMessage} isProcessing={isProcessing} />
              </div>
              <div className="h-14">
                <UploadZone
                  onFileSelect={handleImageSelect}
                  onVoiceSelect={handleVoiceSelect}
                  isProcessing={isProcessing}
                  hasMessages={true}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 mt-4">
            <Info className="w-3 h-3 text-gray-400" />
            <p className="text-[10px] text-gray-400">
              Рекомендации ИИ могут быть неточными.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
