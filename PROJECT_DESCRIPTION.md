# NeerMithran Smart Agriculture IoT System

## Project Overview

NeerMithran is a full-stack smart agriculture solution designed to monitor field conditions, automate irrigation control, and deliver actionable insights via web dashboard and chat assistant. This project integrates hardware telemetry with backend data persistence, predictive weather-aware decisions, and a role-based interface for farm operators.

## Key Features

- Real-time sensor ingestion over serial from Arduino Nano (DHT11 temp/humidity, ultrasonic tank distance, soil moisture, voltage, relay state)
- Nano firmware supports serial commands to toggle relay and streams `T,H,D,V,S,R` payloads every 2 seconds
- Context-aware irrigation pump control based on soil readings + weather forecast
- MongoDB storage for time-series sensor readings and user session data
- REST API endpoints for latest state, history, health checks, and alert generation
- React/Vite dashboard with periodic polling, visualization, system status panels, and alert cards
- Telegram bot integration and AI-assisted conversational responses (Google Gemini)

## Architecture

1. `Controller/test.py` (Python)
   - Serial communication on `COM4`
   - OpenWeatherMap forecast query
   - Decides pump relay state (ON/OFF) by crop readiness plus weather
   - Persists dashboard data to MongoDB

2. `Controller/bot.py` (Python)
   - Telegram command handlers (`/start`, `/getdata`)
   - AI chat with farm context and latest sensor status
   - MongoDB user activity tracking and sensor lookup

3. `Dashboard/server/server.js` (Node.js + Express)
   - Sensor API: latest (`/api/sensor/latest`), history (`/api/sensor/history`), alerts (`/api/sensor/alerts`), health (`/api/health`)
   - MongoDB connection fallback (Atlas + local)
   - Static file serving for React client

4. `Dashboard/client` (React + Vite)
   - Live updates every 5 seconds for dashboard state
   - Charts, sensor cards, weather advisory, irrigation status, and system health

## Tech Stack

- Python (serial I/O, REST, bot automation)
- Node.js, Express, Mongoose
- React, Vite, Recharts, Axios
- MongoDB Atlas / local
- Telegram Bot API, Google Gemini (GenAI)

## LinkedIn Description (Suggested)

NeerMithran is my smart agriculture capstone project implementing an end-to-end IoT solution. It collects sensor data from edge hardware, applies weather-based irrigation heuristics, stores metrics in MongoDB, and exposes a live React dashboard plus Telegram AI-enabled assistant. I built full data flow, alerting logic, and UI/UX resilience in a production-like architecture.

## Why It Matters

This project demonstrates practical IoT integration for precision farming, optimizing resource usage (water/electricity) while preventing crop stress. It illustrates system design from embedded sensors to cloud-based analytics and user-facing interfaces, ready for proof-of-concept deployment.
