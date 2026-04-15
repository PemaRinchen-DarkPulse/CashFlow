# AiMedicare — Web

The web application and marketing landing page for AiMedicare, Bhutan's integrated digital health ecosystem.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for bundling and dev server
- **Tailwind CSS v4** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **pnpm** as package manager

## Project Structure

```
web/
├── public/                    # Static assets
└── src/
    ├── main.tsx               # App entry point
    ├── App.tsx                # Root component
    ├── index.css              # Global styles
    ├── assets/                # Images and media
    └── components/
        └── landing/           # Landing page sections
            ├── Navbar.tsx
            ├── Hero.tsx
            ├── FeatureCards.tsx
            ├── Features.tsx
            ├── HowItWorks.tsx
            ├── ConnectionSection.tsx
            ├── MonitorSection.tsx
            ├── PhoneMockup.tsx
            ├── Testimonials.tsx
            ├── CultureValues.tsx
            ├── CTABanner.tsx
            └── Footer.tsx
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [pnpm](https://pnpm.io/)

### Install Dependencies

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Opens the dev server at [http://localhost:5173](http://localhost:5173).

### Build

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

### Lint

```bash
pnpm lint
```

## Related

- [Root README](../README.md)
- [Product Requirements](../docs/Product.md)
- [Mobile App](../mobile/README.md)
