// Comprehensive Presets for Battery-Powered Electronic Products in TwinSpark

export const PRESETS = [
  {
    id: 'agri-lora',
    name: '🌿 Smart Agriculture Soil Sensor',
    category: 'Environmental & IoT',
    description: 'Ultra-low power soil moisture, humidity, and temperature node communicating via LoRaWAN.',
    controller: {
      name: 'STM32L433 (ARM Cortex-M4)',
      activeCurrentmA: 4.2, // 4.2 mA active @ 8 MHz
      sleepCurrentuA: 0.8, // 0.8 uA Stop 2 mode
      activeTimeSec: 1.2, // 1.2s to initialize, process, and package payload
      voltage: 3.3,
    },
    sensors: [
      { id: 's1', name: 'Capacitive Soil Moisture', activeCurrentmA: 12.0, idleCurrentuA: 0, activeTimeSec: 0.5 },
      { id: 's2', name: 'SHT40 Temp & Humidity', activeCurrentmA: 0.45, idleCurrentuA: 0.1, activeTimeSec: 0.01 },
      { id: 's3', name: 'Solar Irradiance Photo-diode', activeCurrentmA: 0.15, idleCurrentuA: 0, activeTimeSec: 0.1 },
    ],
    wireless: {
      protocol: 'LoRaWAN (SX1262)',
      txCurrentmA: 45.0, // 45 mA @ +14 dBm
      rxCurrentmA: 5.4, // 5.4 mA in RX mode
      sleepCurrentuA: 0.1,
      txIntervalSec: 1800, // Transmit payload every 30 minutes
      txTimeSec: 0.8, // SF7 packet duration ~0.8s
      rxTimeSec: 0.2, // RX window 0.2s
    },
    battery: {
      chemistry: 'LiSOCl2 (Lithium Thionyl Chloride)',
      type: 'ER14505 AA Cell',
      nominalCapacitymAh: 2600,
      nominalVoltage: 3.6,
      selfDischargePercentPerYear: 1.0,
      deratingFactor: 0.85, // temperature derating & passivation allowance
      powerEfficiency: 0.92, // High-efficiency buck-boost converter
    },
    schedule: {
      cyclePeriodSec: 1800, // 30 mins
    },
    enclosure3D: {
      type: 'outdoor-pod',
      shape: 'cylinder',
      lengthMm: 42,
      widthMm: 42,
      heightMm: 120,
      wallThicknessMm: 2.5,
      pcbLengthMm: 36,
      pcbWidthMm: 36,
      pcbColor: '#10b981', // Emerald green
    },
    components3D: [
      { id: 'mcu', name: 'STM32L433 MCU', type: 'chip', color: '#1e293b', width: 10, length: 10, height: 1.5, x: 0, y: 1.5, z: 0 },
      { id: 'lora', name: 'SX1262 LoRa Module', type: 'module', color: '#0284c7', width: 14, length: 14, height: 2.5, x: -10, y: 2.0, z: -8 },
      { id: 'battery', name: 'ER14505 AA LiSOCl2 Cell', type: 'cylinder-battery', color: '#eab308', radius: 7.2, height: 50.5, x: 0, y: -26, z: 0, rotation: [0, 0, Math.PI / 2] },
      { id: 'sensor-probe', name: 'Capacitive Probe Header', type: 'connector', color: '#64748b', width: 8, length: 6, height: 8, x: 0, y: -4, z: 12 },
    ]
  },
  {
    id: 'wearable-health',
    name: '⌚ Wearable Fitness & Health Tracker',
    category: 'Wearable Tech',
    description: 'Compact wrist-worn health band with continuous heart rate, SpO2, step counting, and BLE 5.2 sync.',
    controller: {
      name: 'nRF52840 (BLE 5.2 SoC)',
      activeCurrentmA: 3.8, // 3.8 mA @ 64MHz
      sleepCurrentuA: 1.5, // System OFF with RAM retention
      activeTimeSec: 0.1,
      voltage: 3.0,
    },
    sensors: [
      { id: 's1', name: 'PPG Heart Rate & SpO2 Optical', activeCurrentmA: 18.5, idleCurrentuA: 2.0, activeTimeSec: 0.2 },
      { id: 's2', name: '6-Axis IMU (Acc + Gyro)', activeCurrentmA: 0.9, idleCurrentuA: 0.003, activeTimeSec: 1.0 }, // Continuous step count
    ],
    wireless: {
      protocol: 'Bluetooth Low Energy 5.2',
      txCurrentmA: 4.8, // 4.8 mA @ 0 dBm TX
      rxCurrentmA: 4.6,
      sleepCurrentuA: 0.4,
      txIntervalSec: 5, // BLE advertising / sync interval
      txTimeSec: 0.005, // 5ms burst packet
      rxTimeSec: 0.002,
    },
    battery: {
      chemistry: 'LiPo Rechargeable Pouch',
      type: 'Custom 3.7V Pouch',
      nominalCapacitymAh: 180,
      nominalVoltage: 3.7,
      selfDischargePercentPerYear: 24.0, // ~2% / month
      deratingFactor: 0.90,
      powerEfficiency: 0.88, // LDO / PMIC efficiency
    },
    schedule: {
      cyclePeriodSec: 5, // 5 second repetition window
    },
    enclosure3D: {
      type: 'wearable',
      shape: 'rounded-rect',
      lengthMm: 44,
      widthMm: 28,
      heightMm: 11,
      wallThicknessMm: 1.8,
      pcbLengthMm: 38,
      pcbWidthMm: 24,
      pcbColor: '#0f172a', // Matte black
    },
    components3D: [
      { id: 'mcu', name: 'nRF52840 SoC', type: 'chip', color: '#3b82f6', width: 7, length: 7, height: 1.0, x: -8, y: 1.0, z: -2 },
      { id: 'ppg', name: 'MAX30102 PPG Sensor', type: 'optical-sensor', color: '#dc2626', width: 5, length: 3.5, height: 1.2, x: 8, y: 1.0, z: 0 },
      { id: 'imu', name: 'BMI270 6-Axis IMU', type: 'chip', color: '#10b981', width: 3, length: 3, height: 0.9, x: -8, y: 1.0, z: 6 },
      { id: 'battery', name: 'LiPo Pouch (180mAh)', type: 'pouch-battery', color: '#94a3b8', width: 32, length: 20, height: 3.8, x: 0, y: -3.0, z: 0 },
      { id: 'pmic', name: 'Charger & PMIC IC', type: 'chip', color: '#8b5cf6', width: 3, length: 3, height: 0.8, x: 8, y: 1.0, z: -6 }
    ]
  },
  {
    id: 'asset-gps',
    name: '🏷️ GPS & Cellular Asset Tracker Pod',
    category: 'Logistics & Security',
    description: 'Rugged vehicle & cargo tracker using GNSS positioning and Cellular NB-IoT cloud updates.',
    controller: {
      name: 'ESP32-S3 Dual-Core MCU',
      activeCurrentmA: 65.0, // 65 mA @ 240MHz
      sleepCurrentuA: 10.0, // Deep sleep mode
      activeTimeSec: 5.0,
      voltage: 3.3,
    },
    sensors: [
      { id: 's1', name: 'u-blox MAX-M10Q GNSS/GPS', activeCurrentmA: 25.0, idleCurrentuA: 15.0, activeTimeSec: 20.0 }, // 20s lock time
      { id: 's2', name: '3-Axis Vibration / Motion', activeCurrentmA: 0.05, idleCurrentuA: 0.002, activeTimeSec: 20.0 },
    ],
    wireless: {
      protocol: 'Cellular NB-IoT / LTE-M',
      txCurrentmA: 220.0, // 220 mA peak transmission
      rxCurrentmA: 40.0,
      sleepCurrentuA: 3.5, // eDRX / PSM sleep mode
      txIntervalSec: 3600, // 1 hour reporting interval
      txTimeSec: 8.0, // NB-IoT socket connect & transmit ~8s
      rxTimeSec: 2.0,
    },
    battery: {
      chemistry: 'Li-Ion 18650 Cylindrical',
      type: '18650 Single Cell',
      nominalCapacitymAh: 3400,
      nominalVoltage: 3.7,
      selfDischargePercentPerYear: 18.0, // ~1.5% / month
      deratingFactor: 0.85,
      powerEfficiency: 0.91,
    },
    schedule: {
      cyclePeriodSec: 3600, // 1 Hour
    },
    enclosure3D: {
      type: 'rugged-box',
      shape: 'rectangular',
      lengthMm: 95,
      widthMm: 50,
      heightMm: 28,
      wallThicknessMm: 3.0,
      pcbLengthMm: 85,
      pcbWidthMm: 42,
      pcbColor: '#15803d', // Dark green
    },
    components3D: [
      { id: 'mcu', name: 'ESP32-S3-WROOM Module', type: 'module', color: '#1e293b', width: 18, length: 25.5, height: 3.2, x: -20, y: 2.0, z: 0 },
      { id: 'gps', name: 'u-blox GNSS Patch Antenna', type: 'ceramic-antenna', color: '#d97706', width: 15, length: 15, height: 4.0, x: 22, y: 3.0, z: 8 },
      { id: 'nbiot', name: 'Quectel BG95 NB-IoT Modem', type: 'module', color: '#334155', width: 20, length: 24, height: 2.8, x: 20, y: 2.0, z: -10 },
      { id: 'battery', name: '18650 Li-Ion Cell (3400mAh)', type: 'cylinder-battery', color: '#2563eb', radius: 9.0, height: 65.0, x: -5, y: -16.0, z: 0, rotation: [0, 0, Math.PI / 2] }
    ]
  },
  {
    id: 'door-sensor',
    name: '🚪 Smart Door & Window Sensor',
    category: 'Smart Home & Security',
    description: 'Ultra-long-life magnetic open/close sensor running on Zigbee 3.0 or Matter over Thread.',
    controller: {
      name: 'EFR32MG24 (Zigbee / Thread SoC)',
      activeCurrentmA: 4.4,
      sleepCurrentuA: 0.9,
      activeTimeSec: 0.08,
      voltage: 3.0,
    },
    sensors: [
      { id: 's1', name: 'Hall Effect Magnetic Switch', activeCurrentmA: 1.5, idleCurrentuA: 0.01, activeTimeSec: 0.01 },
      { id: 's2', name: 'Tamper Switch', activeCurrentmA: 0.05, idleCurrentuA: 0.0, activeTimeSec: 0.01 },
    ],
    wireless: {
      protocol: 'Zigbee 3.0 / Matter',
      txCurrentmA: 9.5, // 9.5 mA @ 0 dBm
      rxCurrentmA: 8.7,
      sleepCurrentuA: 0.2,
      txIntervalSec: 7200, // Periodic heartbeat every 2 hours (or instant on event)
      txTimeSec: 0.02, // 20ms Zigbee transmission burst
      rxTimeSec: 0.005,
    },
    battery: {
      chemistry: 'CR2032 Lithium Coin Cell',
      type: 'CR2032 Coin Cell',
      nominalCapacitymAh: 225,
      nominalVoltage: 3.0,
      selfDischargePercentPerYear: 1.0, // Very low self discharge ~1%/yr
      deratingFactor: 0.75, // High internal resistance under pulse loads derates capacity
      powerEfficiency: 0.96, // Direct power / ultra-low quiescent LDO
    },
    schedule: {
      cyclePeriodSec: 7200, // 2 Hours
    },
    enclosure3D: {
      type: 'compact-pod',
      shape: 'rounded-rect',
      lengthMm: 48,
      widthMm: 22,
      heightMm: 14,
      wallThicknessMm: 1.5,
      pcbLengthMm: 42,
      pcbWidthMm: 18,
      pcbColor: '#0284c7', // Cyan blue
    },
    components3D: [
      { id: 'mcu', name: 'EFR32MG24 SoC', type: 'chip', color: '#1e293b', width: 5, length: 5, height: 1.0, x: -10, y: 1.0, z: 0 },
      { id: 'hall', name: 'Hall Effect Sensor IC', type: 'chip', color: '#ef4444', width: 3, length: 2, height: 0.8, x: 14, y: 1.0, z: 0 },
      { id: 'battery', name: 'CR2032 Coin Cell Holder', type: 'coin-battery', color: '#cbd5e1', radius: 10.0, height: 3.2, x: 0, y: -4.0, z: 0 }
    ]
  },
  {
    id: 'epaper-monitor',
    name: '🌡️ E-Paper Indoor Climate Monitor',
    category: 'Consumer Electronics',
    description: 'Desk climate monitor featuring a 2.9" zero-power E-Paper display and Wi-Fi sensor telemetry.',
    controller: {
      name: 'ESP32-C3 RISC-V Wi-Fi/BLE',
      activeCurrentmA: 80.0, // 80 mA during Wi-Fi connection
      sleepCurrentuA: 5.0, // Deep sleep with timer wake
      activeTimeSec: 2.5,
      voltage: 3.3,
    },
    sensors: [
      { id: 's1', name: 'BME280 Temp/Humidity/Barometer', activeCurrentmA: 0.7, idleCurrentuA: 0.1, activeTimeSec: 0.1 },
      { id: 's2', name: 'NDIR CO2 Sensor (Low Power)', activeCurrentmA: 35.0, idleCurrentuA: 0.5, activeTimeSec: 1.5 },
      { id: 's3', name: '2.9" E-Paper Display Refresh', activeCurrentmA: 8.0, idleCurrentuA: 0.0, activeTimeSec: 1.2 },
    ],
    wireless: {
      protocol: 'Wi-Fi 802.11 b/g/n (2.4GHz)',
      txCurrentmA: 190.0, // Wi-Fi TX burst peak
      rxCurrentmA: 95.0,
      sleepCurrentuA: 1.0,
      txIntervalSec: 900, // 15 Minutes
      txTimeSec: 1.8, // Wi-Fi join + HTTP POST
      rxTimeSec: 0.4,
    },
    battery: {
      chemistry: 'Alkaline Dual Cell (2x AA)',
      type: '2x AA Batteries in Series',
      nominalCapacitymAh: 2400,
      nominalVoltage: 3.0,
      selfDischargePercentPerYear: 2.0,
      deratingFactor: 0.82,
      powerEfficiency: 0.89, // Buck-boost switching regulator
    },
    schedule: {
      cyclePeriodSec: 900, // 15 Minutes
    },
    enclosure3D: {
      type: 'desk-stand',
      shape: 'rectangular',
      lengthMm: 88,
      widthMm: 56,
      heightMm: 22,
      wallThicknessMm: 2.0,
      pcbLengthMm: 80,
      pcbWidthMm: 48,
      pcbColor: '#0f172a',
    },
    components3D: [
      { id: 'mcu', name: 'ESP32-C3 Module', type: 'module', color: '#1e293b', width: 16, length: 20, height: 3.0, x: -22, y: 1.5, z: 10 },
      { id: 'epaper-conn', name: 'E-Paper FPC Connector', type: 'connector', color: '#f59e0b', width: 22, length: 5, height: 1.2, x: 0, y: 1.5, z: -16 },
      { id: 'co2', name: 'SCD40 NDIR CO2 Sensor', type: 'sensor-block', color: '#475569', width: 10, length: 10, height: 7.0, x: 22, y: 4.0, z: 10 },
      { id: 'battery-holder', name: '2x AA Battery Holder', type: 'double-aa-battery', color: '#334155', width: 30, length: 52, height: 15, x: 0, y: -12.0, z: 0 }
    ]
  }
];

export const BATTERY_CHEMISTRIES = [
  { name: 'CR2032 Lithium Coin Cell', defaultCapacity: 225, voltage: 3.0, selfDischargeYr: 1.0, derating: 0.75, description: 'Ultra-compact, low pulse capability, non-rechargeable.' },
  { name: 'Li-Ion 18650 Cylindrical', defaultCapacity: 3400, voltage: 3.7, selfDischargeYr: 18.0, derating: 0.85, description: 'High energy density, rechargeable, high current peak delivery.' },
  { name: 'LiPo Rechargeable Pouch', defaultCapacity: 500, voltage: 3.7, selfDischargeYr: 24.0, derating: 0.90, description: 'Custom slim shape factor, rechargeable, flexible sizing.' },
  { name: 'LiSOCl2 (Primary Lithium)', defaultCapacity: 2600, voltage: 3.6, selfDischargeYr: 1.0, derating: 0.85, description: 'Extreme 10-20 year shelf life, wide temp range, primary non-rechargeable.' },
  { name: '2x AA Alkaline (Series)', defaultCapacity: 2400, voltage: 3.0, selfDischargeYr: 2.0, derating: 0.80, description: 'Ubiquitous low cost battery, voltage drops as it discharges.' },
  { name: 'LiFePO4 14500 (LFP)', defaultCapacity: 600, voltage: 3.2, selfDischargeYr: 3.0, derating: 0.92, description: 'Safe thermal stability, long cycle life (2000+ cycles).' },
  { name: 'Custom Power Source', defaultCapacity: 1000, voltage: 3.3, selfDischargeYr: 5.0, derating: 0.85, description: 'User customizable electrical parameters.' }
];

export const WIRELESS_PROTOCOLS = [
  { name: 'Bluetooth Low Energy 5.2', txCurrent: 4.8, rxCurrent: 4.6, sleepCurrent: 0.4, txTime: 0.005, description: 'Short range (10-50m), low power micro-bursts, smartphone connected.' },
  { name: 'LoRaWAN (Sub-GHz)', txCurrent: 45.0, rxCurrent: 5.4, sleepCurrent: 0.1, txTime: 0.8, description: 'Long range (2-15km), ultra-low power payload transmission.' },
  { name: 'Wi-Fi 802.11 b/g/n', txCurrent: 180.0, rxCurrent: 85.0, sleepCurrent: 2.0, txTime: 2.0, description: 'High bandwidth cloud connect, high peak active power draw.' },
  { name: 'Cellular NB-IoT / LTE-M', txCurrent: 220.0, rxCurrent: 40.0, sleepCurrent: 3.5, txTime: 6.0, description: 'Direct cellular carrier network connection for mobile assets.' },
  { name: 'Zigbee 3.0 / Matter', txCurrent: 9.5, rxCurrent: 8.7, sleepCurrent: 0.2, txTime: 0.02, description: 'Mesh network for smart homes, low latency node communication.' },
  { name: 'Sub-GHz Proprietary (433/868MHz)', txCurrent: 25.0, rxCurrent: 12.0, sleepCurrent: 0.2, txTime: 0.05, description: 'Custom RF link for point-to-point remote control & telemetry.' },
  { name: 'None (Standalone / Log Only)', txCurrent: 0.0, rxCurrent: 0.0, sleepCurrent: 0.0, txTime: 0.0, description: 'No wireless radio fitted.' }
];
