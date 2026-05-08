# FamilyCare Sync — Design System

This document explains every design decision made in the app: colors, typography, layout, and component patterns.

---

## Design Philosophy

The app is used by a family coordinating medical care — often stressful, emotionally heavy situations. The design priorities are:

1. **Calm, not clinical** — warm off-white background instead of pure white; sage green instead of hospital blue
2. **Information at a glance** — next appointment is always front and center with a clear countdown
3. **Low friction** — one tap to volunteer as escort; two steps to create an appointment
4. **Family feel** — avatar initials, "I'm Going" language, group notifications

---

## Color Tokens

Defined in `src/constants/colors.ts`.

### Primary palette

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#6B9E7A` | Buttons, active tab, dots, accents |
| `primaryLight` | `#8DB89A` | Hover states |
| `primaryDark` | `#4E7E5C` | Button shadow, pressed state |
| `primaryBg` | `#EEF5F0` | Chip backgrounds, input tints |

### Backgrounds

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#F6F4EF` | App background — warm off-white |
| `surface` | `#FFFFFF` | Cards, modals, tab bar |
| `surfaceVariant` | `#F0EDE8` | Input fields, grouped rows |
| `border` | `#E8E4DD` | Card borders, dividers |

### Text

| Token | Hex | Usage |
|-------|-----|-------|
| `textPrimary` | `#2C2C2C` | Headings, titles |
| `textSecondary` | `#5E6472` | Subtitles, meta info |
| `textMuted` | `#A0A8B4` | Placeholders, section labels |
| `textOnPrimary` | `#FFFFFF` | Text on green buttons/cards |

### Semantic

| Token | Hex | Usage |
|-------|-----|-------|
| `warning` | `#F5A623` | "No escort" badge, urgent countdown |
| `warningBg` | `#FEF6E4` | Warning chip background |
| `error` | `#E05C5C` | Cancel button, errors |
| `errorBg` | `#FDEAEA` | Error chip background |
| `success` | `#6B9E7A` | Completed status (same as primary) |
| `cancelled` | `#A0A8B4` | Cancelled status |

### Timeline dot colors

Five colors cycle through appointments to visually distinguish them:

| Name | Hex |
|------|-----|
| Sage | `#6B9E7A` |
| Sky blue | `#7B9ED9` |
| Soft purple | `#C97BBD` |
| Warm orange | `#E8734A` |
| Teal | `#5BB5C3` |

---

## Typography

No custom fonts are loaded — the app uses the system font stack:
- **iOS:** SF Pro
- **Android:** Roboto
- **Web:** system-ui / -apple-system / sans-serif

Font scale (from `src/constants/spacing.ts`):

| Token | Size | Used for |
|-------|------|----------|
| `xs` | 11px | Labels, chips, section titles |
| `sm` | 13px | Meta text, secondary info |
| `md` | 15px | Body text, list items |
| `lg` | 17px | Screen titles, list titles |
| `xl` | 20px | Card headings |
| `xxl` | 24px | Hero title, large headings |
| `xxxl` | 32px | Display (login screen) |

---

## Spacing & Radius

Spacing scale (multiples of 4px):

```
xs: 4    sm: 8    md: 16    lg: 24    xl: 32    xxl: 48
```

Border radius:

```
sm: 8    md: 12    lg: 16    xl: 24    full: 9999
```

Cards use `xl` (24px) radius. Chips use `full` (pill shape). Inputs use `lg` (16px).

---

## Component Patterns

### Cards

All cards follow this pattern:
- White background (`Colors.surface`)
- 1px border (`Colors.border`) — subtle, not heavy shadow
- `BorderRadius.xl` (24px) corners
- Soft shadow: `shadowOpacity: 0.06–0.08`

### Timeline

The appointment list uses a vertical timeline:
- Thin 2px line (`Colors.border`) running down the left
- Colored dot (from the 5-color cycle) at the top of each card
- Cards sit to the right of the timeline with a small gap

This makes it easy to scan chronologically and visually group appointments by type (each appointment type tends to get the same dot color over time).

### Status chips

Pill-shaped chips with a colored background tint:
- Scheduled: blue `#7B9ED9` at 18% opacity, blue text
- Completed: sage `#6B9E7A` at 20% opacity, sage text
- Cancelled: grey `#A0A8B4` at 20% opacity, grey text

### Hero card (Next Appointment)

The most important piece of UI. Always shows the very next upcoming appointment:
- White card with a soft shadow
- "NEXT APPOINTMENT" pill label in sage green
- Countdown badge ("In 2 days", "Tomorrow", "In 3h") — turns amber/orange when under 24h
- Escort row at the bottom: avatar initial + name, or "I'm Going" button if unassigned

### FAB (Floating Action Button)

- 56px circle, sage green
- Positioned `bottom: 28, right: 24` (above tab bar)
- Deeper shadow (`shadowOpacity: 0.35`) to lift it visually

### Bottom tab bar

Three tabs: **Home**, **History**, **Family**

- 72px tall
- Emoji icons — simple, no SVG dependencies, render well cross-platform
- Active tab: emoji at full opacity + sage green label
- Inactive: emoji at 45% opacity + muted grey label

---

## Screen Breakdown

### Home (Dashboard)

```
SafeAreaView
  FlatList
    ListHeaderComponent:
      [Greeting + avatar]
      [Hero card — next appointment]
      [Section title "Upcoming" with count badge]
    renderItem:
      [TreatmentCard in timeline row]
  FAB (absolute)
```

### History

Groups past appointments by month. Filter tabs (All / Completed / Cancelled) at the top. Same timeline pattern as dashboard but muted — completed items show a green "Done" badge, cancelled show strikethrough title.

### Family

Shows the signed-in user's profile card (sage green), then all family members with colored avatars, then the authorized email list, then Sign Out.

### New Appointment (2 steps)

**Step 1 — Choose type:**
Preset cards in a 2-column grid. Each preset uses one of the 5 dot colors as a border + background tint (not a solid fill, which felt heavy). Icon is inside a soft circle.

**Step 2 — Set date & time:**
Date and time are in a single grouped card (like iOS Settings rows) — tap either row to open the native date/time picker. Reminder toggles below. Save button at the bottom.

### Detail Screen

- Status badge at the top of the hero card
- Meta info (date, time, location) in a grouped card with small icon boxes
- Location row is tappable — opens Google Maps
- Escort section (EscortManager component)
- Post-visit summary section appears after the appointment date passes
- Cancel / Complete action buttons at the bottom

---

## Platform differences

### Web vs Native — Date picker

`DatePickerModal` has two implementations resolved by Metro bundler:
- `DatePickerModal.tsx` — web: uses `<input type="date">` / `<input type="time">` native HTML elements
- `DatePickerModal.native.tsx` — iOS/Android: uses `@react-native-community/datetimepicker`

### Web vs Native — Notifications

`notificationService.ts` and `useNotifications.ts` both guard with `Platform.OS !== 'web'` before loading `expo-notifications`. On web the module is never imported (avoids a crash since expo-notifications has native-only code).

---

## PWA (Progressive Web App) setup

The app is deployed as a PWA so family members can install it from Safari/Chrome without an App Store:

| File | Purpose |
|------|---------|
| `web/manifest.json` | PWA manifest: name, icons, theme color, standalone display |
| `web/apple-touch-icon.png` | 180×180 icon for "Add to Home Screen" on iPhone |
| `web/icon-192.png` | Android home screen icon |
| `web/icon-512.png` | PWA splash / large icon |
| `web/index.html` | Includes `apple-mobile-web-app-*` meta tags |

**To install on iPhone:** Open in Safari → Share button → "Add to Home Screen"  
**To install on Android:** Open in Chrome → three-dot menu → "Install App"

---

## Icon design

The app icon is a **sage green rounded square** with a **white heart** and a small sage dot inside — representing family care and love.

Generated programmatically using PowerShell's `System.Drawing` library:
- 512×512 for PWA / high-res
- 192×192 for Android
- 180×180 for Apple Touch Icon
- 32×32 for browser favicon

Script: `scripts/generate-icons.ps1` (or inline in the session history)

---

## Prototype

An interactive HTML prototype was built before the React Native implementation:
- File: `familycare-sync-prototype.html`
- Open in any browser — no build step needed
- Shows all 5 screens with transitions and interactions
- Used as the design reference for the React Native UI

Key differences between prototype and final app:
- Prototype uses Inter font + CSS variables; app uses system fonts + TypeScript tokens
- Prototype has fully animated transitions; app uses React Navigation defaults
- Smart Suggestions flow (blood test + fasting reminder after appointment creation) is in the prototype but not yet implemented in the app

---

## What's not built yet

| Feature | Notes |
|---------|-------|
| Smart Suggestions | After creating an appointment, suggest related ones (e.g., blood test before chemo) |
| Document uploads | Upload and store PDFs / photos per appointment |
| Push notifications | Works on native builds; disabled on web |
| Android APK | Requires EAS build (Expo Application Services) |
| Calendar import | Google Calendar sync exists via Cloud Functions; iCal export not yet built |
