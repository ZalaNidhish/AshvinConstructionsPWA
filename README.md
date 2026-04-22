# Ashvin Construction PWA — Setup Guide

## Tech Stack
- React (Vite) + idb + vite-plugin-pwa
- 100% offline, installable on Android

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Development server
npm run dev
# Opens at http://localhost:5173

# 3. Production build
npm run build

# 4. Preview production (full PWA features)
npm run preview
# Opens at http://localhost:4173
```

## Deploy to Netlify (Free)
1. Run: npm run build
2. Go to https://netlify.com/drop
3. Drag & drop the dist/ folder
4. Get your live URL

## Install on Android
1. Open the URL in Chrome
2. Tap menu (three dots)
3. Tap "Add to Home screen"
4. Tap "Add" — done!

## Project Structure
```
src/
  App.jsx              - Root + routing
  db.js                - IndexedDB offline storage
  constants.js         - Gujarati items & categories
  components/
    UI.jsx             - Shared components
    BottomNav.jsx      - Navigation bar
    Splash.jsx         - Splash screen
    MaterialsTab.jsx
    LabourTab.jsx
    PaymentsTab.jsx
    MiscTab.jsx
    SummaryTab.jsx
  pages/
    Dashboard.jsx
    Projects.jsx
    ProjectDetail.jsx
    Settings.jsx
```
