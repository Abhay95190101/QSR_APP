# SS Cafe & Restaurant | QSR & Dine-In Digital Ordering System (PWA & Mobile APK)

A digital ordering and dine-in table QR management system with live kitchen sync, sound notifications, multi-role staff access, and 1-tap mobile installation / Android APK generation.

---

## 🚀 Quick Start in VS Code

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [VS Code](https://code.visualstudio.com/)

### 2. Installation
Open the project directory in VS Code, open the integrated terminal (`Ctrl + ~` or `Cmd + ~`), and run:

```bash
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

*(Optional: Set your `GEMINI_API_KEY` in `.env` if you want AI-assisted features enabled).*

### 4. Run Development Server
Start the development server with live backend and full-stack Vite reload:

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🛠️ Project Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs the full-stack app (Express backend + Vite React client) on port 3000 |
| `npm run build` | Compiles and builds production assets into `dist/` |
| `npm start` | Starts the production server using built assets |
| `npm run lint` | Runs TypeScript type checking |

---

## 📱 Mobile APK & PWA

- **Direct Install**: Open the app in Chrome/Safari on mobile and tap **"Get APK"** / **"Install App"** in the header.
- **APK Export**: Use the in-app **Mobile App & APK Center** to generate a signed `.apk` or Google Play `.aab` package via PWABuilder with 1 click.

---

## 📁 Key Directories

- `src/App.tsx` — Root application state, real-time order polling & notifications
- `src/components/customer/` — Customer QR scanning, dining menu, burger customizer & cart
- `src/components/owner/` — Manager portal, KDS order manager, menu builder, financial day-end
- `src/components/pwa/` — Mobile APK modal, install prompts & offline indicators
- `server.ts` — Express REST API with real-time order broadcast & dev proxy
