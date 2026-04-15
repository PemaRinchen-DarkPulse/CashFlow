# AiMedicare

Bhutan's first fully integrated digital health ecosystem — a three-way platform connecting **Health Service Providers**, **Patients**, and **Pharmacies** through a single, culturally rooted, AI-assisted application.

Built to extend Bhutan's free public healthcare into its most remote dzongkhags, amplify the capacity of frontline health workers, and deliver seamless care to every Bhutanese citizen regardless of geography, literacy, or connectivity.

> *A quiet, culturally rooted, bilingual health companion — extending Bhutan's free public health system into its most remote valleys, strengthening the hands of its frontline health workers, and serving the deeper GNH goal: long life, good health, and happiness for every Bhutanese citizen.*

---

## Architecture

AiMedicare is structured around three interconnected actor nodes:

```
        HEALTH PROVIDERS
        (Doctors, BHU Staff, CHWs, Specialists)
              /         \
             /           \
            /             \
        PATIENTS ————— PHARMACY
     (Citizens, rural    (Pharmacies, MSD,
      & urban)            BHU Drug Stores)
```

Every interaction between any two nodes is mediated, logged, and secured through the AiMedicare platform.

---

## Project Structure

```
AiMedicare/
├── docs/            # Product documentation
│   └── Product.md   # Full Product Requirements Document
├── mobile/          # React Native (Expo) mobile app
├── web/             # React (Vite) web application & landing page
└── server/          # Backend API (planned)
```

| Package | Tech Stack | Description |
|---------|-----------|-------------|
| `mobile/` | React Native, Expo, TypeScript | Cross-platform mobile app for patients, providers, and pharmacies |
| `web/` | React, Vite, TypeScript, Tailwind CSS | Web application and marketing landing page |
| `server/` | TBD | Backend API, database, and AI services |

---

## Key Features

### For Health Providers
- Full longitudinal patient health records
- AI-generated pre-consultation summaries
- Digital prescriptions and referral letters with tracking
- Teleconsultation (video/voice) with rural BHUs
- Clinical decision support and emergency guidance for CHWs
- Embedded microlearning and CPD tracking

### For Patients
- Unique health ID linked to CID number
- Appointment booking and teleconsultation
- AI-powered symptom assessment and care routing
- Full health record access in Dzongkha or English
- NCD self-monitoring (BP, glucose, weight)
- Emergency SOS with GPS and medevac request
- Offline-first with SMS/USSD fallback

### For Pharmacies
- Real-time digital prescription fulfilment
- Live drug inventory with auto-resupply to MSD
- AI drug interaction and allergy alerts
- Controlled substance audit trail
- Bilingual dispensing labels (Dzongkha + English)

### Specialised Modules
- **Maternal & Child Health** — pregnancy monitoring, EPI immunisation tracking, nutrition monitoring
- **NCD Chronic Disease** — vitals logging, trend alerts, remote prescription renewal, mental health screening
- **Disease Surveillance** — outbreak detection, MoH alerts, HMIS-integrated epidemiological dashboards
- **Traditional Medicine (Sowa Rigpa)** — digital prescriptions, drug-herb interaction alerts, complementary care pathways

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [pnpm](https://pnpm.io/) package manager

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd AiMedicare

# Install web dependencies
cd web
pnpm install

# Install mobile dependencies
cd ../mobile
pnpm install
```

### Running the Apps

```bash
# Web (from web/)
pnpm dev

# Mobile (from mobile/)
pnpm start
```

See each package's README for detailed instructions:
- [Web README](web/README.md)
- [Mobile README](mobile/README.md)

---

## Technical Requirements

| Requirement | Specification |
|---|---|
| **Connectivity** | Functional offline; syncs when connectivity available |
| **Supported Devices** | Android smartphones (primary); feature phones via SMS/USSD |
| **Languages** | Dzongkha (primary), English (professional), regional dialect support |
| **Interaction Modes** | Text, voice, SMS, USSD |
| **Data Hosting** | Bhutan-based servers; MoH-controlled infrastructure |
| **Encryption** | End-to-end for all patient-provider-pharmacy communications |
| **Integration** | Bhutan HMIS, MSD inventory systems, CID national identity database |
| **AI Governance** | Explainability required; human-in-the-loop mandatory |

---

## GNH Alignment

AiMedicare embodies Gross National Happiness values as structural requirements:

- **Psychological wellbeing** — Mental health modules grounded in mindfulness; no alarm-inducing notification design
- **Time and balance** — Notification settings avoid overwhelming users
- **Community vitality** — Strengthens the CHW network as a tool, never a replacement
- **Cultural preservation** — Bhutanese cultural identity in all content, interface, and visual design
- **Good governance** — Full transparency in AI recommendations; data under MoH control

---

## Rollout Phases

| Phase | Timeline | Focus |
|-------|----------|-------|
| **Foundation** | Year 1 | Core health ID, digital prescriptions, pharmacy fulfilment in Thimphu & Phuentsholing |
| **Rural Expansion** | Year 2 | All 20 dzongkhags, BHU drug stores, CHW decision support, offline-first mode |
| **Full Integration** | Year 3 | Sowa Rigpa integration, full HMIS, NCD & mental health modules, nationwide Emergency SOS |

---

## Documentation

- [Product Requirements Document](docs/Product.md)

---

## License

TBD
