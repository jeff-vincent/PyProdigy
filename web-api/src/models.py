from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    sub = Column(String, unique=True, index=True)

    completed_lessons = relationship("CompletedLesson", back_populates="user")

class CompletedLesson(Base):
    __tablename__ = "completed_lessons"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    lesson_id = Column(Integer, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    completed_date = Column(DateTime)

    user = relationship("User", back_populates="completed_lessons")

    __table_args__ = (
        UniqueConstraint('lesson_id', 'user_id', name='uq_lesson_user'),
    )
