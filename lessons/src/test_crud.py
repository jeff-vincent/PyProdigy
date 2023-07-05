from sqlalchemy.orm import Session
from unittest.mock import MagicMock
import models
import schemas
from crud import (
    get_topic_by_id,
    get_topics_by_category,
    create_topic,
    create_lesson,
    get_lessons,
    get_lesson_by_id,
    get_category_by_id,
    get_categories,
    create_category,
    update_category,
)

def test_get_topic_by_id():
    db = MagicMock(Session)
    topic_id = "topic_id"

    result = get_topic_by_id(db, topic_id)

    db.query.assert_called_once_with(models.Topic)
    db.query.return_value.filter.assert_called_once_with(models.Topic.id == topic_id)
    db.query.return_value.filter.return_value.first.assert_called_once()

# def test_get_topics_by_category():
#     db = MagicMock(Session)
#     category_id = "category_id"
#     skip = 0
#     limit = 100
#
#     result = get_topics_by_category(category_id, db, skip, limit)
#
#     db.query.assert_called_once_with(models.Topic)
#     db.query.return_value.filter.assert_called_once_with(models.Topic.category_id == category_id)
#     db.query.return_value.offset.assert_called_once_with(skip)
#     db.query.return_value.limit.assert_called_once_with(limit)
#     db.query.return_value.all.assert_called_once()
#
# def test_create_topic():
#     db = MagicMock(Session)
#     topic = schemas.TopicCreate()
#
#     result = create_topic(db, topic)
#
#     db_topic = models.Topic(**topic.dict())
#     db.add.assert_called_once_with(db_topic)
#     db.commit.assert_called_once()
#     db.refresh.assert_called_once_with(db_topic)
#     assert result == db_topic
#
# def test_create_lesson():
#     db = MagicMock(Session)
#     lesson = schemas.LessonCreate()
#
#     result = create_lesson(db, lesson)
#
#     db_lesson = models.Lesson(**lesson.dict())
#     db.add.assert_called_once_with(db_lesson)
#     db.commit.assert_called_once()
#     assert result == db_lesson
#
# def test_get_lessons():
#     db = MagicMock(Session)
#     skip = 0
#     limit = 100
#
#     result = get_lessons(db, skip, limit)
#
#     db.query.assert_called_once_with(models.Lesson)
#     db.query.return_value.offset.assert_called_once_with(skip)
#     db.query.return_value.limit.assert_called_once_with(limit)
#     db.query.return_value.all.assert_called_once()
#
# def test_get_lesson_by_id():
#     db = MagicMock(Session)
#     lesson_id = 1
#
#     result = get_lesson_by_id(db, lesson_id)
#
#     db.query.assert_called_once_with(models.Lesson)
#     db.query.return_value.filter.assert_called_once_with(models.Lesson.id == lesson_id)
#     db.query.return_value.filter.return_value.first.assert_called_once()
#
# def test_get_category_by_id():
#     db = MagicMock(Session)
#     category_id = "category_id"
#
#     result = get_category_by_id(db, category_id)
#
#     db.query.assert_called_once_with(models.User)
#     db.query.return_value.filter.assert_called_once_with(models.Category.id == category_id)
#     db.query.return_value.filter.return_value.first.assert_called_once()
#
# def test_get_categories():
#     db = MagicMock(Session)
#     skip = 0
#     limit = 100
#
#     result = get_categories(db, skip, limit)
#
#     db.query.assert_called_once_with(models.Category)
#     db.query.return_value.options.assert_called_once_with(
#         models.Category.topics.joinedload(models.Topic.lessons)
#     )
#     db.query.return_value.offset.assert_called_once_with(skip)
#     db.query.return_value.limit.assert_called_once_with(limit)
#     db.query.return_value.all.assert_called_once()
#
# def test_create_category():
#     db = MagicMock(Session)
#     category = schemas.CategoryCreate
