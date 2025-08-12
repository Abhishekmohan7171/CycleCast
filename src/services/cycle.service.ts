import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CycleData, Symptom, UserProfile, CyclePrediction, AnalyticsData } from '../models/cycle.model';

@Injectable({
  providedIn: 'root'
})
export class CycleService {
  private readonly STORAGE_KEYS = {
    CYCLES: 'cycle_data',
    SYMPTOMS: 'symptoms_data',
    PROFILE: 'user_profile'
  };

  // Signals for reactive data
  cycles = signal<CycleData[]>([]);
  symptoms = signal<Symptom[]>([]);
  userProfile = signal<UserProfile | null>(null);
  currentPrediction = signal<CyclePrediction | null>(null);

  constructor() {
    this.loadFromStorage();
    this.updatePrediction();
  }

  // Load data from localStorage
  private loadFromStorage(): void {
    const cycles = localStorage.getItem(this.STORAGE_KEYS.CYCLES);
    const symptoms = localStorage.getItem(this.STORAGE_KEYS.SYMPTOMS);
    const profile = localStorage.getItem(this.STORAGE_KEYS.PROFILE);

    if (cycles) {
      const parsedCycles = JSON.parse(cycles).map((cycle: any) => ({
        ...cycle,
        startDate: new Date(cycle.startDate),
        endDate: cycle.endDate ? new Date(cycle.endDate) : undefined
      }));
      this.cycles.set(parsedCycles);
    }

    if (symptoms) {
      const parsedSymptoms = JSON.parse(symptoms).map((symptom: any) => ({
        ...symptom,
        date: new Date(symptom.date)
      }));
      this.symptoms.set(parsedSymptoms);
    }

    if (profile) {
      const parsedProfile = JSON.parse(profile);
      if (parsedProfile.lastPeriodDate) {
        parsedProfile.lastPeriodDate = new Date(parsedProfile.lastPeriodDate);
      }
      parsedProfile.createdAt = new Date(parsedProfile.createdAt);
      this.userProfile.set(parsedProfile);
    }
  }

  // Save data to localStorage
  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEYS.CYCLES, JSON.stringify(this.cycles()));
    localStorage.setItem(this.STORAGE_KEYS.SYMPTOMS, JSON.stringify(this.symptoms()));
    if (this.userProfile()) {
      localStorage.setItem(this.STORAGE_KEYS.PROFILE, JSON.stringify(this.userProfile()));
    }
  }

  // Initialize user profile
  initializeProfile(profile: Partial<UserProfile>): void {
    const defaultProfile: UserProfile = {
      averageCycleLength: 28,
      averagePeriodLength: 5,
      createdAt: new Date(),
      theme: 'light',
      notifications: {
        periodReminder: true,
        ovulationReminder: true,
        pmsAlert: true
      },
      ...profile
    };
    
    this.userProfile.set(defaultProfile);
    this.saveToStorage();
    this.updatePrediction();
  }

  // Add new cycle
  addCycle(cycle: Omit<CycleData, 'id'>): void {
    const newCycle: CycleData = {
      ...cycle,
      id: Date.now().toString()
    };
    
    const currentCycles = this.cycles();
    this.cycles.set([...currentCycles, newCycle].sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    ));
    
    this.saveToStorage();
    this.updatePrediction();
  }

  // Add symptom
  addSymptom(symptom: Omit<Symptom, 'id'>): void {
    const newSymptom: Symptom = {
      ...symptom,
      id: Date.now().toString()
    };
    
    const currentSymptoms = this.symptoms();
    this.symptoms.set([...currentSymptoms, newSymptom].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
    
    this.saveToStorage();
  }

  // Calculate cycle prediction
  private updatePrediction(): void {
    const profile = this.userProfile();
    const cycles = this.cycles();
    
    if (!profile || cycles.length === 0) {
      this.currentPrediction.set(null);
      return;
    }

    const lastCycle = cycles[0];
    const cycleLength = this.calculateAverageCycleLength();
    
    const nextPeriodDate = new Date(lastCycle.startDate);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength);
    
    const ovulationDate = new Date(nextPeriodDate);
    ovulationDate.setDate(ovulationDate.getDate() - 14);
    
    const fertileWindowStart = new Date(ovulationDate);
    fertileWindowStart.setDate(fertileWindowStart.getDate() - 5);
    
    const fertileWindowEnd = new Date(ovulationDate);
    fertileWindowEnd.setDate(fertileWindowEnd.getDate() + 1);
    
    const today = new Date();
    const daysUntilNext = Math.ceil((nextPeriodDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    const currentCycleDay = Math.ceil((today.getTime() - lastCycle.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    this.currentPrediction.set({
      nextPeriodDate,
      ovulationDate,
      fertileWindowStart,
      fertileWindowEnd,
      daysUntilNext,
      currentCycleDay: Math.max(1, currentCycleDay)
    });
  }

  // Calculate average cycle length
  private calculateAverageCycleLength(): number {
    const cycles = this.cycles();
    if (cycles.length < 2) {
      return this.userProfile()?.averageCycleLength || 28;
    }

    let totalDays = 0;
    let validCycles = 0;

    for (let i = 0; i < cycles.length - 1; i++) {
      const current = cycles[i];
      const next = cycles[i + 1];
      
      const daysDiff = Math.round((current.startDate.getTime() - next.startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 0 && daysDiff <= 45) {
        totalDays += daysDiff;
        validCycles++;
      }
    }

    return validCycles > 0 ? Math.round(totalDays / validCycles) : this.userProfile()?.averageCycleLength || 28;
  }

  // Get analytics data
  getAnalytics(): AnalyticsData {
    const cycles = this.cycles();
    const symptoms = this.symptoms();
    
    const averageCycleLength = this.calculateAverageCycleLength();
    
    // Calculate regularity (lower variance = more regular)
    const cycleLengths = [];
    for (let i = 0; i < cycles.length - 1; i++) {
      const current = cycles[i];
      const next = cycles[i + 1];
      const daysDiff = Math.round((current.startDate.getTime() - next.startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 0 && daysDiff <= 45) {
        cycleLengths.push(daysDiff);
      }
    }
    
    const variance = cycleLengths.length > 1 ? 
      cycleLengths.reduce((acc, length) => acc + Math.pow(length - averageCycleLength, 2), 0) / cycleLengths.length : 0;
    const cycleRegularity = Math.max(0, 100 - variance * 2);

    // Common symptoms
    const symptomCounts: { [key: string]: number } = {};
    symptoms.forEach(symptom => {
      symptomCounts[symptom.type] = (symptomCounts[symptom.type] || 0) + 1;
    });

    // Average period duration
    const periodDurations = cycles.filter(c => c.endDate).map(c => {
      const start = new Date(c.startDate);
      const end = new Date(c.endDate!);
      return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    });
    const periodDuration = periodDurations.length > 0 ? 
      periodDurations.reduce((a, b) => a + b, 0) / periodDurations.length : 5;

    return {
      averageCycleLength,
      cycleRegularity: Math.round(cycleRegularity),
      commonSymptoms: symptomCounts,
      periodDuration: Math.round(periodDuration),
      lastSixCycles: cycles.slice(0, 6)
    };
  }

  // Get symptoms for a specific date
  getSymptomsForDate(date: Date): Symptom[] {
    return this.symptoms().filter(symptom => {
      const symptomDate = new Date(symptom.date);
      return symptomDate.toDateString() === date.toDateString();
    });
  }

  // Check if date is in period
  isDateInPeriod(date: Date): boolean {
    return this.cycles().some(cycle => {
      const start = new Date(cycle.startDate);
      const end = cycle.endDate ? new Date(cycle.endDate) : new Date(start.getTime() + 5 * 24 * 60 * 60 * 1000);
      return date >= start && date <= end;
    });
  }

  // Clear all data
  clearAllData(): void {
    this.cycles.set([]);
    this.symptoms.set([]);
    this.userProfile.set(null);
    this.currentPrediction.set(null);
    localStorage.removeItem(this.STORAGE_KEYS.CYCLES);
    localStorage.removeItem(this.STORAGE_KEYS.SYMPTOMS);
    localStorage.removeItem(this.STORAGE_KEYS.PROFILE);
  }
}