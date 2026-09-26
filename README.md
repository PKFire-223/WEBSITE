# PolyPlay Arcade & Gaming Hub

A high-performance, responsive web arcade platform featuring 7 games with virtual mobile controllers, synthesized retro Web Audio, client-side cryptographic authentication, and a modular architecture ready for MongoDB integration.

---

## 🌟 Game Highlights

1. **Typing Shark: Vực Sâu Thần Hải (Roguelike Submarine Survival)**
   - Fast-paced underwater typing combat inspired by retro typing games.
   - Survive against 15 deep-sea monster archetypes across distinct oceanic depths.
   - Infinite Skill Tree evolution: AI Drone Auto-Typer (speeds up from 1 char/sec to 10 chars/sec), Titan Armor, Sonar Pulse Bombs, and Magnetic Shields.
   - Boss encounters every 5 minutes: Megalodon (Min 5), Kraken (Min 10), and Leviathan Prime (Min 15/25).
   - Built-in on-screen QWERTY virtual keyboard and native mobile keyboard triggers.

2. **Hải Chiến Bắn Tàu (Naval Command Battleship)**
   - Turn-based naval tactics against an algorithmic AI or local 2-player mode.
   - Dual-board viewport with fog of war and tactical heatmap probability radar.
   - 12 unlockable tactical devices (Sonar Radar, Tactical Smoke, 3-Tile Salvo, Torpedo Runs, Relocation).
   - Mobile board switcher tabs (`Both Boards`, `Enemy Board`, `Friendly Board`).

3. **Vạn Cổ Kỳ Trân (Gacha Bí Chỉ & Arcane Altar)**
   - Gacha summoning with 120 collectible relics across 6 rarity tiers (Common to Mythic).
   - 6-tier Shop upgrades, 10 Parchment Order trial waves, Arcane Cores, and Ancient Boons.

4. **Rắn Săn Mồi (Retro Lawn Snake)**
   - Classic 16x16 checkered lawn snake game.
   - Dynamic challenges after 30 seconds: random 5-second wall lockdowns, blackout glitches, falling bombs, and stun rocks.
   - Full touch swipe gestures and responsive arcade D-Pad with anti-reverse input protection.

5. **Xếp Khối Ma Thuật (Arcane Block Puzzle)**
   - 8x8 jewel grid placement with line-clear explosions and multiplier combos.
   - Reroll Dice, Magic Hammer, and on-screen directional pad with live tile preview.

6. **Đấu Pháo Ma Pháp (Artillery Duel vs AI)**
   - Turn-based parabolic projectile physics simulation.
   - Aiming angle steppers (`-5°`, `-1°`, `+1°`, `+5°`) and power steppers (`-10`, `-2`, `+2`, `+10`).
   - Step movement station with remaining step counters and terrain deformation.

7. **OnlyaFan**
   - Reflex survival game maintaining an oscillating standing fan.
   - Fast-action wind and lightning orb collection within strict 4-second despawn windows.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) & [TypeScript 5.7](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio Engine**: Synthesized [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) (zero external audio file latency, dynamic BGM loops, torpedoes, coin dings, and explosions)
- **Security & Cryptography**: Native [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) (SHA-256 password hashing with unique salt, 4-digit PIN lock, and security question verification)
- **Canvas Rendering**: HTML5 2D Canvas rendering for smooth particle physics, projectile trajectories, and boss animations.

---

## 📱 Mobile & Tablet Responsive Controls

All games feature touch-first virtual controllers designed for smartphones and iPads:
- **On-Screen D-Pads**: Large, tactile directional pads for movement and navigation.
- **Precision Steppers**: Dedicated fine-tuning buttons replacing small sliders on touchscreens.
- **Virtual QWERTY Keyboard**: Built-in 3-row on-screen keyboard for typing games on mobile.
- **Board Switcher Tabs**: Smooth toggling between friendly and enemy grids in naval combat without pinching or zooming.
- **Board Touch Swiping**: Direct gesture recognition for smooth directional steering.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) version **18.0.0** or higher
- [npm](https://www.npmjs.com/) version **9.0.0** or higher

### Installation

1. Clone or download the repository to your local machine:
   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd pkfire-website
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Development Server

Start the Vite development server on port 3000:
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

### Production Build

To create an optimized production build:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

### Code Verification & Linting

Run TypeScript type-checking:
```bash
npm run lint
```

---

## 🗄️ MongoDB Migration Guide

All mock accounts and initial game state data are isolated in a single dedicated file:
`src/data/mockSeedData.ts`

### How It Works:
1. **Offline / Fallback Mode**: When running without MongoDB, the app safely defaults to `localStorage` using the seed accounts provided in `mockSeedData.ts`.
2. **Export Seed Data**:
   - Open the **Tài Khoản** (Account) modal in the app.
   - Go to the **MongoDB Seed** tab to download the seed dataset as a JSON file (`polyplay_mongodb_seed.json`).
3. **Import to MongoDB**:
   - Use **MongoDB Compass** or `mongoimport` to import `polyplay_mongodb_seed.json` directly into your MongoDB `users` collection.
4. **Clean Removal**:
   - Once your MongoDB database is connected and populated, you can safely remove or empty `src/data/mockSeedData.ts` without searching through the rest of the codebase.

---

## 📁 Project Structure

```
├── public/                 # Static assets, SVG covers, icons
├── src/
│   ├── components/         # React components & UI modals
│   │   ├── games/          # Game modules (Snake, TypingShark, Battleship, etc.)
│   │   │   └── typingShark/# Monster renderers, submarine skins, ocean zones
│   │   ├── AuthModal.tsx   # Account login, registration, PIN lock, Mongo seed UI
│   │   ├── GameModal.tsx   # Responsive game container & 10-minute level tracker
│   │   └── ...
│   ├── data/               # Game configurations, skills, and mock seed data
│   │   ├── mockSeedData.ts # Isolated seed accounts & MongoDB export helpers
│   │   ├── gamesData.ts    # Game list and descriptions
│   │   └── ...
│   ├── types/              # TypeScript type definitions (auth, gacha, games)
│   ├── utils/              # Audio synthesizers, security crypto, math engines
│   ├── App.tsx             # Root application component
│   └── main.tsx            # Application entry point
├── metadata.json           # Application metadata & capabilities
├── package.json            # Project manifest & dependencies
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
└── README.md               # Project documentation (this file)
```

---

## 📄 License

This project is licensed under the MIT License.
