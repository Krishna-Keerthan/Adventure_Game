from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.db.database import SessionLocal, create_tables
from app.routers import story, job, auth, game_session, stats
from contextlib import asynccontextmanager



@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.models import user as user_model
    from app.models import story as story_model        
    from app.models import game_session as gs_model    
    from app.models import job as job_model 

    create_tables()

    # Startup
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        print("✅ Database connection successful")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        raise
    yield


app = FastAPI(
    title="Adventure Game",
    lifespan=lifespan,
    description="Choose-your-own-adventure game powered by LLMs",
    version="0.1.0",
    docs_url='/docs',
    redoc_url='/redoc'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request , exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "detail":"An internal server error occurred."
        }
    )

app.include_router(story.router, prefix=settings.API_PREFIX )
app.include_router(job.router, prefix=settings.API_PREFIX)
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(game_session.router, prefix=settings.API_PREFIX)
app.include_router(stats.router, prefix=settings.API_PREFIX)

@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("main:app", host='localhost', port=8000, reload=True)

