from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    completed_lessons = relationship("CompletedLesson", back_populates="user")

class CompletedLesson(Base):
    __tablename__ = "completed_lessons"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    lesson_id = Column(Integer, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    completed_date = Column(DateTime)

    user = relationship("User", back_populates="completed_lessons")
