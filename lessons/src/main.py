from typing import Annotated
from fastapi import Depends, FastAPI, File
from sqlalchemy.orm import Session
from .crud import *
from .models import *
from .schemas import *
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


@app.post("/lessons/category", response_model=Category)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    return create_category(db=db, category=category)


@app.put("/lessons/category/{id}")
def update_category(id: int, thumbnail: Annotated[bytes, File()], db: Session = Depends(get_db)):
    return update_category(db=db, id=id, thumbnail=thumbnail)


@app.get("/lessons/category", response_model=list[Category])
def get_categories(db: Session = Depends(get_db)):
    return get_categories(db=db)


@app.post("/lessons/topic/", response_model=Topic)
def create_topic(topic: schemas.TopicCreate, db: Session = Depends(get_db)):
    return create_topic(db=db, topic=topic)


@app.get("/lessons/{category_id}/topics", response_model=list[Topic])
def get_topics_by_category(category_id: str, db: Session = Depends(get_db)):
    return get_topics_by_category(db=db, category_id=category_id)


@app.get("/lessons/lesson/{lesson_id}", response_model=Lesson)
def get_lesson_by_id(lesson_id: str, db: Session = Depends(get_db)):
    return get_lesson_by_id(db=db, lesson_id=lesson_id)


@app.post("/lessons/lesson/", response_model=Lesson)
def create_lesson(lesson: schemas.LessonCreate, db: Session = Depends(get_db)):
    return create_lesson(db=db, lesson=lesson)
