import logging
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from . import models


def get_completed_lessons_by_id(db: Session, user_id: int):
    user = db.query(models.User).options(joinedload(models.User.completed_lessons)).filter(
        models.User.id == user_id).first()
    completed_lessons = user.completed_lessons
    completed_lesson_display_list = []
    for completed_lesson in completed_lessons:
        completed_lesson_display = {
            'lessonName': completed_lesson.name,
            'completedDate': completed_lesson.completed_date
        }
        completed_lesson_display_list.append(completed_lesson_display)

    return completed_lesson_display_list



def get_user_by_sub(db: Session, auth0_user: dict):
    return db.query(models.User).filter(models.User.sub == auth0_user['sub']).first()


# def get_users(db: Session, skip: int = 0, limit: int = 100):
#     return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, auth0_user: dict):
    db_user = models.User(sub=auth0_user['sub'])
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# def update_user(db: Session, db_user: models.User, user: schemas.UserUpdate):
#     db_user.email = user.email
#     db_user.hashed_password = auth.get_password_hash(user.password)
#     db.add(db_user)
#     db.commit()
#     db.refresh(db_user)
#     return db_user
#
#
def create_completed_lesson(db: Session, completed_lesson: dict):
    completed_date = datetime.now()
    db_completed_lesson = models.CompletedLesson(**completed_lesson)
    db_completed_lesson.completed_date = completed_date
    db.add(db_completed_lesson)
    db.commit()
    db.refresh(db_completed_lesson)
    return db_completed_lesson

