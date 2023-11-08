from fastapi import Depends, FastAPI, HTTPException, status, Form, Request
from sqlalchemy.orm import Session
import aiohttp
from . import crud, models
from .database import SessionLocal, engine
import logging

models.Base.metadata.create_all(bind=engine)
logging.basicConfig(level=logging.INFO)

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


@app.get('/api/get-user-by-sub/{sub}')
async def get_user_by_sub(sub: str, db: Session = Depends(get_db)):
    data = {'sub': sub}
    db_user = crud.get_user_by_sub(db, data)
    return db_user


@app.get('/api/get-completed-lessons')
async def get_completed_lessons_by_id(request: Request, db: Session = Depends(get_db)):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    auth0_user = await get_auth0_user(token)
    db_user = crud.get_user_by_sub(db, auth0_user)
    completed_lessons = crud.get_completed_lessons_by_id(db, db_user.id)
    return completed_lessons


@app.post('/api/completed-lesson')
async def create_completed_lesson(request: Request, completed_lesson: dict, db: Session = Depends(get_db)):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    auth0_user = await get_auth0_user(token)
    logging.info(f'Auth0 user: {auth0_user}')
    db_user = crud.get_user_by_sub(db, auth0_user)
    completed_lesson['user_id'] = db_user.id
    return crud.create_completed_lesson(db=db, completed_lesson=completed_lesson)
