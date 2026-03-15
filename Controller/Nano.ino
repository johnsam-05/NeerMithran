#include <DHT.h>

#define DHTPIN 3
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

const int trigPin = 9;
const int echoPin = 10;
const int relayPin = 8;
const int voltagePin = A1;
const int soilPin = A3;

long duration;
float distance;
int relayState = 0;

float tankHeight = 11.0;   // Tank height in cm

void setup()
{
  Serial.begin(9600);

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(relayPin, OUTPUT);

  dht.begin();
}

void loop()
{
  // ---- SERIAL COMMAND FOR RELAY ----
  if (Serial.available() > 0)
  {
    char cmd = Serial.read();

    if (cmd == '1')
    {
      relayState = 1;
      digitalWrite(relayPin, HIGH);
    }
    else if (cmd == '0')
    {
      relayState = 0;
      digitalWrite(relayPin, LOW);
    }
  }

  // ---- DHT11 ----
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  // ---- ULTRASONIC ----
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);

  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH);
  distance = duration * 0.034 / 2;

  // Convert distance to tank percentage
  float waterPercent = (distance / tankHeight) * 100;
  if (waterPercent > 100) waterPercent = 100;
  if (waterPercent < 0) waterPercent = 0;

  // ---- VOLTAGE SENSOR ----
  int rawVoltage = analogRead(voltagePin);
  float voltage = rawVoltage * (5.0 / 1023.0);

  // ---- SOIL MOISTURE ----
  int soilRaw = analogRead(soilPin);

  // Convert soil moisture to %
  int soilPercent = map(soilRaw, 1023, 300, 0, 100);
  soilPercent = constrain(soilPercent, 0, 100);

  // ---- SERIAL OUTPUT ----
  Serial.print("T:");
  Serial.print(temperature);

  Serial.print(",H:");
  Serial.print(humidity);

  Serial.print(",D:");
  Serial.print(100-waterPercent);   // distance as %

  Serial.print(",V:");
  Serial.print((voltage * 9.5) * 10);

  Serial.print(",S:");
  Serial.print(soilPercent);    // soil moisture %

  Serial.print(",R:");
  Serial.println(relayState);

  delay(2000);
}