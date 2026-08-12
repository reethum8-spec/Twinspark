// Natural Language Smart Parser & Product Spec Generator for TwinSpark
import { PRESETS, BATTERY_CHEMISTRIES, WIRELESS_PROTOCOLS } from '../data/presets';

export function parseProductDescription(promptText) {
  if (!promptText || promptText.trim().length === 0) {
    return PRESETS[0]; // Default to Smart Agriculture
  }

  const text = promptText.toLowerCase();

  // Check direct matches with preset keywords
  if (text.includes('agriculture') || text.includes('soil') || text.includes('moisture') || text.includes('plant') || text.includes('lora')) {
    return customizeFromBase(PRESETS[0], text);
  } else if (text.includes('wearable') || text.includes('watch') || text.includes('fitness') || text.includes('heart') || text.includes('ble') || text.includes('wrist')) {
    return customizeFromBase(PRESETS[1], text);
  } else if (text.includes('asset') || text.includes('cargo') || text.includes('gps') || text.includes('vehicle') || text.includes('tracker') || text.includes('cellular')) {
    return customizeFromBase(PRESETS[2], text);
  } else if (text.includes('door') || text.includes('window') || text.includes('security') || text.includes('zigbee') || text.includes('matter') || text.includes('reed')) {
    return customizeFromBase(PRESETS[3], text);
  } else if (text.includes('paper') || text.includes('display') || text.includes('climate') || text.includes('co2') || text.includes('room') || text.includes('desk')) {
    return customizeFromBase(PRESETS[4], text);
  }

  // Generic custom spec synthesis
  const baseSpec = JSON.parse(JSON.stringify(PRESETS[0]));
  baseSpec.id = 'custom-ai-generated';
  baseSpec.name = `✨ Custom Product: ${promptText.slice(0, 30)}...`;
  baseSpec.description = `Auto-generated specification based on "${promptText}"`;

  // Battery detection
  if (text.includes('cr2032') || text.includes('coin cell')) {
    baseSpec.battery = { ...BATTERY_CHEMISTRIES[0], nominalCapacitymAh: 225, nominalVoltage: 3.0, deratingFactor: 0.75, selfDischargePercentPerYear: 1.0, powerEfficiency: 0.95 };
  } else if (text.includes('18650') || text.includes('li-ion')) {
    baseSpec.battery = { ...BATTERY_CHEMISTRIES[1], nominalCapacitymAh: 3400, nominalVoltage: 3.7, deratingFactor: 0.85, selfDischargePercentPerYear: 18.0, powerEfficiency: 0.91 };
  } else if (text.includes('lipo') || text.includes('pouch')) {
    baseSpec.battery = { ...BATTERY_CHEMISTRIES[2], nominalCapacitymAh: 500, nominalVoltage: 3.7, deratingFactor: 0.90, selfDischargePercentPerYear: 24.0, powerEfficiency: 0.88 };
  } else if (text.includes('aa') || text.includes('alkaline')) {
    baseSpec.battery = { ...BATTERY_CHEMISTRIES[4], nominalCapacitymAh: 2400, nominalVoltage: 3.0, deratingFactor: 0.80, selfDischargePercentPerYear: 2.0, powerEfficiency: 0.89 };
  }

  // Wireless detection
  if (text.includes('wifi') || text.includes('wi-fi')) {
    baseSpec.wireless = { protocol: 'Wi-Fi 802.11 b/g/n', txCurrentmA: 180, rxCurrentmA: 85, sleepCurrentuA: 2.0, txIntervalSec: 900, txTimeSec: 2.0, rxTimeSec: 0.4 };
  } else if (text.includes('bluetooth') || text.includes('ble')) {
    baseSpec.wireless = { protocol: 'Bluetooth Low Energy 5.2', txCurrentmA: 5.0, rxCurrentmA: 4.8, sleepCurrentuA: 0.5, txIntervalSec: 10, txTimeSec: 0.005, rxTimeSec: 0.002 };
  } else if (text.includes('cellular') || text.includes('lte') || text.includes('nb-iot')) {
    baseSpec.wireless = { protocol: 'Cellular NB-IoT', txCurrentmA: 220, rxCurrentmA: 40, sleepCurrentuA: 3.5, txIntervalSec: 3600, txTimeSec: 6.0, rxTimeSec: 1.0 };
  }

  return baseSpec;
}

function customizeFromBase(preset, text) {
  const custom = JSON.parse(JSON.stringify(preset));
  
  // Extract numerical interval if present (e.g. "every 10 minutes", "every 5 seconds")
  const minMatch = text.match(/every\s+(\d+)\s*(min|minute)/);
  if (minMatch) {
    const mins = parseInt(minMatch[1], 10);
    custom.schedule.cyclePeriodSec = mins * 60;
    custom.wireless.txIntervalSec = mins * 60;
  }
  const secMatch = text.match(/every\s+(\d+)\s*(sec|second)/);
  if (secMatch) {
    const secs = parseInt(secMatch[1], 10);
    custom.schedule.cyclePeriodSec = secs;
    custom.wireless.txIntervalSec = secs;
  }

  return custom;
}
