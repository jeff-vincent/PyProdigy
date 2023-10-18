from sqlalchemy.orm import Session, joinedload
import models
import schemas

def get_topic_by_id(db: Session, id: str):
    return db.query(models.Topic).filter(models.Topic.id == id).first()

def get_topics_by_category(category_id: str, db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Topic).filter(models.Topic.category_id == category_id).offset(skip).limit(limit).all()

def create_topic(db: Session, topic: schemas.TopicCreate):
    db_topic = models.Topic(**topic.dict())
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    return db_topic

def create_lesson(db: Session, lesson: schemas.LessonCreate):
    db_lesson = models.Lesson(**lesson.dict())
    db.add(db_lesson)
    db.commit()
    return db_lesson

def get_lessons(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Lesson).offset(skip).limit(limit).all()

def get_lesson_by_id(db: Session, lesson_id: int):
    return db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()

def get_category_by_id(db: Session, id: str):
    return db.query(models.User).filter(models.Category.id == id).first()

def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Category)
        .options(joinedload(models.Category.topics).joinedload(models.Topic.lessons))
        .offset(skip)
        .limit(limit)
        .all()
    )

def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def update_category(db: Session, id: int, thumbnail: bytes):
    db_category = db.query(models.Category).filter(models.Category.id == id).first()
    db_category.thumbnail = thumbnail
    db.commit()
    db.refresh(db_category)
    return db_category
