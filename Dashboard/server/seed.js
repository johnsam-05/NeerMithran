require('dotenv').config();
const mongoose = require('mongoose');
const SensorReading = require('./models/SensorReading');

const weatherStates = ['sunny', 'cloudy', 'partly_cloudy', 'rainy', 'overcast'];
const advisories = [
  'Good conditions for field work.',
  'Consider delaying irrigation due to expected rain.',
  'Protect crops from excess heat.',
  'Ideal conditions for planting.',
  'Monitor soil moisture closely today.',
  'Rain expected - reduce irrigation schedule.',
  'High humidity may increase disease risk.',
  'Good day for fertilizer application.'
];

function randomInRange(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function generateReading(timestamp) {
  const hour = timestamp.getHours();
  const baseTemp = hour >= 6 && hour <= 18 
    ? randomInRange(25, 38) 
    : randomInRange(18, 26);
  
  const soil = randomInRange(20, 85);
  const relay = soil < 35 ? 1 : 0;

  return {
    temperature: baseTemp,
    humidity: randomInRange(40, 90),
    distance: randomInRange(20, 180), 
    voltage: randomInRange(3.2, 4.2),
    soil: soil,
    relay: relay,
    tomorrow_weather: {
      temperature: randomInRange(22, 36),
      humidity: randomInRange(45, 85),
      rain_probability: randomInRange(0, 100),
      state: weatherStates[Math.floor(Math.random() * weatherStates.length)],
      advisory: advisories[Math.floor(Math.random() * advisories.length)]
    },
    timestamp: timestamp
  };
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    await SensorReading.deleteMany({});
    console.log('🗑️  Cleared existing sensor readings');

    const readings = [];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    let current = new Date(sevenDaysAgo);
    while (current <= now) {
      readings.push(generateReading(new Date(current)));
      current = new Date(current.getTime() + 10 * 60 * 1000); 
    }

    await SensorReading.insertMany(readings);
    console.log(`📊 Seeded ${readings.length} sensor readings (7 days of data)`);
    
    const last = readings[readings.length - 1];
    console.log('\n📋 Last reading:');
    console.log(`   🌡️  Temperature: ${last.temperature}°C`);
    console.log(`   💧 Humidity: ${last.humidity}%`);
    console.log(`   🌱 Soil Moisture: ${last.soil}%`);
    console.log(`   📏 Distance: ${last.distance}cm`);
    console.log(`   🔋 Voltage: ${last.voltage}V`);
    console.log(`   🚿 Relay: ${last.relay === 1 ? 'ON' : 'OFF'}`);

    await mongoose.disconnect();
    console.log('\n✅ Seeding complete! Disconnected from MongoDB.');
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
