import { AIResponse } from '../types';

export const plantService = {

  async analyzeImage(file: File, signal?: AbortSignal): Promise<AIResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/plant/analyze', {
      method: 'POST',
      body: formData,
      signal
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Ошибка при анализе изображения');
    }

    return response.json();
  },

  async sendChatMessage(
    message: string,
    history: any[] = [],
    signal?: AbortSignal
  ): Promise<AIResponse> {

    // Чистим текст от скрытых символов
    message = message
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const cleanHistory = history.map((item) => ({
      role: item.role,
      content:
        typeof item.content === 'string'
          ? item.content
              .replace(/\n/g, ' ')
              .replace(/\r/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
          : ''
    }));

    const response = await fetch('/api/plant/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        history: cleanHistory
      }),
      signal
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Ошибка в чате');
    }

    return response.json();
  },

  async sendVoiceMessage(
    audioFile: File | Blob,
    history: any[] = [],
    signal?: AbortSignal
  ): Promise<AIResponse> {

    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('history', JSON.stringify(history || []));

    const response = await fetch('/api/plant/voice', {
      method: 'POST',
      body: formData,
      signal
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Ошибка при обработке голоса');
    }

    return response.json();
  }
};