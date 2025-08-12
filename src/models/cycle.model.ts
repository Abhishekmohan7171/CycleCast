export interface CycleData {
  id: string;
  startDate: Date;
  endDate?: Date;
  flowIntensity: 'light' | 'medium' | 'heavy';
  tags: string[];
  notes?: string;
}

export interface Symptom {
  id: string;
  date: Date;
  type: string;
  intensity: number; // 1-5 scale
  notes?: string;
}

export interface UserProfile {
  averageCycleLength: number;
  averagePeriodLength: number;
  lastPeriodDate?: Date;
  createdAt: Date;
  theme: 'light' | 'dark';
  notifications: {
    periodReminder: boolean;
    ovulationReminder: boolean;
    pmsAlert: boolean;
  };
}

export interface CyclePrediction {
  nextPeriodDate: Date;
  ovulationDate: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  daysUntilNext: number;
  currentCycleDay: number;
}

export interface AnalyticsData {
  averageCycleLength: number;
  cycleRegularity: number;
  commonSymptoms: { [key: string]: number };
  periodDuration: number;
  lastSixCycles: CycleData[];
}