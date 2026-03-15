import os
import logging
import time
from datetime import datetime
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler, MessageHandler, filters
from pymongo import MongoClient

from google import genai 

load_dotenv()

TELEGRAM_TOKEN = os.getenv('TELEGRAM_TOKEN')
MONGO_URI = os.getenv('MONGO_URI')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

client_ai = genai.Client(api_key=GEMINI_API_KEY)

client_db = MongoClient(MONGO_URI)
db = client_db['neermithran']
sensor_collection = db['sensor_readings']
users_collection = db['users'] 

def save_user(user):
    user_data = {
        "telegram_id": user.id,
        "first_name": user.first_name,
        "username": user.username,
        "last_interaction": datetime.utcnow()
    }
    users_collection.update_one({"telegram_id": user.id}, {"$set": user_data}, upsert=True)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    save_user(update.effective_user)
    await update.message.reply_text(f"Hi {update.effective_user.first_name}! I'm your Agro Bot. Ask me anything or use /getdata for sensor stats.")

async def get_data(update: Update, context: ContextTypes.DEFAULT_TYPE):
    save_user(update.effective_user)
    try:
        cursor = sensor_collection.find().sort("timestamp", -1).limit(1)
        response_message = "<b>Latest Sensor Data:</b>\n\n"
        
        results = list(cursor)
        if not results:
            await update.message.reply_text("No data found.")
            return

        for doc in results:
            response_message += (
                f"🌡 Temp: {doc.get('temperature', 'N/A')}°C | "
                f"💧 Humidity: {doc.get('humidity', 'N/A')}%\n"
                f"🌱 Soil: {doc.get('soilMoisture', 'N/A')}%\n"
                f"⚙️ Irrigating: {'Yes' if doc.get('isIrrigating') else 'No'}\n"
                f"--------------------------\n"
            )
        await update.message.reply_text(response_message, parse_mode='HTML')
    except Exception as e:
        await update.message.reply_text(f"Error fetching data: {str(e)}")

async def chat_with_ai(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    user_message = update.message.text
    
    user_doc = users_collection.find_one({"telegram_id": user.id})
    user_name = user_doc.get("first_name", "there") if user_doc else user.first_name
    
    await context.bot.send_chat_action(chat_id=update.effective_chat.id, action="typing")
    
    latest_sensor = sensor_collection.find_one(sort=[("timestamp", -1)])
    sensor_summary = "None"
    if latest_sensor:
        sensor_summary = (
            f"Temp: {latest_sensor.get('temperature')}°C, "
            f"Humidity: {latest_sensor.get('humidity')}%, "
            f"Soil: {latest_sensor.get('soilMoisture')}%, "
            f"Irrigating: {latest_sensor.get('isIrrigating')}"
        )

    prompt = f"""
    You are a professional Agro-Management Assistant. 
    User's Name: {user_name}
    Latest Farm Status: {sensor_summary}
    
    Instructions:
    1. Greet the user by name.
    2. Be concise and professional. Do not be alarmist.
    3. Only reference the "Latest Farm Status" if the user explicitly asks about the farm, or if the sensor readings are all 0 (indicating a malfunction).
    4. Otherwise, act as a general helpful assistant.
    
    User Query: {user_message}
    """
    
    try:
        response = client_ai.models.generate_content(
            model='models/gemini-2.5-flash', 
            contents=prompt,
        )
        await update.message.reply_text(response.text)
    except Exception as e:
        print(f"--- ERROR: {e} ---")
        await update.message.reply_text("I'm sorry, I'm having trouble processing that request.")

if __name__ == '__main__':
    application = ApplicationBuilder().token(TELEGRAM_TOKEN).build()
    
    # Handlers
    application.add_handler(CommandHandler('start', start))
    application.add_handler(CommandHandler('getdata', get_data))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, chat_with_ai))
    
    print("Bot is running...")
    application.run_polling()