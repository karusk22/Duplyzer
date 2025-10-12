from fastapi import FastAPI
from .routes import testRoute, checkerRoute

app = FastAPI(title="FastAPI Test API")

app.include_router(testRoute.router)
app.include_router(checkerRoute.checkRouter)

@app.get("/")
def home():
    return {"message": "Welcome to the API!"}