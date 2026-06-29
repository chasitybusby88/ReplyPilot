# ReplyPilot

AI-powered lead follow-up system for home service businesses.

## Project Structure

- `frontend/`: Vite + React + TypeScript
- `backend/`: Node.js + Express + TypeScript
- `shared/`: Shared types and utilities (planned)

## Getting Started

### Prerequisites

- Node.js (v20+)
- npm
- Neon account (for PostgreSQL)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `backend/.env`:
   ```
   DATABASE_URL=your_neon_connection_string
   PORT=3001
   ```

### Running the App

- Frontend: `cd frontend && npm run dev`
- Backend: `cd backend && npm run dev`

## Features

- Instant lead capture from website and Facebook
- AI-powered responses via email and text
- Automated 7-14 day nurture sequences
- Missed-call text-back
- Client dashboard for lead management
