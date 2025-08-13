# CycleCast – Menstrual Cycle Tracker (Angular)

A lightweight, privacy-first menstrual cycle tracker built with Angular and Tailwind CSS. Users can log period dates, flow intensity, symptoms, and notes, and view a month calendar with predicted periods and fertile windows. Data is stored locally in the browser via localStorage.

## Features

* Welcome screen with quick actions: Log Period, Log Symptoms, Calendar, Insights
* Period logging: start/end date, flow intensity (light/medium/heavy), notes and common flags
* Symptom logging: daily checklist across physical and emotional categories
* Calendar view with legend for period, predicted period, fertile window, and symptoms
* Insights placeholder that activates once enough data points exist
* Fully responsive UI styled with Tailwind
* Zero backend: all data stays on the device via localStorage

## Tech stack

* Angular 17+ (TypeScript, Standalone APIs preferred)
* Tailwind CSS
* localStorage for persistence
* Optional: Firebase Hosting for deployment

## Screenshots

Add images to a local `screenshots/` folder and update paths below.

* Home: `screenshots/home.png`
* Log Period: `screenshots/log-period.png`
* Log Symptoms: `screenshots/log-symptoms.png`
* Calendar: `screenshots/calendar.png`
* Insights: `screenshots/insights.png`

```md
![Home](screenshots/home.png)
![Log Period](screenshots/log-period.png)
![Log Symptoms](screenshots/log-symptoms.png)
![Calendar](screenshots/calendar.png)
![Insights](screenshots/insights.png)
```

## Data model (localStorage)

All data is stored under a single namespaced key. You can migrate or sync later without breaking changes.

Key: `cyclecast:data:v1`

```json
{
  "periods": [
    {
      "id": "uuid",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD|null",
      "flow": "light|medium|heavy",
      "notes": "string",
      "tags": ["spotting", "painful_cramps", "missed_period", "irregular_timing", "breakthrough_bleeding", "clots_present"]
    }
  ],
  "symptoms": [
    {
      "id": "uuid",
      "date": "YYYY-MM-DD",
      "items": [
        // free-form ids, e.g. "cramps", "headache", "bloating", "fatigue"...
      ]
    }
  ],
  "settings": {
    "cycleLengthDays": 28,
    "periodLengthDays": 5,
    "predictionEnabled": true
  }
}
```

Prediction notes:

* Next period = last period start + cycleLengthDays
* Fertile window = ovulation day (cycle mid-point) ± 3 days
* Predictions improve with more logged cycles; these are estimates and not medical advice

## Getting started

### Prerequisites

* Node.js 18+
* PNPM or NPM
* Angular CLI installed globally: `npm i -g @angular/cli`

### Install

```bash
pnpm install
# or
npm install
```

### Run locally

```bash
pnpm ng serve
# or
npm run start
# App runs at http://localhost:4200
```

### Build

```bash
pnpm ng build --configuration production
```

### Lint and format

```bash
pnpm run lint
pnpm run format
```

### Unit tests

```bash
pnpm run test
```

## Project structure

```
src/
  app/
    core/            # services, storage, prediction utils
    features/
      home/
      period-log/
      symptom-log/
      calendar/
      insights/
    shared/          # ui components, icons, pipes
  assets/
  styles.css         # tailwind base/components/utilities
```

## Environment and configuration

* Tailwind is configured via `tailwind.config.js`
* Customize theme colors, spacing, and typography as needed
* Default settings can be overridden on first run via a small settings panel (gear icon in calendar)

## Accessibility

* Semantic HTML with labeled form controls
* Keyboard-navigable inputs and date pickers
* High-contrast states for active selections
* Emoji are decorative complements; text labels are preserved for screen readers

## Privacy and data

* No external APIs by default
* All data remains in the user’s browser localStorage
* Users can clear data via a reset action in settings

## Deployment

### Firebase Hosting (optional)

```bash
npm i -g firebase-tools
firebase login
firebase init hosting   # choose dist/your-app as public dir after build
ng build --configuration production
firebase deploy
```

## Roadmap

* Export/import data (JSON file)
* PWA support with offline install
* iCal reminders for period predictions
* Multi-device sync with optional account and end-to-end encryption
* Charts in Insights (trends by flow and symptoms)

## Contributing

Issues and PRs are welcome. Please open an issue to discuss major changes first.

## License

MIT
