import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CycleService } from '../../services/cycle.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 px-4 py-6">
      <div class="max-w-md mx-auto space-y-6">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">CycleCast</h1>
          <p class="text-gray-600">Take care of yourself, beautifully</p>
        </div>

        @if (prediction(); as pred) {
          <!-- Next Period Card -->
          <div class="card">
            <div class="text-center">
              <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-2xl">🌸</span>
              </div>
              <h2 class="text-xl font-semibold text-gray-800 mb-2">Next Period</h2>
              <p class="text-3xl font-bold text-primary-600 mb-1">
                {{ pred.daysUntilNext }} days
              </p>
              <p class="text-sm text-gray-500">
                {{ formatDate(pred.nextPeriodDate) }}
              </p>
            </div>
          </div>

          <!-- Current Cycle Info -->
          <div class="grid grid-cols-2 gap-4">
            <div class="card text-center">
              <div class="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span class="text-xl">🌱</span>
              </div>
              <p class="text-sm text-gray-600 mb-1">Cycle Day</p>
              <p class="text-2xl font-bold text-accent-600">{{ pred.currentCycleDay }}</p>
            </div>
            
            <div class="card text-center">
              <div class="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span class="text-xl">✨</span>
              </div>
              <p class="text-sm text-gray-600 mb-1">Fertile Window</p>
              <p class="text-xs font-medium text-secondary-600">
                {{ formatDateShort(pred.fertileWindowStart) }} - {{ formatDateShort(pred.fertileWindowEnd) }}
              </p>
            </div>
          </div>
        } @else {
          <!-- Welcome Card -->
          <div class="card text-center">
            <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">💖</span>
            </div>
            <h2 class="text-xl font-semibold text-gray-800 mb-3">Welcome to Cycle Tracker</h2>
            <p class="text-gray-600 mb-6">Let's get started by logging your last period to create personalized predictions.</p>
            <button 
              routerLink="/log-period"
              class="btn-primary w-full"
            >
              Log First Period
            </button>
          </div>
        }

        <!-- Quick Actions -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div class="grid grid-cols-2 gap-3">
            <button 
              routerLink="/log-period"
              class="flex flex-col items-center p-4 bg-primary-50 rounded-lg border-2 border-primary-100 hover:border-primary-200 transition-colors"
            >
              <span class="text-2xl mb-2">🩸</span>
              <span class="text-sm font-medium text-primary-700">Log Period</span>
            </button>
            
            <button 
              routerLink="/log-symptoms"
              class="flex flex-col items-center p-4 bg-secondary-50 rounded-lg border-2 border-secondary-100 hover:border-secondary-200 transition-colors"
            >
              <span class="text-2xl mb-2">😌</span>
              <span class="text-sm font-medium text-secondary-700">Log Symptoms</span>
            </button>
            
            <button 
              routerLink="/calendar"
              class="flex flex-col items-center p-4 bg-accent-50 rounded-lg border-2 border-accent-100 hover:border-accent-200 transition-colors"
            >
              <span class="text-2xl mb-2">📅</span>
              <span class="text-sm font-medium text-accent-700">Calendar</span>
            </button>
            
            <button 
              routerLink="/analytics"
              class="flex flex-col items-center p-4 bg-orange-50 rounded-lg border-2 border-orange-100 hover:border-orange-200 transition-colors"
            >
              <span class="text-2xl mb-2">📊</span>
              <span class="text-sm font-medium text-orange-700">Insights</span>
            </button>
          </div>
        </div>

        <!-- Mini Calendar Preview -->
        @if (prediction()) {
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">This Month</h3>
            <div class="grid grid-cols-7 gap-1 text-center text-xs">
              @for (day of ['S', 'M', 'T', 'W', 'T', 'F', 'S']; track day) {
                <div class="p-2 font-medium text-gray-500">{{ day }}</div>
              }
              @for (date of calendarDates(); track date.date) {
                <div 
                  class="p-2 h-8 flex items-center justify-center rounded text-xs font-medium transition-colors"
                  [class]="getDateClass(date)"
                >
                  {{ date.day }}
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class DashboardComponent {
  private cycleService = inject(CycleService);
  
  prediction = this.cycleService.currentPrediction;
  
  calendarDates = computed(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const dates = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      dates.push({
        date: new Date(currentDate),
        day: currentDate.getDate(),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.toDateString() === today.toDateString()
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  });

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  formatDateShort(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getDateClass(dateObj: any): string {
    const { date, isCurrentMonth, isToday } = dateObj;
    let classes = '';
    
    if (!isCurrentMonth) {
      classes += 'text-gray-300 ';
    } else {
      classes += 'text-gray-700 ';
    }
    
    if (isToday) {
      classes += 'bg-blue-100 text-blue-700 font-bold ';
    }
    
    if (this.cycleService.isDateInPeriod(date)) {
      classes += 'period-day ';
    } else if (this.isDateInFertileWindow(date)) {
      classes += 'fertile-window ';
    } else if (this.isDatePredictedPeriod(date)) {
      classes += 'predicted-period ';
    }
    
    return classes;
  }

  private isDateInFertileWindow(date: Date): boolean {
    const pred = this.prediction();
    if (!pred) return false;
    
    return date >= pred.fertileWindowStart && date <= pred.fertileWindowEnd;
  }

  private isDatePredictedPeriod(date: Date): boolean {
    const pred = this.prediction();
    if (!pred) return false;
    
    const periodEnd = new Date(pred.nextPeriodDate);
    periodEnd.setDate(periodEnd.getDate() + 5);
    
    return date >= pred.nextPeriodDate && date <= periodEnd;
  }
}