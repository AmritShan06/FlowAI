## FlowAI: Flowchart Builder 

Full-stack application with:
- React client (`client/`)
- Node.js/Express server (`server/`)
- MySQL database (`database/`)

### Tech Stack
- **Frontend**: React (Vite), React Flow, hooks, dagre for auto-layout
- **Backend**: Node.js, Express, JWT auth, dotenv, CORS
- **Database**: MySQL (users, flowcharts)
- **AI**: API-ready integration using axios, configurable via `.env`

### Folder Structure
- **client**: React SPA with flowchart builder UI, AI suggestions side panel, export JSON/PNG, dark mode.
- **server**: REST API for auth, flowchart save/load, AI suggestion endpoint.
- **database**: MySQL schema and example env.

### Quick Start

1. **Database**
   - Create MySQL database and tables:
   - Import `database/schema.sql` into your MySQL instance.

2. **Server**
   - `cd server`
   - `cp .env.example .env` (or create `.env` from the example)
   - `npm install`
   - `npm run dev`

3. **Client**
   - `cd client`
   - `cp .env.example .env`
   - `npm install`
   - `npm run dev`

4. Open the client URL (default `http://localhost:3000`), register/login, and start building flowcharts.

See inline comments in `.env.example` files and `services/aiService.js` for how to wire a real AI provider (OpenAI / Gemini / Claude, etc.).
