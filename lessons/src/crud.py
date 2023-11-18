from sqlalchemy.orm import Session, joinedload
import models
import schemas
import logging

logging.basicConfig(level=logging.INFO)


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


# TODO: write sorting logic for display order
def get_categories(db: Session, skip: int = 0, limit: int = 100):
    unsorted_data = (
        db.query(models.Category)
        .options(joinedload(models.Category.topics).joinedload(models.Topic.lessons))
        .offset(skip)
        .limit(limit)
        .all()
    )
    sorted_data = sort_topics_and_lessons_within_categories(unsorted_data)

    return sorted_data


def sort_topics_and_lessons_within_categories(unsorted_data):
    for category in unsorted_data:
        # Sort topics in each category in ascending order by topic.display_index
        sorted_topics = sorted(category.topics, key=lambda x: x.display_index)
        category.topics = sorted_topics

        for topic in category.topics:
            # Sort lessons within each topic in ascending order by lesson.display_index
            sorted_lessons = sorted(topic.lessons, key=lambda x: x.display_index)
            topic.lessons = sorted_lessons

    sorted_data = unsorted_data
    return sorted_data



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


# TODO add update/delete category; topic; lesson
def update_lesson(db: Session, lesson: schemas.Lesson):
    existing_lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson.id).first()
    existing_lesson.text = lesson.text
    existing_lesson.example_code = lesson.example_code
    existing_lesson.name = lesson.name
    existing_lesson.expected_output = lesson.expected_output
    existing_lesson.display_index = lesson.display_index
    db.commit()
    db.refresh(existing_lesson)
    return existing_lesson

