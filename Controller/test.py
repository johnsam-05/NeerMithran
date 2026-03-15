
import serial
import requests
from pymongo import MongoClient
from datetime import datetime


client = MongoClient("mongodb+srv://johnsamv2:19122005@john.kwymavx.mongodb.net/")
db = client["agrosmart"]
collection = db["sensor_readings"]


ser = serial.Serial('COM4', 9600, timeout=1)


API_KEY = "ce88574a083cb02732a13ab311bfcf27"
CITY = "Srivilliputhur"

URL = f"https://api.openweathermap.org/data/2.5/forecast?q={CITY}&appid={API_KEY}&units=metric"

print("System started...")


def get_tomorrow_weather():

    try:
        response = requests.get(URL)
        data = response.json()

        tomorrow = data["list"][8]

        temp = tomorrow["main"]["temp"]
        humidity = tomorrow["main"]["humidity"]
        rain_prob = tomorrow.get("pop", 0) * 100
        weather_main = tomorrow["weather"][0]["main"].lower()

        if "rain" in weather_main or rain_prob > 50:
            state = "rainy"
        elif "cloud" in weather_main:
            state = "cloudy"
        else:
            state = "sunny"

        if state == "sunny":

            message = (
                f"Tomorrow's weather is expected to be sunny with temperature around {temp} C "
                f"and humidity around {humidity} percent. Rain chance is low ({int(rain_prob)} percent). "
                f"Irrigation may be required to maintain soil moisture."
            )

        elif state == "cloudy":

            message = (
                f"Tomorrow's weather is expected to be partly cloudy with temperature around {temp} C "
                f"and humidity around {humidity} percent. Rain chance is low ({int(rain_prob)} percent). "
                f"Moderate irrigation may be sufficient."
            )

        else:

            message = (
                f"Tomorrow's weather is expected to bring rain with temperature around {temp} C "
                f"and humidity around {humidity} percent. Rain probability is high "
                f"({int(rain_prob)} percent). Irrigation can be reduced."
            )

        return {
            "temperature": temp,
            "humidity": humidity,
            "rain_probability": rain_prob,
            "state": state,
            "advisory": message
        }

    except Exception as e:

        print("Weather API error:", e)

        return {
            "temperature": None,
            "humidity": None,
            "rain_probability": None,
            "state": "unknown",
            "advisory": "Weather data unavailable."
        }


weather_data = get_tomorrow_weather()


def decide_pump(soil_percent, weather_state):

    if weather_state == "sunny":

        if soil_percent < 45:
            return 1
        else:
            return 0

    elif weather_state == "cloudy":

        if soil_percent < 35:
            return 1
        else:
            return 0

    elif weather_state == "rainy":

        if soil_percent < 25:
            return 1
        else:
            return 0

    else:
        return 0



while True:

    line = ser.readline().decode('utf-8').strip()

    if line:

        print("Received:", line)

        try:

            parts = line.split(',')
            data = {}

            for p in parts:
                k, v = p.split(':')
                data[k] = v

            soil_percent = int(data['S'])

            weather_state = weather_data["state"]

            pump_state = decide_pump(soil_percent, weather_state)

            if pump_state == 1:
                ser.write(b'1\n')
                print("Pump ON")

            else:
                ser.write(b'0\n')
                print("Pump OFF")

            document = {

                "temperature": float(data['T']),
                "humidity": float(data['H']),
                "distance": float(data['D']),
                "voltage": float(data['V']),
                "soil": soil_percent,
                "relay": pump_state,

                "tomorrow_weather": weather_data,

                "timestamp": datetime.now()
            }

            collection.insert_one(document)

            print("Saved to MongoDB")

        except Exception as e:

            print("Parse error:", e)