from datetime import datetime
from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class CompletedLessonCreate(BaseModel):
    lesson_id: int
    user_id: int
    name: str
    # completed_date: datetime

class CompletedLesson(BaseModel):
    id: int
    lesson_id: int
    user_id: int
    name: str

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    email: str | None = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    completed_lessons: list[CompletedLesson] = []

    class Config:
        orm_mode = True

class UserInDB(User):
    hashed_password: str

class UserUpdate(UserBase):
    id: int | None = None
    is_active: bool | None = None
    password: str | None = None

    class Config:
        orm_mode = True

