import os
import json
import logging
import asyncio
from typing import List, Optional
import io
import base64

from PIL import Image
from dotenv import load_dotenv
from openai import AsyncOpenAI
from telegram import Update, ReplyKeyboardMarkup, KeyboardButton
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler, MessageHandler, filters

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("telegram").setLevel(logging.WARNING)

# Конфигурация из окружения
load_dotenv()
TELEGRAM_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

# Инициализация клиента OpenAI
client = AsyncOpenAI(api_key=OPENAI_API_KEY)

# Модель для анализа
MODEL = "gpt-4o"

# Промпты
PLANT_ANALYSIS_PROMPT = """
Вы — ведущий эксперт-агроном, фитопатолог и ботаник. Проведите глубокий анализ изображения.

ПРАВИЛА:
1. Если на фото НЕ растение: ответьте с вежливым юмором.
2. Если на фото растение:
   - Используйте вероятностный подход ("Вероятно...", "Напоминает...").
   - Предоставьте прямые ссылки на Wikipedia для растения и заболевания.

ВАЖНО ПОДСКАЗКИ (suggested_actions):
Это должны быть вопросы, которые ПОЛЬЗОВАТЕЛЬ может задать в ответ (от первого лица "Я", "Мне").
КРИТИЧЕСКИ ВАЖНО: Это кнопки для пользователя. 
ЗАПРЕЩЕНО: "А какой у вас сорт?" (это вопрос от ИИ).
ПРАВИЛЬНО: "Какой это сорт?", "Как МНЕ ухаживать за этим сортом?", "Что МНЕ купить?".
СТРОГО ОТ 3 ДО 5 вопросов.

Верните ответ СТРОГО в формате JSON:
{
  "plant_name": "Название (вероятное)",
  "plant_url": "ссылка на Википедию",
  "disease_name": "Диагноз (вероятно)",
  "disease_url": "ссылка на описание болезни",
  "summary": "Профессиональное заключение",
  "possible_causes": ["Причина 1", "Причина 2"],
  "recommendations": ["Шаг 1", "Шаг 2"],
  "detailed_advice": "Экспертные советы по уходу",
  "suggested_actions": ["Вопрос от пользователя 1", "Вопрос от пользователя 2", "Вопрос от пользователя 3"],
  "disclaimer": "Рекомендации могут быть неточными."
}
"""

CHAT_PROMPT = """
Вы — профессиональный ассистент по уходу за растениями. 
Отвечайте исчерпывающе, научно обоснованно. Если вопрос не о растениях — мягко вернитесь к теме ботаники.

ВАЖНО ПОДСКАЗКИ (suggested_actions):
Это должны быть уточняющие вопросы ОТ ПЕРВОГО ЛИЦА ПОЛЬЗОВАТЕЛЯ.
Кнопки должны содержать текст, который пользователь как бы "произносит".
НЕПРАВИЛЬНО: "Есть ли у вас вопросы?"
ПРАВИЛЬНО: "Расскажи МНЕ больше", "Что ЕЩЕ мне нужно знать?", "Как МНЕ спасти растение?".
СТРОГО ОТ 3 ДО 5 вопросов.

Верните ответ СТРОГО в формате JSON:
{
  "summary": "Ответ",
  "possible_causes": [],
  "recommendations": [],
  "detailed_advice": "Тонкости ухода",
  "suggested_actions": ["Уточняющий вопрос 1", "Уточняющий вопрос 2", "Уточняющий вопрос 3"],
  "disclaimer": "Рекомендации могут быть неточными."
}
"""


def encode_image(image_bytes):
    return base64.b64encode(image_bytes).decode('utf-8')


async def analyze_with_gpt(prompt: str, image_bytes: bytes = None) -> dict:
    try:
        messages = []
        if image_bytes:
            base64_image = encode_image(image_bytes)
            messages = [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ]
        else:
            messages = [
                {"role": "system", "content": "You are a professional plant assistant. Always respond in valid JSON format."},
                {"role": "user", "content": prompt}
            ]

        response = await client.chat.completions.create(
            model=MODEL,
            messages=messages,
            response_format={"type": "json_object"},
            max_tokens=2000
        )

        return json.loads(response.choices[0].message.content)
    except Exception as e:
        logging.error(f"OpenAI Error: {e}")
        return None


async def transcribe_audio(audio_bytes: bytes) -> str:
    """Транскрибирует аудио через OpenAI Whisper."""
    try:
        audio_file = io.BytesIO(audio_bytes)
        audio_file.name = "voice.ogg"
        transcript = await client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file
        )
        return transcript.text
    except Exception as e:
        logging.error(f"Whisper Error: {e}")
        return ""


async def update_status_loop(message, base_text: str, stop_event: asyncio.Event):
    """Анимация точек в сообщении."""
    dots = ["", ".", "..", "..."]
    idx = 0
    while not stop_event.is_set():
        try:
            await message.edit_text(f"{base_text}{dots[idx % 4]}")
            idx += 1
            await asyncio.sleep(2)
        except Exception:
            break


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    welcome_text = (
        "🌱 Привет! Я — ваш карманный агроном.\n\n"
        "Отправьте мне фото растения, и я проведу диагностику.\n"
        "Или просто напишите свой вопрос об уходе!"
    )
    # Постоянные кнопки меню
    keyboard = [
        [KeyboardButton("🌱 Новое растение"), KeyboardButton("🗑️ Очистить чат")]
    ]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
    await update.message.reply_text(welcome_text, reply_markup=reply_markup)


async def clear_chat(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Имитация очистки чата."""
    await update.message.reply_text(
        "🗑️ Контекст сброшен. Теперь я готов обсуждать новое растение!",
        reply_markup=ReplyKeyboardMarkup([["🌱 Новое растение", "🗑️ Очистить чат"]], resize_keyboard=True)
    )


async def handle_photo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    photo_file = await update.message.photo[-1].get_file()
    image_bytes = await photo_file.download_as_bytearray()

    wait_msg = await update.message.reply_text("🧐 Обрабатываю информацию")
    stop_event = asyncio.Event()
    status_task = asyncio.create_task(update_status_loop(wait_msg, "🧐 Обрабатываю информацию", stop_event))

    try:
        result = await analyze_with_gpt(PLANT_ANALYSIS_PROMPT, image_bytes)
    finally:
        stop_event.set()
        await status_task

    if not result:
        await wait_msg.edit_text("❌ Извините, произошла ошибка. Проверьте настройки или попробуйте позже.")
        return

    # Формируем ответ
    response = f"🌿 *{result.get('plant_name', 'Растение')}*\n"
    if result.get('plant_url'):
        response += f"📖 [Подробнее о виде]({result['plant_url']})\n"

    response += f"\n📊 *Состояние:* {result.get('disease_name', 'Не определено')}\n"
    if result.get('disease_url'):
        response += f"🔍 [О заболевании]({result['disease_url']})\n"

    response += f"\n📝 *Заключение:* {result.get('summary', '')}\n"

    if result.get('possible_causes'):
        response += f"\n🔴 *Причины:*\n" + \
            "\n".join([f"• {c}" for c in result['possible_causes']])

    if result.get('recommendations'):
        response += f"\n✅ *План спасения:*\n" + \
            "\n".join(
                [f"{i+1}. {r}" for i, r in enumerate(result['recommendations'])])

    if result.get('detailed_advice'):
        response += f"\n🎓 *Совет эксперта:* _{result['detailed_advice']}_"

    response += f"\n\n⚠️ _{result.get('disclaimer', '')}_"

    # Динамические кнопки + кнопки управления
    keyboard = [[KeyboardButton(q)] for q in result.get('suggested_actions', [])[:5]]
    keyboard.append([KeyboardButton("🌱 Новое растение"), KeyboardButton("🗑️ Очистить чат")])
    
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)

    await context.bot.delete_message(chat_id=update.effective_chat.id, message_id=wait_msg.message_id)
    await update.message.reply_text(response, parse_mode='Markdown', reply_markup=reply_markup, disable_web_page_preview=True)


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE, provided_text: str = None):
    user_text = provided_text or update.message.text

    # Обработка сервисных кнопок
    if user_text == "🌱 Новое растение":
        return await start(update, context)
    if user_text == "🗑️ Очистить чат":
        return await clear_chat(update, context)
    
    wait_msg = await update.message.reply_text(".")
    stop_event = asyncio.Event()
    status_task = asyncio.create_task(update_status_loop(wait_msg, ".", stop_event))

    try:
        prompt = f"{CHAT_PROMPT}\nВопрос пользователя: {user_text}"
        result = await analyze_with_gpt(prompt)
    finally:
        stop_event.set()
        await status_task

    if not result:
        await wait_msg.edit_text("🤔 Хм, возникли проблемы со связью. Попробуйте позже.")
        return

    response = result.get('summary', '')

    if result.get('recommendations'):
        response += "\n\n💡 *Рекомендации:*\n" + \
            "\n".join([f"• {r}" for r in result['recommendations']])

    if result.get('detailed_advice'):
        response += f"\n\n🌱 *Дополнительно:* {result['detailed_advice']}"

    # Динамические кнопки + кнопки управления
    keyboard = [[KeyboardButton(q)] for q in result.get('suggested_actions', [])[:5]]
    keyboard.append([KeyboardButton("🌱 Новое растение"), KeyboardButton("🗑️ Очистить чат")])
    
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)

    await context.bot.delete_message(chat_id=update.effective_chat.id, message_id=wait_msg.message_id)
    await update.message.reply_text(response, parse_mode='Markdown', reply_markup=reply_markup)


async def handle_voice(update: Update, context: ContextTypes.DEFAULT_TYPE):
    voice_file = await update.message.voice.get_file()
    voice_bytes = await voice_file.download_as_bytearray()

    wait_msg = await update.message.reply_text("🎤 Слушаю")
    stop_event = asyncio.Event()
    status_task = asyncio.create_task(update_status_loop(wait_msg, "🎤 Слушаю", stop_event))

    try:
        text = await transcribe_audio(voice_bytes)
    finally:
        stop_event.set()
        await status_task

    if not text:
        await wait_msg.edit_text("❌ Не удалось разобрать аудио. Попробуйте сказать четче.")
        return

    await wait_msg.delete()
    # Передаем текст напрямую в обработчик
    await handle_message(update, context, provided_text=text)


if __name__ == '__main__':
    if not TELEGRAM_TOKEN or not OPENAI_API_KEY:
        print("Ошибка: Проверьте TELEGRAM_BOT_TOKEN и OPENAI_API_KEY в .env")
    else:
        app = ApplicationBuilder().token(TELEGRAM_TOKEN).build()

        app.add_handler(CommandHandler("start", start))
        app.add_handler(CommandHandler("clear", clear_chat))
        app.add_handler(MessageHandler(filters.PHOTO, handle_photo))
        app.add_handler(MessageHandler(filters.VOICE, handle_voice))
        app.add_handler(MessageHandler(
            filters.TEXT & (~filters.COMMAND), handle_message))

        print("Telegram бот запущен...")
        app.run_polling()
