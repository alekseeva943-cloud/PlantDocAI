import OpenAI from 'openai';
import { settings } from '../../config/settings';

export class OpenAIProvider {
  private client: OpenAI;

  constructor() {
    if (!settings.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not defined in environment variables.');
    }
    this.client = new OpenAI({
      apiKey: settings.OPENAI_API_KEY,
    });
  }

  async analyzeImage(imageBase64: string, prompt: string): Promise<string | null> {
    const response = await this.client.chat.completions.create({
      model: settings.MODEL_NAME,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    });

    return response.choices[0].message.content;
  }

  async chat(messages: any[]): Promise<string | null> {
    const response = await this.client.chat.completions.create({
      model: settings.MODEL_NAME,
      messages,
      response_format: { type: 'json_object' },
    });

    return response.choices[0].message.content;
  }

  async transcribe(file: Express.Multer.File): Promise<string> {
    // OpenAI SDK supports passing a buffer with a filename
    const transcription = await this.client.audio.transcriptions.create({
      file: await OpenAI.toFile(file.buffer, 'voice.webm'),
      model: settings.WHISPER_MODEL,
    });
    return transcription.text;
  }
}
