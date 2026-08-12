import { ComponentItem } from '../types/twinspark';

export const COMPONENT_DATABASE: Record<string, ComponentItem> = {
  // CONTROLLERS
  'esp32': {
    id: 'esp32',
    name: 'ESP32 Wi-Fi & BLE Dual-Core MCU',
    category: 'controller',
    activeCurrentmA: 80,
    peakCurrentmA: 220,
    sleepCurrentuA: 10,
    voltage: 3.3,
    description: 'Popular 240MHz dual-core microcontroller with built-in Wi-Fi and Bluetooth Low Energy.',
    defaultDurationSec: 0.5,
    confidence: 'starter-estimate',
    sourceNote: 'Starter estimate based on Espressif ESP32 Datasheet v4.1 (Verify against exact chip revision)',
    transform3D: { x: 15, y: 2.2, z: -8, length: 18, width: 25.5, height: 2.8, color: '#1e293b', shape: 'box' }
  },
  'nrf52840': {
    id: 'nrf52840',
    name: 'nRF52840 Ultra-Low-Power BLE SoC',
    category: 'controller',
    activeCurrentmA: 3.8,
    peakCurrentmA: 4.8,
    sleepCurrentuA: 1.5,
    voltage: 3.0,
    description: 'ARM Cortex-M4F SoC optimized for extreme ultra-low power BLE 5.2 connectivity.',
    defaultDurationSec: 0.2,
    confidence: 'starter-estimate',
    sourceNote: 'Starter estimate based on Nordic nRF52840 Product Specification v1.3',
    transform3D: { x: 10, y: 1.8, z: -5, length: 12, width: 12, height: 1.8, color: '#0284c7', shape: 'box' }
  },
  'stm32l4': {
    id: 'stm32l4',
    name: 'STM32L433 Ultra-Low-Power MCU',
    category: 'controller',
    activeCurrentmA: 4.2,
    peakCurrentmA: 8.0,
    sleepCurrentuA: 0.8,
    voltage: 3.3,
    description: 'ARM Cortex-M4 low-power processor ideal for long-life battery sensor nodes.',
    defaultDurationSec: 0.2,
    confidence: 'starter-estimate',
    sourceNote: 'Starter estimate based on STMicroelectronics STM32L433xx Datasheet DS11446',
    transform3D: { x: 10, y: 1.8, z: -5, length: 10, width: 10, height: 1.6, color: '#1e293b', shape: 'box' }
  },

  // SENSORS
  'dht22': {
    id: 'dht22',
    name: 'DHT22 Temperature & Humidity Sensor',
    category: 'sensor',
    activeCurrentmA: 1.5,
    peakCurrentmA: 2.5,
    sleepCurrentuA: 50,
    voltage: 3.3,
    description: 'Capacitive humidity and thermistor sensor with calibrated digital output.',
    defaultDurationSec: 2.0,
    confidence: 'starter-estimate',
    sourceNote: 'Starter estimate based on Aosong DHT22 Specification (Verify sample rate)',
    transform3D: { x: -20, y: 4.5, z: 12, length: 15, width: 12, height: 7.5, color: '#38bdf8', shape: 'box' }
  },
  'bme280': {
    id: 'bme280',
    name: 'BME280 Temp / Humidity / Barometer',
    category: 'sensor',
    activeCurrentmA: 0.7,
    peakCurrentmA: 1.0,
    sleepCurrentuA: 0.1,
    voltage: 3.3,
    description: 'Precision environmental sensor with sub-mA active current.',
    defaultDurationSec: 0.1,
    confidence: 'starter-estimate',
    sourceNote: 'Starter estimate based on Bosch BME280 Datasheet BST-BME280-DS002',
    transform3D: { x: -10, y: 2.5, z: 10, length: 8, width: 8, height: 3.0, color: '#10b981', shape: 'box' }
  },
  'pir-motion': {
    id: 'pir-motion',
    name: 'HC-SR501 PIR Motion Detector',
    category: 'sensor',
    activeCurrentmA: 0.06,
    peakCurrentmA: 0.1,
    sleepCurrentuA: 50,
    voltage: 3.3,
    description: 'Infrared motion sensor for occupancy and security alerts.',
    defaultDurationSec: 1.0,
    confidence: 'starter-estimate',
    sourceNote: 'Starter estimate based on HC-SR501 module specifications',
    transform3D: { x: -15, y: 4.0, z: -10, length: 12, width: 12, height: 6.0, color: '#f59e0b', shape: 'box' }
  },

  // DISPLAYS & OUTPUTS
  'oled-096': {
    id: 'oled-096',
    name: 'OLED 0.96-inch Display (SSD1306)',
    category: 'display',
    activeCurrentmA: 20.0,
    peakCurrentmA: 35.0,
    sleepCurrentuA: 10.0,
    voltage: 3.3,
    description: '128x64 self-illuminating monochrome OLED display panel.',
    defaultDurationSec: 5.0,
    confidence: 'starter-estimate',
    sourceNote: 'Starter estimate based on Solomon Systech SSD1306 Datasheet (Current depends on active pixel ratio)',
    transform3D: { x: 15, y: 1.8, z: 11, length: 26, width: 26, height: 1.5, color: '#0284c7', shape: 'box' }
  },
  'led-indicator': {
    id: 'led-indicator',
    name: 'Status Indicator LED',
    category: 'output',
    activeCurrentmA: 15.0,
    peakCurrentmA: 15.0,
    sleepCurrentuA: 0.0,
    voltage: 3.3,
    description: 'Standard 3mm/5mm indicator light-emitting diode with current-limiting resistor.',
    defaultDurationSec: 1.0,
    confidence: 'starter-estimate',
    sourceNote: 'Starter estimate assuming 150Ω resistor at 3.3V VCC',
    transform3D: { x: -2, y: 3.5, z: 18, radius: 2.5, shape: 'sphere', color: '#10b981' }
  },

  // BATTERIES
  'li-ion-2000': {
    id: 'li-ion-2000',
    name: 'Li-Ion Battery (3.7V 2000mAh)',
    category: 'battery',
    activeCurrentmA: 0,
    peakCurrentmA: 0,
    sleepCurrentuA: 0,
    voltage: 3.7,
    capacitymAh: 2000,
    maxContinuousDischargemA: 2000,
    selfDischargePercentYr: 15.0,
    description: 'Rechargeable single-cell lithium-ion battery pouch / cell.',
    confidence: 'starter-estimate',
    sourceNote: 'Starter estimate for standard 3.7V Li-Ion pouch cell',
    transform3D: { x: -18, y: -4.5, z: 0, length: 38, width: 24, height: 7.0, color: '#64748b', shape: 'pouch' }
  },
  'cr2032': {
    id: 'cr2032',
    name: 'CR2032 Coin Cell (3.0V 225mAh)',
    category: 'battery',
    activeCurrentmA: 0,
    peakCurrentmA: 0,
    sleepCurrentuA: 0,
    voltage: 3.0,
    capacitymAh: 225,
    maxContinuousDischargemA: 15.0,
    selfDischargePercentYr: 1.0,
    description: 'Compact primary lithium coin cell for low-power sensors.',
    confidence: 'starter-estimate',
    sourceNote: 'Starter estimate based on Energizer CR2032 Datasheet',
    transform3D: { x: 0, y: -3.0, z: 0, radius: 10.0, height: 3.2, color: '#cbd5e1', shape: 'disc' }
  },

  // REGULATORS
  'buck-regulator-90': {
    id: 'buck-regulator-90',
    name: 'High-Efficiency DC-DC Buck Regulator',
    category: 'regulator',
    activeCurrentmA: 0,
    peakCurrentmA: 0,
    sleepCurrentuA: 2.0,
    voltage: 3.3,
    efficiencyPercent: 90,
    description: 'Switching step-down voltage converter supplying 3.3V rails at 90% default efficiency.',
    confidence: 'starter-estimate',
    sourceNote: 'Starter estimate assuming TPS62740 or similar buck converter at 90% efficiency',
    transform3D: { x: 0, y: 1.5, z: -15, length: 6, width: 6, height: 1.2, color: '#8b5cf6', shape: 'box' }
  }
};
