import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CycleService } from '../../services/cycle.service';

interface SymptomOption {
  type: string;
  emoji: string;
  category: string;
}

@Component({
  selector: 'app-log-symptoms',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 px-4 py-6">
      <div class="max-w-md mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <button 
            routerLink="/dashboard"
            class="p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <span class="text-xl">←</span>
          </button>
          <h1 class="text-xl font-semibold text-gray-800">Log Symptoms</h1>
          <div class="w-10 h-10"></div>
        </div>

        <form (ngSubmit)="saveSymptoms()" class="space-y-6">
          <!-- Date Selection -->
          <div class="card">
            <label class="block text-sm font-medium text-gray-700 mb-3">
              <span class="flex items-center space-x-2">
                <span class="text-lg">📅</span>
                <span>Date</span>
              </span>
            </label>
            <input
              type="date"
              [(ngModel)]="selectedDate"
              name="selectedDate"
              required
              [max]="today"
              class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-colors"
            >
          </div>

          <!-- Symptom Categories -->
          @for (category of symptomCategories; track category) {
            <div class="card">
              <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <span class="text-xl">{{ getCategoryEmoji(category) }}</span>
                <span>{{ category }}</span>
              </h3>
              
              <div class="grid grid-cols-1 gap-3">
                @for (symptom of getSymptomsByCategory(category); track symptom.type) {
                  <div class="p-4 border rounded-lg transition-all duration-200"
                       [class]="getSymptomIntensity(symptom.type) > 0 ? 
                         'border-secondary-300 bg-secondary-50' : 
                         'border-gray-200 hover:border-gray-300'">
                    
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center space-x-3">
                        <span class="text-xl">{{ symptom.emoji }}</span>
                        <span class="font-medium text-gray-700">{{ symptom.type }}</span>
                      </div>
                      <button
                        type="button"
                        (click)="toggleSymptom(symptom.type)"
                        class="w-6 h-6 rounded-full border-2 transition-all duration-200"
                        [class]="getSymptomIntensity(symptom.type) > 0 ? 
                          'border-secondary-500 bg-secondary-500' : 
                          'border-gray-300 hover:border-gray-400'"
                      >
                        @if (getSymptomIntensity(symptom.type) > 0) {
                          <span class="text-white text-xs">✓</span>
                        }
                      </button>
                    </div>
                    
                    @if (getSymptomIntensity(symptom.type) > 0) {
                      <div class="space-y-2">
                        <label class="block text-xs font-medium text-gray-600">
                          Intensity (1-5)
                        </label>
                        <div class="flex space-x-1">
                          @for (level of [1,2,3,4,5]; track level) {
                            <button
                              type="button"
                              (click)="setSymptomIntensity(symptom.type, level)"
                              class="w-8 h-8 rounded-full text-sm font-medium transition-all duration-200"
                              [class]="level <= getSymptomIntensity(symptom.type) ? 
                                'bg-yellow-400 text-yellow-900' : 
                                'bg-gray-200 text-gray-500 hover:bg-gray-300'"
                            >
                              {{ level }}
                            </button>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }

          <!-- Custom Symptom -->
          <div class="card">
            <label class="block text-sm font-medium text-gray-700 mb-3">
              <span class="flex items-center space-x-2">
                <span class="text-lg">✏️</span>
                <span>Custom Symptom</span>
              </span>
            </label>
            <div class="space-y-3">
              <input
                type="text"
                [(ngModel)]="customSymptom"
                name="customSymptom"
                placeholder="Enter a custom symptom..."
                class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-colors"
              >
              @if (customSymptom) {
                <div class="space-y-2">
                  <label class="block text-xs font-medium text-gray-600">
                    Intensity (1-5)
                  </label>
                  <div class="flex space-x-1">
                    @for (level of [1,2,3,4,5]; track level) {
                      <button
                        type="button"
                        (click)="customSymptomIntensity.set(level)"
                        class="w-8 h-8 rounded-full text-sm font-medium transition-all duration-200"
                        [class]="level <= customSymptomIntensity() ? 
                          'bg-yellow-400 text-yellow-900' : 
                          'bg-gray-200 text-gray-500 hover:bg-gray-300'"
                      >
                        {{ level }}
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Additional Notes -->
          <div class="card">
            <label class="block text-sm font-medium text-gray-700 mb-3">
              <span class="flex items-center space-x-2">
                <span class="text-lg">📝</span>
                <span>Additional Notes</span>
              </span>
            </label>
            <textarea
              [(ngModel)]="notes"
              name="notes"
              placeholder="Any additional notes about how you're feeling today..."
              rows="3"
              class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-colors resize-none"
            ></textarea>
          </div>

          <!-- Save Button -->
          <div class="card">
            <button
              type="submit"
              [disabled]="!selectedDate || (!hasSelectedSymptoms() && !customSymptom)"
              class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="flex items-center justify-center space-x-2">
                <span class="text-lg">💾</span>
                <span>Save Symptoms</span>
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class LogSymptomsComponent {
  private cycleService = inject(CycleService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  selectedDate = '';
  today = new Date().toISOString().split('T')[0];
  symptomIntensities = signal<Record<string, number>>({});
  customSymptom = '';
  customSymptomIntensity = signal(1);
  notes = '';

  symptomOptions: SymptomOption[] = [
    { type: 'Cramps', emoji: '😣', category: 'Physical' },
    { type: 'Headache', emoji: '🤕', category: 'Physical' },
    { type: 'Bloating', emoji: '🤰', category: 'Physical' },
    { type: 'Breast tenderness', emoji: '😖', category: 'Physical' },
    { type: 'Fatigue', emoji: '😴', category: 'Physical' },
    { type: 'Back pain', emoji: '😰', category: 'Physical' },
    { type: 'Joint pain', emoji: '🦴', category: 'Physical' },
    { type: 'Nausea', emoji: '🤢', category: 'Physical' },
    
    { type: 'Irritability', emoji: '😠', category: 'Emotional' },
    { type: 'Mood swings', emoji: '🎭', category: 'Emotional' },
    { type: 'Anxiety', emoji: '😰', category: 'Emotional' },
    { type: 'Depression', emoji: '😢', category: 'Emotional' },
    { type: 'Stress', emoji: '😤', category: 'Emotional' },
    { type: 'Emotional sensitivity', emoji: '🥺', category: 'Emotional' },
    
    { type: 'Acne breakout', emoji: '😵', category: 'Skin & Hair' },
    { type: 'Oily skin', emoji: '✨', category: 'Skin & Hair' },
    { type: 'Dry skin', emoji: '🏜️', category: 'Skin & Hair' },
    { type: 'Hair changes', emoji: '💇‍♀️', category: 'Skin & Hair' },
    
    { type: 'Food cravings', emoji: '🍫', category: 'Appetite' },
    { type: 'Increased appetite', emoji: '🍽️', category: 'Appetite' },
    { type: 'Loss of appetite', emoji: '🚫', category: 'Appetite' },
    
    { type: 'Insomnia', emoji: '😵‍💫', category: 'Sleep' },
    { type: 'Restless sleep', emoji: '😪', category: 'Sleep' },
    { type: 'Oversleeping', emoji: '😴', category: 'Sleep' }
  ];

  symptomCategories = ['Physical', 'Emotional', 'Skin & Hair', 'Appetite', 'Sleep'];

  constructor() {
    // Check for date from query params
    this.route.queryParams.subscribe(params => {
      if (params['date']) {
        const date = new Date(params['date']);
        this.selectedDate = date.toISOString().split('T')[0];
      } else {
        this.selectedDate = this.today;
      }
    });
  }

  getCategoryEmoji(category: string): string {
    const emojis: Record<string, string> = {
      'Physical': '🏃‍♀️',
      'Emotional': '💭',
      'Skin & Hair': '✨',
      'Appetite': '🍎',
      'Sleep': '🛏️'
    };
    return emojis[category] || '📝';
  }

  getSymptomsByCategory(category: string): SymptomOption[] {
    return this.symptomOptions.filter(s => s.category === category);
  }

  getSymptomIntensity(type: string): number {
    return this.symptomIntensities()[type] || 0;
  }

  toggleSymptom(type: string): void {
    const current = this.symptomIntensities();
    if (current[type] > 0) {
      const { [type]: removed, ...rest } = current;
      this.symptomIntensities.set(rest);
    } else {
      this.symptomIntensities.set({ ...current, [type]: 1 });
    }
  }

  setSymptomIntensity(type: string, intensity: number): void {
    const current = this.symptomIntensities();
    this.symptomIntensities.set({ ...current, [type]: intensity });
  }

  hasSelectedSymptoms(): boolean {
    return Object.keys(this.symptomIntensities()).length > 0;
  }

  saveSymptoms(): void {
    if (!this.selectedDate) return;

    const date = new Date(this.selectedDate);
    
    // Save all selected symptoms
    Object.entries(this.symptomIntensities()).forEach(([type, intensity]) => {
      this.cycleService.addSymptom({
        date,
        type,
        intensity,
        notes: this.notes || undefined
      });
    });

    // Save custom symptom if provided
    if (this.customSymptom) {
      this.cycleService.addSymptom({
        date,
        type: this.customSymptom,
        intensity: this.customSymptomIntensity(),
        notes: this.notes || undefined
      });
    }

    // Navigate back to dashboard
    this.router.navigate(['/dashboard']);
  }
}