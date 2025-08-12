import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CycleService } from '../../services/cycle.service';
import { UserProfile } from '../../models/cycle.model';

@Component({
  selector: 'app-settings',
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
          <h1 class="text-xl font-semibold text-gray-800">Settings</h1>
          <div class="w-10 h-10"></div>
        </div>

        @if (userProfile()) {
          <!-- Cycle Preferences -->
          <div class="card mb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <span class="text-xl">⚙️</span>
              <span>Cycle Preferences</span>
            </h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Average Cycle Length (days)
                </label>
                <input
                  type="number"
                  [(ngModel)]="averageCycleLength"
                  min="20"
                  max="45"
                  class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-colors"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Average Period Length (days)
                </label>
                <input
                  type="number"
                  [(ngModel)]="averagePeriodLength"
                  min="2"
                  max="10"
                  class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-colors"
                >
              </div>
            </div>
          </div>

          <!-- Notifications -->
          <div class="card mb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <span class="text-xl">🔔</span>
              <span>Notifications</span>
            </h3>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-gray-700">Period Reminders</p>
                  <p class="text-sm text-gray-500">Get notified before your period starts</p>
                </div>
                <button
                  (click)="toggleNotification('periodReminder')"
                  class="relative w-12 h-6 rounded-full transition-colors duration-200"
                  [class]="notifications().periodReminder ? 'bg-primary-500' : 'bg-gray-300'"
                >
                  <div 
                    class="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200"
                    [class]="notifications().periodReminder ? 'transform translate-x-7' : 'transform translate-x-1'"
                  ></div>
                </button>
              </div>
              
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-gray-700">Ovulation Reminders</p>
                  <p class="text-sm text-gray-500">Get notified during fertile window</p>
                </div>
                <button
                  (click)="toggleNotification('ovulationReminder')"
                  class="relative w-12 h-6 rounded-full transition-colors duration-200"
                  [class]="notifications().ovulationReminder ? 'bg-primary-500' : 'bg-gray-300'"
                >
                  <div 
                    class="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200"
                    [class]="notifications().ovulationReminder ? 'transform translate-x-7' : 'transform translate-x-1'"
                  ></div>
                </button>
              </div>
              
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-gray-700">PMS Alerts</p>
                  <p class="text-sm text-gray-500">Get notified about upcoming PMS symptoms</p>
                </div>
                <button
                  (click)="toggleNotification('pmsAlert')"
                  class="relative w-12 h-6 rounded-full transition-colors duration-200"
                  [class]="notifications().pmsAlert ? 'bg-primary-500' : 'bg-gray-300'"
                >
                  <div 
                    class="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200"
                    [class]="notifications().pmsAlert ? 'transform translate-x-7' : 'transform translate-x-1'"
                  ></div>
                </button>
              </div>
            </div>
          </div>

          <!-- Theme -->
          <div class="card mb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <span class="text-xl">🎨</span>
              <span>Appearance</span>
            </h3>
            
            <div class="grid grid-cols-2 gap-3">
              <button
                (click)="setTheme('light')"
                class="p-4 rounded-lg border-2 transition-all duration-200 text-center"
                [class]="theme() === 'light' ? 
                  'border-primary-300 bg-primary-50 text-primary-700' : 
                  'border-gray-200 hover:border-gray-300 text-gray-600'"
              >
                <div class="text-2xl mb-2">☀️</div>
                <div class="text-sm font-medium">Light</div>
              </button>
              
              <button
                (click)="setTheme('dark')"
                class="p-4 rounded-lg border-2 transition-all duration-200 text-center"
                [class]="theme() === 'dark' ? 
                  'border-primary-300 bg-primary-50 text-primary-700' : 
                  'border-gray-200 hover:border-gray-300 text-gray-600'"
              >
                <div class="text-2xl mb-2">🌙</div>
                <div class="text-sm font-medium">Dark</div>
              </button>
            </div>
          </div>

          <!-- Data & Privacy -->
          <div class="card mb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <span class="text-xl">🔒</span>
              <span>Data & Privacy</span>
            </h3>
            
            <div class="space-y-4">
              <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div class="flex items-start space-x-3">
                  <span class="text-2xl">🛡️</span>
                  <div>
                    <h4 class="font-medium text-blue-800 mb-1">Your Privacy Matters</h4>
                    <p class="text-sm text-blue-700">
                      All your data is stored locally on your device. We don't collect or share any personal information.
                    </p>
                  </div>
                </div>
              </div>
              
              <button
                (click)="showExportData.set(true)"
                class="w-full p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-green-700 font-medium transition-colors"
              >
                📤 Export My Data
              </button>
              
              <button
                (click)="showDeleteWarning.set(true)"
                class="w-full p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-700 font-medium transition-colors"
              >
                🗑️ Delete All Data
              </button>
            </div>
          </div>

          <!-- Save Button -->
          <div class="card">
            <button
              (click)="saveSettings()"
              class="w-full btn-primary"
            >
              <span class="flex items-center justify-center space-x-2">
                <span class="text-lg">💾</span>
                <span>Save Settings</span>
              </span>
            </button>
          </div>
        } @else {
          <div class="card text-center">
            <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">⚙️</span>
            </div>
            <h2 class="text-xl font-semibold text-gray-800 mb-3">No Profile Found</h2>
            <p class="text-gray-600 mb-6">Create your profile first by logging a period.</p>
            <button 
              routerLink="/log-period"
              class="btn-primary"
            >
              Get Started
            </button>
          </div>
        }

        <!-- Export Data Modal -->
        @if (showExportData()) {
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-xl max-w-sm w-full p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Export Data</h3>
              <p class="text-gray-600 mb-6">Your data will be exported as a JSON file that you can save or share.</p>
              <div class="flex space-x-3">
                <button
                  (click)="exportData()"
                  class="flex-1 btn-primary"
                >
                  Export
                </button>
                <button
                  (click)="showExportData.set(false)"
                  class="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Delete Warning Modal -->
        @if (showDeleteWarning()) {
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-xl max-w-sm w-full p-6">
              <h3 class="text-lg font-semibold text-red-600 mb-4">⚠️ Delete All Data</h3>
              <p class="text-gray-600 mb-6">This action cannot be undone. All your cycles, symptoms, and settings will be permanently deleted.</p>
              <div class="flex space-x-3">
                <button
                  (click)="deleteAllData()"
                  class="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Delete
                </button>
                <button
                  (click)="showDeleteWarning.set(false)"
                  class="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class SettingsComponent {
  private cycleService = inject(CycleService);
  
  userProfile = this.cycleService.userProfile;
  
  averageCycleLength = 28;
  averagePeriodLength = 5;
  notifications = signal({
    periodReminder: true,
    ovulationReminder: true,
    pmsAlert: true
  });
  theme = signal<'light' | 'dark'>('light');
  
  showExportData = signal(false);
  showDeleteWarning = signal(false);

  constructor() {
    const profile = this.userProfile();
    if (profile) {
      this.averageCycleLength = profile.averageCycleLength;
      this.averagePeriodLength = profile.averagePeriodLength;
      this.notifications.set(profile.notifications);
      this.theme.set(profile.theme);
    }
  }

  toggleNotification(type: keyof UserProfile['notifications']): void {
    const current = this.notifications();
    this.notifications.set({
      ...current,
      [type]: !current[type]
    });
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.theme.set(theme);
  }

  saveSettings(): void {
    const profile = this.userProfile();
    if (!profile) return;

    const updatedProfile: UserProfile = {
      ...profile,
      averageCycleLength: this.averageCycleLength,
      averagePeriodLength: this.averagePeriodLength,
      notifications: this.notifications(),
      theme: this.theme()
    };

    this.cycleService.userProfile.set(updatedProfile);
    
    // Save to localStorage
    localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
    
    // Show success feedback
    alert('Settings saved successfully!');
  }

  exportData(): void {
    const cycles = this.cycleService.cycles();
    const symptoms = this.cycleService.symptoms();
    const profile = this.userProfile();

    const exportData = {
      cycles,
      symptoms,
      profile,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `cycle-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    this.showExportData.set(false);
  }

  deleteAllData(): void {
    this.cycleService.clearAllData();
    this.showDeleteWarning.set(false);
    alert('All data has been deleted.');
  }
}