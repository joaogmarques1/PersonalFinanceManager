# PersonalFinanceManager

A feature-rich personal finance tracker built with **FastAPI** (Backend) and **React** (Frontend).

## Quick Start
The easiest way to run the project is using Docker.

### Prerequisites
- Docker & Docker Compose installed.

### Running the App
1.  **Start the services**:
    ```bash
    docker-compose up --build
    ```
    *(This will start the backend, frontend, and database. The database tables will be created automatically on the first run).*

2.  **Access the App**:
    - Frontend: [http://localhost:5173](http://localhost:5173)
    - Backend API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Features
- **Dashboard**: Overview of finances.
- **Transactions**: Log income and expenses.
- **Analytics**: Visual breakdown of spending.
- **Auth**: Secure login/registration.

## Tech Stack
- **Backend**: Python 3.11, FastAPI, SQLAlchemy, PostgreSQL.
- **Frontend**: React 18, Vite, TailwindCSS.

## Deployment

This project uses the following stack for deployment:

- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Backend**: [Google Cloud Run](https://cloud.google.com/run) (Docker)
- **Frontend**: [Vercel](https://vercel.com/) (Vite)

### Required Environment Variables

**Backend (Cloud Run):**
- `DATABASE_URL`: Connection string from Supabase.
- `SECRET_KEY`: Random string for JWT security.
- `CORS_ORIGINS`: Frontend domain (e.g., `https://your-app.vercel.app`).

**Frontend (Vercel):**
- `VITE_API_URL`: URL of the deployed Cloud Run backend.
