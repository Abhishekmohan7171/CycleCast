import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CycleService } from '../../services/cycle.service';

@Component({
  selector: 'app-log-period',
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
          <h1 class="text-xl font-semibold text-gray-800">Log Period</h1>
          <div class="w-10 h-10"></div>
        </div>

        <form (ngSubmit)="savePeriod()" class="space-y-6">
          <!-- Start Date -->
          <div class="card">
            <label class="block text-sm font-medium text-gray-700 mb-3">
              <span class="flex items-center space-x-2">
                <span class="text-lg">📅</span>
                <span>Period Start Date</span>
              </span>
            </label>
            <input
              type="date"
              [(ngModel)]="startDate"
              name="startDate"
              required
              class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-colors"
            >
          </div>

          <!-- End Date -->
          <div class="card">
            <label class="block text-sm font-medium text-gray-700 mb-3">
              <span class="flex items-center space-x-2">
                <span class="text-lg">🏁</span>
                <span>Period End Date (Optional)</span>
              </span>
            </label>
            <input
              type="date"
              [(ngModel)]="endDate"
              name="endDate"
              [min]="startDate"
              class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-colors"
            >
            <p class="text-xs text-gray-500 mt-2">Leave blank if period is ongoing</p>
          </div>

          <!-- Flow Intensity -->
          <div class="card">
            <label class="block text-sm font-medium text-gray-700 mb-3">
              <span class="flex items-center space-x-2">
                <span class="text-lg">💧</span>
                <span>Flow Intensity</span>
              </span>
            </label>
            <div class="grid grid-cols-3 gap-3">
              @for (intensity of flowIntensities; track intensity.value) {
                <button
                  type="button"
                  (click)="flowIntensity.set(intensity.value)"
                  class="p-4 rounded-lg border-2 transition-all duration-200 text-center"
                  [class]="flowIntensity() === intensity.value ? 
                    'border-primary-300 bg-primary-50 text-primary-700' : 
                    'border-gray-200 hover:border-gray-300 text-gray-600'"
                >
                  <div class="text-2xl mb-2">{{ intensity.emoji }}</div>
                  <div class="text-sm font-medium">{{ intensity.label }}</div>
                </button>
              }
            </div>
          </div>

          <!-- Tags -->
          <div class="card">
            <label class="block text-sm font-medium text-gray-700 mb-3">
              <span class="flex items-center space-x-2">
                <span class="text-lg">🏷️</span>
                <span>Additional Notes</span>
              </span>
            </label>
            <div class="grid grid-cols-2 gap-2 mb-4">
              @for (tag of availableTags; track tag) {
                <button
                  type="button"
                  (click)="toggleTag(tag)"
                  class="p-2 rounded-lg border text-sm transition-all duration-200"
                  [class]="selectedTags().includes(tag) ? 
                    'border-secondary-300 bg-secondary-50 text-secondary-700' : 
                    'border-gray-200 hover:border-gray-300 text-gray-600'"
                >
                  {{ tag }}
                </button>
              }
            </div>
            <textarea
              [(ngModel)]="notes"
              name="notes"
              placeholder="Any additional notes about this period..."
              rows="3"
              class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-colors resize-none"
            ></textarea>
          </div>

          <!-- Save Button -->
          <div class="card">
            <button
              type="submit"
              [disabled]="!startDate"
              class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="flex items-center justify-center space-x-2">
                <span class="text-lg">💾</span>
                <span>Save Period</span>
              </span>
            </button>
          </div>

          @if (!hasProfile()) {
            <div class="card bg-blue-50 border-blue-200">
              <div class="flex items-start space-x-3">
                <span class="text-2xl">💡</span>
                <div>
                  <h3 class="text-sm font-medium text-blue-800 mb-1">First Time Setup</h3>
                  <p class="text-xs text-blue-700 mb-3">
                    Since this is your first period entry, we'll use it to create your personalized cycle predictions.
                  </p>
                  <div class="space-y-3">
                    <div>
                      <label class="block text-xs font-medium text-blue-700 mb-1">
                        Average Cycle Length (days)
                      </label>
                      <input
                        type="number"
                        [(ngModel)]="averageCycleLength"
                        name="averageCycleLength"
                        min="20"
                        max="45"
                        class="w-full p-2 border border-blue-200 rounded text-sm focus:ring-1 focus:ring-blue-300"
                      >
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-blue-700 mb-1">
                        Average Period Length (days)
                      </label>
                      <input
                        type="number"
                        [(ngModel)]="averagePeriodLength"
                        name="averagePeriodLength"
                        min="2"
                        max="10"
                        class="w-full p-2 border border-blue-200 rounded text-sm focus:ring-1 focus:ring-blue-300"
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </form>
      </div>
    </div>
  `
})
export class LogPeriodComponent {
  private cycleService = inject(CycleService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  startDate = '';
  endDate = '';
  flowIntensity = signal<'light' | 'medium' | 'heavy'>('medium');
  selectedTags = signal<string[]>([]);
  notes = '';
  averageCycleLength = 28;
  averagePeriodLength = 5;

  flowIntensities = [
    { value: 'light' as const, label: 'Light', emoji: '💧' },
    { value: 'medium' as const, label: 'Medium', emoji: '💦' },
    { value: 'heavy' as const, label: 'Heavy', emoji: '🌊' }
  ];

  availableTags = [
    'Spotting',
    'Painful cramps',
    'Missed period',
    'Irregular timing',
    'Breakthrough bleeding',
    'Clots present'
  ];

  constructor() {
    // Check for date from query params
    this.route.queryParams.subscribe(params => {
      if (params['date']) {
        const date = new Date(params['date']);
        this.startDate = date.toISOString().split('T')[0];
      }
    });
  }

  hasProfile(): boolean {
    return this.cycleService.userProfile() !== null;
  }

  toggleTag(tag: string): void {
    const currentTags = this.selectedTags();
    if (currentTags.includes(tag)) {
      this.selectedTags.set(currentTags.filter(t => t !== tag));
    } else {
      this.selectedTags.set([...currentTags, tag]);
    }
  }

  savePeriod(): void {
    if (!this.startDate) return;

    // Initialize profile if this is the first time
    if (!this.hasProfile()) {
      this.cycleService.initializeProfile({
        averageCycleLength: this.averageCycleLength,
        averagePeriodLength: this.averagePeriodLength,
        lastPeriodDate: new Date(this.startDate)
      });
    }

    // Save the period
    this.cycleService.addCycle({
      startDate: new Date(this.startDate),
      endDate: this.endDate ? new Date(this.endDate) : undefined,
      flowIntensity: this.flowIntensity(),
      tags: this.selectedTags(),
      notes: this.notes || undefined
    });

    // Navigate back to dashboard
    this.router.navigate(['/dashboard']);
  }
}