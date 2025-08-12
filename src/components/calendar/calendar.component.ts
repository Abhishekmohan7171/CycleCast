import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CycleService } from '../../services/cycle.service';

@Component({
  selector: 'app-calendar',
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
          <h1 class="text-xl font-semibold text-gray-800">Calendar</h1>
          <button class="p-2 rounded-full hover:bg-white/50 transition-colors">
            <span class="text-xl">⚙️</span>
          </button>
        </div>

        <!-- Month Navigation -->
        <div class="card mb-6">
          <div class="flex items-center justify-between mb-4">
            <button 
              (click)="previousMonth()"
              class="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <span class="text-lg">‹</span>
            </button>
            <h2 class="text-lg font-semibold text-gray-800">
              {{ formatMonth(currentMonth()) }}
            </h2>
            <button 
              (click)="nextMonth()"
              class="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <span class="text-lg">›</span>
            </button>
          </div>

          <!-- Calendar Grid -->
          <div class="grid grid-cols-7 gap-1">
            @for (day of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; track day) {
              <div class="p-2 text-center text-xs font-medium text-gray-500">
                {{ day }}
              </div>
            }
            @for (date of calendarDates(); track date.date.getTime()) {
              <button
                (click)="selectDate(date.date)"
                class="relative p-2 h-12 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                [class]="getDateClass(date)"
              >
                <span class="relative z-10">{{ date.day }}</span>
                @if (hasSymptoms(date.date)) {
                  <div class="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-400 rounded-full"></div>
                }
              </button>
            }
          </div>
        </div>

        <!-- Legend -->
        <div class="card mb-6">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Legend</h3>
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="flex items-center space-x-2">
              <div class="w-4 h-4 period-day rounded"></div>
              <span class="text-gray-600">Period</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-4 h-4 fertile-window rounded"></div>
              <span class="text-gray-600">Fertile</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-4 h-4 predicted-period rounded"></div>
              <span class="text-gray-600">Predicted</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-orange-400 rounded-full"></div>
              <span class="text-gray-600">Symptoms</span>
            </div>
          </div>
        </div>

        <!-- Selected Date Info -->
        @if (selectedDate(); as selected) {
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-800 mb-3">
              {{ formatDate(selected) }}
            </h3>
            
            @if (getSymptomsForDate(selected); as symptoms) {
              @if (symptoms.length > 0) {
                <div class="mb-4">
                  <h4 class="text-sm font-medium text-gray-700 mb-2">Symptoms logged:</h4>
                  <div class="space-y-2">
                    @for (symptom of symptoms; track symptom.id) {
                      <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span class="text-sm text-gray-700">{{ symptom.type }}</span>
                        <div class="flex space-x-1">
                          @for (star of [1,2,3,4,5]; track star) {
                            <span class="text-xs" [class]="star <= symptom.intensity ? 'text-yellow-400' : 'text-gray-300'">
                              ★
                            </span>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            }
            
            <div class="flex space-x-3">
              <button 
                routerLink="/log-symptoms"
                [queryParams]="{ date: selected.toISOString() }"
                class="flex-1 btn-secondary text-center"
              >
                Add Symptoms
              </button>
              <button 
                routerLink="/log-period"
                [queryParams]="{ date: selected.toISOString() }"
                class="flex-1 btn-primary text-center"
              >
                Log Period
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class CalendarComponent {
  private cycleService = inject(CycleService);
  
  currentMonth = signal(new Date());
  selectedDate = signal<Date | null>(null);
  
  calendarDates = computed(() => {
    const month = this.currentMonth();
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const dates = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      dates.push({
        date: new Date(currentDate),
        day: currentDate.getDate(),
        isCurrentMonth: currentDate.getMonth() === monthIndex,
        isToday: currentDate.toDateString() === new Date().toDateString()
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  });

  previousMonth(): void {
    const current = this.currentMonth();
    const previous = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    this.currentMonth.set(previous);
  }

  nextMonth(): void {
    const current = this.currentMonth();
    const next = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    this.currentMonth.set(next);
  }

  selectDate(date: Date): void {
    this.selectedDate.set(date);
  }

  formatMonth(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  getDateClass(dateObj: any): string {
    const { date, isCurrentMonth, isToday } = dateObj;
    let classes = 'text-gray-700 hover:bg-gray-100 ';
    
    if (!isCurrentMonth) {
      classes = 'text-gray-300 hover:bg-gray-50 ';
    }
    
    if (isToday) {
      classes += 'ring-2 ring-blue-300 bg-blue-50 text-blue-700 font-bold ';
    }
    
    if (this.selectedDate()?.toDateString() === date.toDateString()) {
      classes += 'ring-2 ring-primary-300 bg-primary-50 ';
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

  hasSymptoms(date: Date): boolean {
    return this.cycleService.getSymptomsForDate(date).length > 0;
  }

  getSymptomsForDate(date: Date) {
    return this.cycleService.getSymptomsForDate(date);
  }

  private isDateInFertileWindow(date: Date): boolean {
    const pred = this.cycleService.currentPrediction();
    if (!pred) return false;
    
    return date >= pred.fertileWindowStart && date <= pred.fertileWindowEnd;
  }

  private isDatePredictedPeriod(date: Date): boolean {
    const pred = this.cycleService.currentPrediction();
    if (!pred) return false;
    
    const periodEnd = new Date(pred.nextPeriodDate);
    periodEnd.setDate(periodEnd.getDate() + 5);
    
    return date >= pred.nextPeriodDate && date <= periodEnd;
  }
}