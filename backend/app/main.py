from fastapi import FastAPI
from .routes import testRoute

app = FastAPI(title="FastAPI Test API")

app.include_router(testRoute.router)

@app.get("/")
def home():
    return {"message": "Welcome to the API!"}