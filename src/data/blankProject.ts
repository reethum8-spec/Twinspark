import { ProductSpec } from '../types/twinspark';

export const BLANK_PROJECT_SPEC: ProductSpec = {
  id: 'blank-project-spec',
  name: '✨ New Custom Project',
  description: 'Blank slate project. Describe your product idea in plain English or add components manually below.',
  userPrompt: '',
  controller: undefined,
  sensors: [],
  display: undefined,
  wireless: undefined,
  outputs: [],
  battery: undefined,
  regulator: {
    id: 'regulator-default',
    name: 'Standard DC-DC Converter / LDO',
    category: 'regulator',
    activeCurrentmA: 0,
    peakCurrentmA: 0,
    sleepCurrentuA: 1.0,
    voltage: 3.3,
    efficiencyPercent: 90,
    description: 'Power regulation rail with adjustable efficiency percentage.',
    confidence: 'starter-estimate',
    sourceNote: 'Starter estimate (90% efficiency)'
  },
  customComponents: [],
  usableCapacityPercent: 85,
  regulatorEfficiencyPercent: 90,
  cyclePeriodSec: 600,
  states: [
    {
      id: 'st-sleep',
      name: 'Sleep',
      durationSec: 590,
      activeComponentIds: [],
      description: 'System low-power sleep interval.'
    },
    {
      id: 'st-active',
      name: 'Wake',
      durationSec: 10,
      activeComponentIds: [],
      description: 'System active wake interval.'
    }
  ],
  enclosure3D: {
    lengthMm: 80,
    widthMm: 50,
    heightMm: 25,
    shape: 'box',
    color: '#0f172a',
    hidden: false
  }
};
