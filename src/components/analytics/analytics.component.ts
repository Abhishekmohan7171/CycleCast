import { Component, computed, inject, signal, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CycleService } from '../../services/cycle.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
          <h1 class="text-xl font-semibold text-gray-800">Insights</h1>
          <div class="w-10 h-10"></div>
        </div>

        @if (analytics(); as data) {
          <!-- Overview Cards -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="card text-center">
              <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span class="text-xl">📊</span>
              </div>
              <p class="text-sm text-gray-600 mb-1">Avg Cycle</p>
              <p class="text-2xl font-bold text-primary-600">{{ data.averageCycleLength }} days</p>
            </div>
            
            <div class="card text-center">
              <div class="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span class="text-xl">📈</span>
              </div>
              <p class="text-sm text-gray-600 mb-1">Regularity</p>
              <p class="text-2xl font-bold text-accent-600">{{ data.cycleRegularity }}%</p>
            </div>
          </div>

          <!-- Cycle Length Chart -->
          <div class="card mb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Cycle Length Trend</h3>
            <div class="relative h-48">
              <canvas #cycleLengthChart></canvas>
            </div>
          </div>

          <!-- Period Duration -->
          <div class="card mb-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-800">Period Duration</h3>
              <div class="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                <span class="text-lg">⏱️</span>
              </div>
            </div>
            <div class="text-center">
              <p class="text-3xl font-bold text-secondary-600 mb-1">{{ data.periodDuration }} days</p>
              <p class="text-sm text-gray-600">Average duration</p>
            </div>
          </div>

          <!-- Common Symptoms -->
          @if (getObjectKeys(data.commonSymptoms).length > 0) {
            <div class="card mb-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Most Common Symptoms</h3>
              <div class="space-y-3">
                @for (symptom of getTopSymptoms(data.commonSymptoms); track symptom.type) {
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <span class="text-lg">{{ getSymptomEmoji(symptom.type) }}</span>
                      <span class="text-gray-700">{{ symptom.type }}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          class="h-full bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full transition-all duration-500"
                          [style.width.%]="(symptom.count / getMaxSymptomCount(data.commonSymptoms)) * 100"
                        ></div>
                      </div>
                      <span class="text-sm text-gray-600 w-6">{{ symptom.count }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Recent Cycles -->
          @if (data.lastSixCycles.length > 0) {
            <div class="card">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Recent Cycles</h3>
              <div class="space-y-3">
                @for (cycle of data.lastSixCycles; track cycle.id) {
                  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p class="font-medium text-gray-800">
                        {{ formatDate(cycle.startDate) }}
                      </p>
                      @if (cycle.endDate) {
                        <p class="text-xs text-gray-600">
                          {{ getDuration(cycle.startDate, cycle.endDate) }} days
                        </p>
                      }
                    </div>
                    <div class="flex items-center space-x-2">
                      <span class="text-sm px-2 py-1 rounded-full"
                            [class]="getFlowIntensityClass(cycle.flowIntensity)">
                        {{ cycle.flowIntensity }}
                      </span>
                      @if (cycle.tags.length > 0) {
                        <span class="text-xs text-gray-500">
                          +{{ cycle.tags.length }} notes
                        </span>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        } @else {
          <!-- No Data State -->
          <div class="card text-center">
            <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">📊</span>
            </div>
            <h2 class="text-xl font-semibold text-gray-800 mb-3">No Data Yet</h2>
            <p class="text-gray-600 mb-6">Start logging your periods and symptoms to see insights and trends.</p>
            <button 
              routerLink="/log-period"
              class="btn-primary"
            >
              Log First Period
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class AnalyticsComponent implements AfterViewInit {
  @ViewChild('cycleLengthChart') cycleLengthChartRef!: ElementRef<HTMLCanvasElement>;
  
  private cycleService = inject(CycleService);
  private chart: Chart | null = null;
  
  analytics = computed(() => {
    const cycles = this.cycleService.cycles();
    if (cycles.length === 0) return null;
    return this.cycleService.getAnalytics();
  });

  ngAfterViewInit(): void {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      this.createCycleLengthChart();
    }, 100);
  }

  getObjectKeys(obj: object): string[] {
    return Object.keys(obj);
  }

  private createCycleLengthChart(): void {
    const analytics = this.analytics();
    if (!analytics || !this.cycleLengthChartRef) return;

    const cycles = analytics.lastSixCycles.slice().reverse();
    if (cycles.length < 2) return;

    const cycleLengths = [];
    const labels = [];

    for (let i = 0; i < cycles.length - 1; i++) {
      const current = cycles[i];
      const next = cycles[i + 1];
      const daysDiff = Math.round((next.startDate.getTime() - current.startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 0 && daysDiff <= 45) {
        cycleLengths.push(daysDiff);
        labels.push(new Date(next.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }
    }

    if (cycleLengths.length === 0) return;

    const ctx = this.cycleLengthChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Cycle Length',
          data: cycleLengths,
          borderColor: '#ec4899',
          backgroundColor: 'rgba(236, 72, 153, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#ec4899',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            min: Math.max(20, Math.min(...cycleLengths) - 2),
            max: Math.min(40, Math.max(...cycleLengths) + 2),
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              color: '#6b7280',
              font: {
                size: 12
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#6b7280',
              font: {
                size: 12
              }
            }
          }
        },
        elements: {
          point: {
            hoverBackgroundColor: '#db2777'
          }
        }
      }
    });
  }

  getTopSymptoms(symptoms: Record<string, number>) {
    return Object.entries(symptoms)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  getMaxSymptomCount(symptoms: Record<string, number>): number {
    return Math.max(...Object.values(symptoms));
  }

  getSymptomEmoji(symptom: string): string {
    const emojiMap: Record<string, string> = {
      'Cramps': '😣',
      'Headache': '🤕',
      'Bloating': '🤰',
      'Breast tenderness': '😖',
      'Fatigue': '😴',
      'Back pain': '😰',
      'Irritability': '😠',
      'Mood swings': '🎭',
      'Anxiety': '😰',
      'Depression': '😢',
      'Acne breakout': '😵',
      'Food cravings': '🍫'
    };
    return emojiMap[symptom] || '📝';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  getDuration(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  getFlowIntensityClass(intensity: string): string {
    switch (intensity) {
      case 'light': return 'bg-blue-100 text-blue-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'heavy': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
}