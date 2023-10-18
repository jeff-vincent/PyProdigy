from fastapi import Depends, FastAPI, HTTPException, status, Form
from sqlalchemy.orm import Session
import aiohttp
from . import crud, models
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_auth0_user(token):
    async with aiohttp.ClientSession() as session:
        async with session.get(f'http://auth-api:8000/authenticate/{token}') as response:
            auth0_user = await response.json()
            return auth0_user


@app.get('/api/user/{token}')
async def get_or_create_user(token: str, db: Session = Depends(get_db)):
    auth0_user = await get_auth0_user(token)
    try:
        db_user = crud.get_user_by_sub(db, auth0_user)
        if not db_user:
            db_user = crud.create_user(db, auth0_user)
    except:
        db_user = crud.create_user(db, auth0_user)
    return db_user



# @app.post('/api/completed-lesson')
# async def create_completed_lesson(completed_lesson: schemas.CompletedLessonCreate, db: Session = Depends(get_db)):
#     return crud.create_completed_lesson(db=db, completed_lesson=completed_lesson)
