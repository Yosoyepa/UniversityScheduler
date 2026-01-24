# University Scheduler

A comprehensive academic management system for university students.

## Project Structure

This monorepo contains:

- **[backend/](backend/)**: FastAPI Application (Hexagonal Architecture)
- **[frontend/](frontend/)**: Next.js Application
- **[docs/](docs/)**: Architecture documentation and diagrams
- **[infra/](infra/)**: Infrastructure configurations

## Getting Started

### Backend

1. Navigate to `backend/`
2. Create a virtual environment: `python -m venv venv`
3. Activate it: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Run the server: `python -m app.main` ou `uvicorn app.main:app --reload`

### Frontend

1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`

## Documentation

See the [docs/](docs/) folder for detailed architectural decisions, diagrams, and API specifications.
