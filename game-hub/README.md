# GameHub

A complete React + Express + MongoDB-ready multi-game platform inspired by the PDF project plan.

## Features

- Home page with multiple game cards
- Auth: register/login/logout
- Profile and game history
- Leaderboard and points tracking
- Admin dashboard for adding games
- Playable games: Tic-Tac-Toe, Rock Paper Scissors, Number Guess
- Demo mode works without MongoDB by using in-memory data storage

## Tech Stack

- Frontend: React + Vite + React Router
- Backend: Node.js + Express
- Database: MongoDB-ready with Mongoose, fallback local memory store for demo
- Auth: JWT + bcrypt

## Project structure

- `backend/` – API server, auth, routes, score logic
- `frontend/` – React application with game pages and layouts

## Quick start

1. Open a terminal in the project root.
2. Install dependencies:
   - `npm install`
   - `npm install --prefix backend`
   - `npm install --prefix frontend`
3. Start both apps together:
   - `npm run dev`
4. Frontend runs at `http://localhost:5173`
5. Backend runs at `http://localhost:5000`

## Demo login

- Email: `admin@example.com`
- Password: `admin123`

## Notes

- The backend falls back to in-memory storage when no `MONGO_URI` is provided.
- For MongoDB, set `MONGO_URI` in `backend/.env`.
