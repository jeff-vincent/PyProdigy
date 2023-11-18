from sqlalchemy import Column, ForeignKey, Integer, String, LargeBinary, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    language = Column(String, index=True, nullable=True)
    thumbnail = Column(LargeBinary, index=True)

    topics = relationship("Topic", back_populates="category")


class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"))
    display_index = Column(Integer)

    lessons = relationship("Lesson", back_populates="topic")
    category = relationship("Category", back_populates="topics")

    __table_args__ = (
        UniqueConstraint('name', 'category_id', name='uq_category_topic'),
    )


class Lesson(Base):
    __tablename__ = "lessons"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"))
    expected_output = Column(String, index=True)
    example_code = Column(String, index=True)
    text = Column(String, index=True)
    display_index = Column(Integer)

    topic = relationship("Topic", back_populates="lessons")

    __table_args__ = (
        UniqueConstraint('name', 'topic_id', name='uq_topic_lesson'),
    )
