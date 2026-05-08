import { Router, Request, Response } from 'express';
import multer from 'multer';
import { PlantAIOrchestrator } from '../ai/orchestrator/plant.orchestrator';

const router = Router();
const upload = multer({ 
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
const orchestrator = new PlantAIOrchestrator();

// Анализ изображения
router.post('/analyze', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Изображение не загружено' });
    }

    const imageBase64 = file.buffer.toString('base64');
    const result = await orchestrator.analyzePlantImage(imageBase64);
    res.json(result);
  } catch (error: any) {
    console.error('API /analyze error:', error);
    res.status(500).json({ error: 'Ошибка при анализе изображения: ' + error.message });
  }
});

// Чат
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Сообщение пустое' });
    }

    const result = await orchestrator.handleChat(message, history);
    res.json(result);
  } catch (error: any) {
    console.error('API /chat error:', error);
    res.status(500).json({ error: 'Ошибка в чате: ' + error.message });
  }
});

// Голосовое сообщение
router.post('/voice', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Аудио не загружено' });
    }

    const text = await orchestrator.transcribeVoice(file);
    const result = await orchestrator.handleChat(text);
    res.json({ ...result, transcribed_text: text });
  } catch (error: any) {
    console.error('API /voice error:', error);
    res.status(500).json({ error: 'Ошибка при обработке голоса: ' + error.message });
  }
});

export default router;
