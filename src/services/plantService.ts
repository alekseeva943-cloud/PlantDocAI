import { AIResponse } from '../types';

export const plantService = {
  async analyzeImage(file: File): Promise<AIResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/plant/analyze', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Ошибка при анализе изображения');
    }

    return response.json();
  },

  async sendChatMessage(message: string, history: any[] = []): Promise<AIResponse> {
    const response = await fetch('/api/plant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Ошибка в чате');
    }

    return response.json();
  },

  async sendVoiceMessage(audioBlob: Blob): Promise<AIResponse> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice.webm');

    const response = await fetch('/api/plant/voice', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Ошибка при обработке голоса');
    }

    return response.json();
  }
};
