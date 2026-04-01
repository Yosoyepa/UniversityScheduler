from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.cross_cutting import register_exception_handlers
from app.modules.users.adapter.router import router as auth_router
from app.modules.academic_planning.adapter.router import router as academic_planning_router
from app.modules.tasks.adapter.router import router as tasks_router

settings = get_settings()

app = FastAPI(
    title="University Scheduler API",
    description="Backend for University Scheduler Application using Hexagonal Architecture",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register global exception handlers
register_exception_handlers(app)

# Register API routers with versioned prefix
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(
    academic_planning_router,
    prefix="/api/v1",
    tags=["academic-planning"]
)
app.include_router(
    tasks_router,
    prefix="/api/v1"
)


@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "University Scheduler API is running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)


