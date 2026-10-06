# MindFresh

MindFresh is a modern multi-game platform with arcade, puzzle, educational, and real-time live arena gameplay.

## Features

- Home dashboard with 10 game cards
- Login, register, and profile tracking
- Leaderboard and score history
- Admin dashboard for adding games
- Real-time multiplayer arena based on Socket.IO
- Playable games:
  - Tic Tac Toe
  - Snake
  - Rock Paper Scissors
  - Memory Card
  - Quiz
  - Number Guessing
  - Word Scramble
  - Math Challenge
  - Simon Says
  - 2048
- Demo mode works without MongoDB by using in-memory data storage

## Tech Stack

- Frontend: React + Vite + React Router
- Backend: Node.js + Express + Socket.IO
- Database: MongoDB-ready with Mongoose, fallback local memory store for demo
- Auth: JWT + bcrypt

## Quick start

1. Open a terminal in the project root.
2. Install dependencies:
   - `npm install`
   - `npm install --prefix backend`
   - `npm install --prefix frontend`
3. Start backend and frontend with the correct absolute project paths if needed.
4. Frontend runs at `http://localhost:5174` in the current local setup.
5. Backend runs at `http://localhost:5000`

## Demo login

- Email: `admin@example.com`
- Password: `admin123`

## Real-time play

Use the Live Arena page to create a room and join another player in a shared Tic-Tac-Toe match.
