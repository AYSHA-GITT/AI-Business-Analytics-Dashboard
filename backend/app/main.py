from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import upload, chat, simulate, compare, upload_async, custom_metric

app = FastAPI(title="AI Business Dashboard API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://ai-business-analytics-dashboard-kct0wrclf-aysha-gitts-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(simulate.router, prefix="/api", tags=["Simulate"])
app.include_router(compare.router, prefix="/api", tags=["Compare"])
app.include_router(upload_async.router, prefix="/api", tags=["Async Upload"])
app.include_router(custom_metric.router, prefix="/api", tags=["Custom Metric"])

@app.get("/")
def read_root():
    return {"status": "Backend is running", "message": "Welcome to AI Business Dashboard API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}