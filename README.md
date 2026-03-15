# NeerMithran

## 🌱 Project Overview

`NeerMithran` is an end-to-end smart irrigation and farm monitoring system built with:
- Arduino/serial sensor stream ingest + control logic (`Controller/test.py`)
- Remote chat assistant via Telegram + AI-driven insights (`Controller/bot.py`)
- Node.js + Express API server with MongoDB persistence (`Dashboard/server/*`)
- React + Vite dashboard client for live monitoring and alerts (`Dashboard/client/*`)

The goal is to provide farmers with real-time sensor data, weather-aware irrigation recommendations, automated pump actuation, and human-friendly alerts.

## 🧩 Architecture

1. `Controller/test.py`
   - Reads sensor values from `COM4` serial (soil moisture, temperature, humidity, distance, voltage)
   - Fetches weather forecast from OpenWeatherMap for decision logic
   - Controls pump relay (ON/OFF) via serial write
   - Saves readings + computed weather advisory to MongoDB `neermithran.sensor_readings`

2. `Controller/bot.py`
   - Telegram bot with `/start`, `/getdata`, and conversational fallback
   - Connects to same MongoDB for latest readings and user tracking
   - Integrates Google Gemini AI API for natural-language farm assistance

3. `Dashboard/server/server.js`
   - Express API endpoints:
     - `GET /api/sensor/latest` (last reading)
     - `GET /api/sensor/history?hours=...` (historical graph data)
     - `GET /api/sensor/alerts` (risk/health alerts)
     - `GET /api/health`
   - MongoDB connection fallback (Atlas + local)
   - Serves React client static `../client/dist`

4. `Dashboard/client/src` (React app)
   - Polls server API every 5 seconds for latest state
   - Displays:
     - Sensor cards (soil, temp, humidity, water tank distance)
     - Graph trend (soil moisture)
     - Weather advisory, irrigation status, system health, alerts panel

## 🚀 Run Locally

### Server

1. `cd Dashboard/server`
2. `npm install`
3. Create `.env`:
   - `MONGODB_URI=<your-atlas-uri>`
   - `PORT=5000` (optional)
4. `npm run start`

### Client

1. `cd Dashboard/client`
2. `npm install`
3. `npm run dev`

### Controller (Serial + Logic)

1. Install Python deps (if required): `pip install pymongo requests python-dotenv python-telegram-bot google-ai` (or your preferred package names)
2. Ensure Mongo and COM port values are properly configured.
3. Run `python Controller/test.py`

### Telegram Bot

1. Create `.env` in project root or `Controller`:
   - `TELEGRAM_TOKEN=...`
   - `MONGO_URI=...`
   - `GEMINI_API_KEY=...`
2. `python Controller/bot.py`

## 🧪 Project Components

- `Dashboard/server/models/SensorReading.js` - schema mapping for reading records
- `Dashboard/client/src/components` - modular UI blocks:
  - `Header`, `SensorCard`, `CropControl`, `SoilTrendChart`, `WeatherAdvisory`, `IrrigationStatus`, `AlertsPanel`, `SystemHealth`

## 🔐 Environment Notes

- Keep tokens secret with `.env`; never push keys to GitHub.
- Use separate test DB for development.
- For production deploy, enable HTTPS + strong CORS policies.

## 📦 Optional Enhancements

- Add authentication for dashboard
- Add historical chart with unit switching
- Add correlation for rain forecast vs pump cycles
- Implement MQTT broker + edge computing for offline resilience

## 📝 Commit Message Suggestion

- `feat: add complete README and project documentation for NeerMithran telemetry + dashboard`

---

## 💡 Project Explanation (Summary)

`NeerMithran` is a smart agricultural monitoring service that connects physical sensors to a full-stack web and bot ecosystem. Sensor data is collected from a microcontroller, persisted in MongoDB, and consumed by API + UI for monitoring and actionable alerts, while a GPT-powered Telegram assistant offers farm guidance and quick data access.


