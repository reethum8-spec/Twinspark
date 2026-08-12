export type ComponentCategory = 'controller' | 'sensor' | 'display' | 'wireless' | 'output' | 'battery' | 'regulator' | 'custom';

export type ValueConfidence = 'starter-estimate' | 'verified-datasheet' | 'lab-measured' | 'custom-spec';

export interface ComponentTransform3D {
  x: number;
  y: number;
  z: number;
  rotX?: number;
  rotY?: number;
  rotZ?: number;
  length?: number;
  width?: number;
  height?: number;
  radius?: number;
  shape?: 'box' | 'cylinder' | 'pouch' | 'sphere' | 'disc';
  color?: string;
  hidden?: boolean;
}

export interface ComponentItem {
  id: string;
  name: string;
  category: ComponentCategory;
  activeCurrentmA: number;
  peakCurrentmA: number;
  sleepCurrentuA: number;
  voltage: number;
  description: string;
  defaultDurationSec?: number;
  capacitymAh?: number;
  maxContinuousDischargemA?: number;
  selfDischargePercentYr?: number;
  efficiencyPercent?: number;
  
  // Datasheet Provenance & Confidence
  confidence: ValueConfidence;
  sourceNote?: string;

  // Editable 3D Block Positioning & Dimensions
  transform3D?: ComponentTransform3D;
}

export interface OperatingState {
  id: string;
  name: 'Sleep' | 'Wake' | 'Read Sensor' | 'Process' | 'Transmit' | 'Display / Output' | 'Custom';
  durationSec: number;
  activeComponentIds: string[];
  description: string;
}

export interface ProductSpec {
  id: string;
  name: string;
  description: string;
  userPrompt?: string;
  controller?: ComponentItem;
  sensors: ComponentItem[];
  display?: ComponentItem;
  wireless?: ComponentItem;
  outputs: ComponentItem[];
  battery?: ComponentItem;
  regulator?: ComponentItem;
  customComponents?: ComponentItem[];
  usableCapacityPercent: number;
  regulatorEfficiencyPercent: number;
  cyclePeriodSec: number;
  states: OperatingState[];
  enclosure3D: {
    lengthMm: number;
    widthMm: number;
    heightMm: number;
    shape: 'box' | 'cylinder' | 'compact';
    color: string;
    hidden?: boolean;
  };
}

export interface SavedProjectVersion {
  id: string;
  name: string;
  timestamp: string;
  spec: ProductSpec;
}

export interface ComponentPowerShare {
  componentId: string;
  componentName: string;
  category: ComponentCategory;
  averageCurrentmA: number;
  percentageShare: number;
}

export interface StatePowerBreakdown {
  stateId: string;
  stateName: string;
  durationSec: number;
  stateCurrentmA: number;
  chargeContributionmAs: number;
}

export interface WarningItem {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  componentId?: string;
}

export interface PowerMetrics {
  totalCycleDurationSec: number;
  totalCycleChargemAs: number;
  avgLoadCurrentmA: number;
  adjustedAvgCurrentmA: number;
  peakCurrentmA: number;
  usableCapacitymAh: number;
  batteryLifeHours: number;
  batteryLifeDays: number;
  dailyEnergyConsumptionmAh: number;
  dailyEnergyConsumptionmWh: number;
  dutyCyclePercent: number;
  componentShares: ComponentPowerShare[];
  stateBreakdowns: StatePowerBreakdown[];
  warnings: WarningItem[];
}
