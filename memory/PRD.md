# BETA MAX - PRD (Product Requirements Document)

## Project Overview
**Betamax** is a retro-futuristic QA platform that transforms beta testing into a gamified reputation-based economy. It features a cyberpunk aesthetic with smooth animations, a terminal interface for power users, and a points-based reward system.

**Version:** 3.0.0  
**Last Updated:** January 29, 2026

## Original Problem Statement
Build Betamax web portal for developers - a professional beta testing platform with:
- Dashboard with user stats
- Project/Mission browsing
- External beta app submissions (community-sourced)
- Bug/Anomaly submission with points rewards
- Mini-game to spend earned points
- Terminal mode (CLI interface)
- Retro-futuristic animations and graphics

## Tech Stack
- **Frontend:** React 19 + Vite 6
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Icons:** Lucide React + Material Symbols
- **Routing:** React Router DOM v7 (HashRouter)
- **State:** React Context API
- **Data:** Mock data (Firebase-ready)

## User Personas
1. **Scouts (Testers)** - Hunt bugs, submit anomalies, earn Vector Points
2. **Architects (Developers)** - Manage projects, review anomalies, set bounties
3. **Admin** - Platform oversight and moderation

## Core Requirements
- [x] Authentication (mock/demo mode)
- [x] Dashboard with stats and activity
- [x] Missions/Projects listing with search/filter
- [x] Mission detail with overview, changelog, anomalies
- [x] Bug/Anomaly report submission
- [x] External Betas community submissions
- [x] Terminal interface with commands
- [x] Arcade game (Number Hunter)
- [x] Leaderboard system
- [x] Cyberpunk UI/UX with animations

## What's Been Implemented (Jan 29, 2026)

### MVP Complete
1. **Authentication System**
   - Mock login with demo accounts
   - Session management with Context
   - User profile in sidebar

2. **Dashboard (The Deck)**
   - Stats cards (Vector Points, Anomalies, Accuracy, Games Won)
   - Active missions grid
   - Recent anomaly logs

3. **Missions Page**
   - Project cards with images
   - Search and status filters
   - Payout information per bug

4. **Mission Detail**
   - Tabs: Overview, Changelog, Anomalies
   - Feature testing scope
   - Bounty program info
   - Community-reported anomalies

5. **Anomaly Report Form**
   - Project/version selection
   - Severity levels (Low/Medium/High/Critical)
   - Points reward preview

6. **External Betas**
   - Community-submitted beta links
   - Add new external beta form
   - Platform badges (iOS/Android)

7. **Terminal**
   - Working commands: help, status, missions, stats, anomalies, whoami, clear, ascii, matrix
   - Cyberpunk terminal styling

8. **Arcade**
   - Number Hunter game
   - Entry cost: 50 VP, Win reward: 200 VP
   - Leaderboard with rankings

## Backlog (P1/P2 Features)
- [ ] Firebase integration for persistent data
- [ ] Real user registration
- [ ] More arcade games
- [ ] Real-time notifications
- [ ] Dark/light theme toggle
- [ ] Mobile responsive improvements
- [ ] Achievement badges system
- [ ] Social features (follow, chat)

## API Keys Required
- Firebase credentials (user to configure):
  - VITE_FIREBASE_PROJECT_ID
  - VITE_FIREBASE_APP_ID
  - VITE_FIREBASE_STORAGE_BUCKET
  - VITE_FIREBASE_API_KEY
  - VITE_FIREBASE_AUTH_DOMAIN
  - VITE_FIREBASE_MESSAGING_SENDER_ID

## Demo Credentials
- **Scout:** neo@betamax.io (any password)
- **Architect:** sarah@betamax.io (any password)

## File Structure
```
/app/frontend/
├── src/
│   ├── App.jsx          # Main app with all components
│   ├── index.css        # Tailwind + custom styles
│   └── main.jsx         # Entry point
├── index.html           # HTML template with preloader
├── vite.config.js       # Vite configuration
├── package.json         # Dependencies
└── .env                 # Environment variables
```
