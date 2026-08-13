import { ProductSpec } from '../types/twinspark';
import { COMPONENT_DATABASE } from './componentDatabase';

export const SAMPLE_PORTABLE_SMART_DEVICE: ProductSpec = {
  id: 'portable-smart-device-sample',
  name: 'Portable Smart Device',
  description: 'Battery-powered portable smart device that reads environmental sensors, updates an OLED screen, flashes a status LED, and sends data via Wi-Fi every 10 minutes.',
  userPrompt: 'I want to build a battery-powered portable smart device that sends sensor data through Wi-Fi every 10 minutes.',
  controller: { ...COMPONENT_DATABASE['esp32'] },
  sensors: [{ ...COMPONENT_DATABASE['dht22'] }],
  display: { ...COMPONENT_DATABASE['oled-096'] },
  wireless: { ...COMPONENT_DATABASE['esp32'] }, // ESP32 built-in Wi-Fi
  outputs: [{ ...COMPONENT_DATABASE['led-indicator'] }],
  battery: { ...COMPONENT_DATABASE['li-ion-2000'] },
  regulator: { ...COMPONENT_DATABASE['buck-regulator-90'] },
  usableCapacityPercent: 85, // 85% usable battery capacity (1700 mAh)
  regulatorEfficiencyPercent: 90, // 90% DC-DC converter efficiency
  cyclePeriodSec: 600, // 10 minutes total cycle period (600s)
  states: [
    {
      id: 'st-sleep',
      name: 'Sleep',
      durationSec: 590, // 590s deep sleep (~9.8 mins)
      activeComponentIds: [],
      description: 'Microcontroller and peripherals enter deep sleep mode to conserve battery energy.'
    },
    {
      id: 'st-wake',
      name: 'Wake',
      durationSec: 0.5,
      activeComponentIds: ['esp32'],
      description: 'MCU wakes up from timer interrupt and initializes clocks and memory.'
    },
    {
      id: 'st-read-sensor',
      name: 'Read Sensor',
      durationSec: 2.0,
      activeComponentIds: ['esp32', 'dht22'],
      description: 'ESP32 triggers DHT22 sensor measurement and reads digital temperature/humidity frame.'
    },
    {
      id: 'st-display',
      name: 'Display / Output',
      durationSec: 5.0,
      activeComponentIds: ['esp32', 'oled-096', 'led-indicator'],
      description: 'Updates 0.96" OLED screen with sensor readings and blinks status LED.'
    },
    {
      id: 'st-transmit',
      name: 'Transmit',
      durationSec: 2.5,
      activeComponentIds: ['esp32'],
      description: 'Establishes Wi-Fi WPA2 connection and transmits JSON telemetry payload to server.'
    }
  ],
  enclosure3D: {
    lengthMm: 85,
    widthMm: 55,
    heightMm: 24,
    shape: 'box',
    color: '#0f172a'
  }
};
