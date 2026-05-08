import { Router, Request, Response } from 'express';
import multer from 'multer';
import { PlantAIOrchestrator } from '../ai/orchestrator/plant.orchestrator';
import { settings } from '../config/settings';

const router = Router();

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

let _orchestrator: PlantAIOrchestrator | null = null;

function getOrchestrator() {
  if (
    !settings.OPENAI_API_KEY ||
    settings.OPENAI_API_KEY.includes('your_openai_api_key_here')
  ) {
    throw new Error(
      'API ключ OpenAI не настроен. Пожалуйста, добавьте рабочий ключ в переменные окружения (OPENAI_API_KEY).'
    );
  }

  if (!_orchestrator) {
    _orchestrator = new PlantAIOrchestrator();
  }

  return _orchestrator;
}

// Безопасная очистка history
function sanitizeHistory(history: any[] = []) {
  return history
    .filter(
      (m) =>
        m &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0
    )
    .map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/\s+/g, ' ')
        .trim(),
    }))
    .slice(-10); // Храним последние 10 сообщений
}

// Анализ изображения
router.post(
  '/analyze',
  upload.single('image'),
  async (req: Request, res: Response) => {
    try {
      const orchestrator = getOrchestrator();

      const file = req.file;

      if (!file) {
        return res.status(400).json({
          error: 'Изображение не загружено',
        });
      }

      const imageBase64 = file.buffer.toString('base64');

      const result = await orchestrator.analyzePlantImage(imageBase64);

      res.json(result);
    } catch (error: any) {
      console.error('API /analyze error:', error);

      res.status(500).json({
        error: error.message || 'Ошибка при анализе',
      });
    }
  }
);

// Чат
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const orchestrator = getOrchestrator();

    const { message, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: 'Сообщение пустое',
      });
    }

    const formattedHistory = sanitizeHistory(history || []);

    const cleanMessage = message
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const result = await orchestrator.handleChat(
      cleanMessage,
      formattedHistory
    );

    res.json(result);
  } catch (error: any) {
    console.error('API /chat error:', error);

    res.status(500).json({
      error: error.message || 'Ошибка чата',
    });
  }
});

// Голосовое сообщение
router.post(
  '/voice',
  upload.single('audio'),
  async (req: Request, res: Response) => {
    try {
      const orchestrator = getOrchestrator();

      const file = req.file;

      if (!file) {
        return res.status(400).json({
          error: 'Аудио не загружено',
        });
      }

      let { history } = req.body;

      // FormData history parsing
      if (typeof history === 'string') {
        try {
          history = JSON.parse(history);
        } catch {
          history = [];
        }
      }

      try {
        const text = await orchestrator.transcribeVoice(file);

        if (!text || text.trim().length === 0) {
          return res.json({
            summary:
              'Извините, я не смог расслышать ваше сообщение. Попробуйте сказать чуть громче или четче.',
            possible_causes: [],
            recommendations: [],
            suggested_actions: [
              'Попробовать еще раз',
              'Задать вопрос текстом',
            ],
            disclaimer: 'Рекомендации ИИ могут быть неточными.',
            transcribed_text: '',
          });
        }

        const formattedHistory = sanitizeHistory(
          Array.isArray(history) ? history : []
        );

        const result = await orchestrator.handleChat(
          text.trim(),
          formattedHistory
        );

        res.json({
          ...result,
          transcribed_text: text,
        });
      } catch (aiError: any) {
        console.error('Inner AI /voice error:', aiError);

        res.status(500).json({
          error: `Сбой нейросети: ${
            aiError.message || 'неизвестная ошибка'
          }`,
        });
      }
    } catch (error: any) {
      console.error('API /voice error:', error);

      res.status(500).json({
        error: error.message || 'Ошибка обработки голоса',
      });
    }
  }
);

export default router;