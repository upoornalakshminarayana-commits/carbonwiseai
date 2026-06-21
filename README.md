# CarbonWise AI

CarbonWise AI is a premium, investor-grade climate-tech SaaS application that empowers individuals to monitor, calculate, and systematically reduce their daily carbon emissions. It combines interactive lifestyle calculators, real-time analytics, gamified achievements, and a personalized AI Coaching Co-pilot to inspire sustainable behavioral change.

## Key Features

* **Multi-Step Carbon Calculator**: Establish a lifestyle emission baseline across Transportation, Home Energy, Food & Diet, Shopping, and Waste Management.
* **Interactive Carbon Simulator**: Visualize the real-time ecological impact of lifestyle changes (such as commuting via bike or shifting to plant-based meals) before committing to them.
* **AI Coaching Co-pilot**: Receive dynamically generated, personalized, and actionable reduction insights tailored to your primary emission drivers.
* **Gamified Goals & Challenges**: Accept weekly challenges, earn professional ranks (Associate to Climate Intelligence Fellow), and unlock digital badge certifications.
* **Clean & Modern SaaS Dashboard**: View interactive progress charts, weekly log histories, emission savings metrics, and a community leaderboard.

## Tech Stack & Architecture

* **Frontend**: React (v18), TypeScript, Recharts (for analytics visualization), and high-performance custom Scroll Reveal animations powered by the `IntersectionObserver` API.
* **Styling**: Modern Vanilla CSS design system utilizing sleek glassmorphism, tailored HSL color palettes, and responsive layouts. No bulky UI dependencies.
* **Backend**: Express (v4), Node.js, SQLite3 (embedded relational database).
* **Database**: SQLite3 database (`carbonwise.db`) initialized and seeded automatically on first run.

## Setup & Running Locally

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation

1. Install root, client, and server dependencies:
   ```bash
   npm run install:all
   ```

2. Start the development server (runs both client and server concurrently):
   ```bash
   npm run dev
   ```

* Client dev server runs on: `http://localhost:5173`
* Server API runs on: `http://localhost:3001`

### Production Build

To verify compilation and create production-optimized bundles:
```bash
npm run build
```

## Repository Optimization Summary

* **Estimated Size**: ~624 KB (comfortably below the 10 MB hackathon limit).
* **Asset Strategy**: Uses clean vector SVG icons and CSS gradients. Zero heavy binary files (no PNG/JPG images, videos, or PDFs).
* **Clean Git History**: Excludes intermediate artifacts, local database runtimes, `.env` files, build output folders (`dist/`), and dependency folders (`node_modules/`) via a comprehensive `.gitignore` policy.
