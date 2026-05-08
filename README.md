# 🌿 FamilyCare Sync

> A private family web app for coordinating medical appointments — who's going, when, where, and what happened.

**Live app:** [https://familycare-sync.web.app](https://familycare-sync.web.app)

---

## What it does

FamilyCare Sync is a small, focused app built for one family. It lets authorized family members:

- 📅 **See all upcoming appointments** in a clean timeline view
- 🏥 **Schedule new appointments** from preset types (oncology, blood test, imaging…)
- ✋ **Volunteer as escort** — one tap to say "I'm going"
- 📧 **Notify the whole family** automatically when an appointment is created, updated, or cancelled (via email)
- 📝 **Log a post-visit summary** after each appointment
- 📋 **Browse history** of past appointments, grouped by month
- 👨‍👩‍👧‍👦 **See who's in the family** and manage the authorized member list

Access is restricted to a fixed whitelist of family email addresses — no strangers can sign in.

---

## Screenshots

| Home | Appointment Details | New Appointment |
|------|-------------------|----------------|
| ![Home](docs/screenshots/home.png) | ![Detail](docs/screenshots/detail.png) | ![Create](docs/screenshots/create.png) |

> Screenshots taken from the interactive prototype — see [`familycare-sync-prototype.html`](familycare-sync-prototype.html)

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React Native + Expo (web target via `react-native-web`) |
| **Navigation** | React Navigation — bottom tabs + stack |
| **Database** | Firebase Firestore (real-time listeners) |
| **Auth** | Firebase Auth — Email/Password, family whitelist guard |
| **Email** | Firebase Cloud Functions v2 + Resend SDK |
| **Hosting** | Firebase Hosting (PWA, installable on iPhone & Android) |
| **Calendar sync** | Google Calendar API via Cloud Functions |
| **Notifications** | expo-notifications (native), skipped gracefully on web |
| **Language** | TypeScript throughout |

---

## Project structure

```
FamilyCare Sync/
├── src/
│   ├── screens/
│   │   ├── auth/           LoginScreen
│   │   ├── dashboard/      DashboardScreen, NextTreatmentCard
│   │   ├── history/        HistoryScreen
│   │   ├── family/         FamilyScreen
│   │   ├── quickCreate/    QuickCreateScreen
│   │   └── treatmentDetail/ TreatmentDetailScreen, EditTreatmentScreen
│   │                         EscortManager, PostVisitSummary
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AppTabs.tsx      (3-tab: Home / History / Family)
│   │   └── AuthStack.tsx
│   ├── components/
│   │   ├── common/          LoadingSpinner, ErrorBanner, Avatar
│   │   │                    DatePickerModal (web + native variants)
│   │   └── treatment/       TreatmentCard, StatusBadge
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTreatments.ts
│   │   ├── usePresets.ts
│   │   └── useNotifications.ts
│   ├── services/
│   │   ├── firestoreService.ts
│   │   ├── functionsService.ts
│   │   └── notificationService.ts
│   ├── constants/
│   │   ├── colors.ts        Design tokens
│   │   ├── spacing.ts       Layout tokens
│   │   └── emailWhitelist.ts
│   ├── types/
│   │   ├── Treatment.ts
│   │   ├── Preset.ts
│   │   └── User.ts
│   └── config/
│       └── firebase.ts
├── functions/               Firebase Cloud Functions (Node 18)
│   └── src/
│       ├── onTreatmentCreate.ts   → email + calendar on new appointment
│       ├── onTreatmentUpdate.ts   → email on status change / escort change
│       └── calendarSync.ts        → Google Calendar API
├── web/                     Web-specific HTML template + PWA assets
├── assets/                  App icons (icon.png, apple-touch-icon.png, …)
├── docs/                    Design docs and screenshots
└── dist/                    Web build output (deployed to Firebase Hosting)
```

---

## Running locally

```bash
# Install dependencies
npm install

# Start Expo dev server (web)
npm run web

# Start on iOS simulator
npm run ios

# Start on Android emulator
npm run android
```

**Requires** a `.env` file with Firebase config (see `.env - Copy.example`).

---

## Deploying

```bash
# Build for web
npx expo export --platform web

# Deploy to Firebase Hosting
npx firebase deploy --only hosting
```

The app lives at **https://familycare-sync.web.app** and can be installed as a PWA on iPhone (Safari → Share → Add to Home Screen) and Android (Chrome → menu → Install App).

---

## Cloud Functions

```bash
cd functions
npm run deploy
```

Functions use Firebase Secret Manager for the Resend API key — no secrets in source code.

---

## Design

See [`docs/DESIGN.md`](docs/DESIGN.md) for the full design system, color tokens, and component decisions.

The interactive prototype lives at [`familycare-sync-prototype.html`](familycare-sync-prototype.html) — open in any browser.

---

## Access control

Only the emails listed in `src/constants/emailWhitelist.ts` can sign in. To add a family member:
1. Add their email to the whitelist array
2. Redeploy the web app

---

*Built with ❤️ for the Mosseri family.*
