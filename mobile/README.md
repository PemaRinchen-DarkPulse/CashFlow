# AiMedicare — Mobile

The cross-platform mobile application for AiMedicare, Bhutan's integrated digital health ecosystem. Built for patients, health providers, and pharmacies across all 20 dzongkhags.

## Tech Stack

- **React Native** with TypeScript
- **Expo SDK 54** with Expo Router (file-based routing)
- **React Navigation** for navigation
- **pnpm** as package manager

## Project Structure

```
mobile/
├── app/                       # File-based routes
│   ├── _layout.tsx            # Root layout
│   ├── modal.tsx              # Modal screen
│   └── (tabs)/                # Tab-based navigation
│       ├── _layout.tsx        # Tab layout
│       ├── index.tsx          # Home tab
│       └── explore.tsx        # Explore tab
├── assets/
│   └── images/                # App images
├── components/                # Reusable components
│   ├── ui/                    # Base UI components
│   ├── external-link.tsx
│   ├── haptic-tab.tsx
│   ├── hello-wave.tsx
│   ├── parallax-scroll-view.tsx
│   ├── themed-text.tsx
│   └── themed-view.tsx
├── constants/
│   └── theme.ts               # Theme configuration
├── hooks/                     # Custom hooks
│   ├── use-color-scheme.ts
│   └── use-theme-color.ts
└── scripts/
    └── reset-project.js       # Project reset utility
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [pnpm](https://pnpm.io/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Install Dependencies

```bash
pnpm install
```

### Start the App

```bash
pnpm start
```

This launches the Expo dev server. From there you can open the app in:

- [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go)

### Platform-Specific Commands

```bash
pnpm android    # Start on Android
pnpm ios        # Start on iOS
pnpm web        # Start on web
```

### Lint

```bash
pnpm lint
```

### Reset Project

```bash
pnpm reset-project
```

Moves starter code to `app-example/` and creates a blank `app/` directory.

## Design Considerations

- **Offline-first** — Functional without connectivity; syncs when available
- **Bilingual** — Dzongkha (primary) and English interfaces
- **Accessibility** — Voice-based interaction for low-literacy users
- **Low-bandwidth** — Optimised for rural connectivity conditions
- **SMS/USSD fallback** — Feature phone access planned

## Related

- [Root README](../README.md)
- [Product Requirements](../docs/Product.md)
- [Web App](../web/README.md)
