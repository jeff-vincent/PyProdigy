from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from .database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    language = Column(String, index=True, nullable=True)

    topics = relationship("Topic", back_populates="category")


class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"))

    lessons = relationship("Lesson", back_populates="topic")
    category = relationship("Category", back_populates="topics")


class Lesson(Base):
    __tablename__ = "lessons"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"))
    # url = Column(String, index=True)
    example_code = Column(String, index=True)
    text = Column(String, index=True)

    topic = relationship("Topic", back_populates="lessons")
