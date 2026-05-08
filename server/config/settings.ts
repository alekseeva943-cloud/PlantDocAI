import dotenv from 'dotenv';
dotenv.config();

export const settings = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  PORT: parseInt(process.env.PORT || '3000'),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MODEL_NAME: 'gpt-4o-mini', // High performance & cheaper for analysis
  WHISPER_MODEL: 'whisper-1',
};
