from fastapi import FastAPI
from .routes import testRoute, checkerRoute
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


app = FastAPI(title="FastAPI Test API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(testRoute.router)
app.include_router(checkerRoute.checkRouter)

@app.get("/")
def home():
    return {"message": "Welcome to the API!"}