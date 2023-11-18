from pydantic import BaseModel


class LessonBase(BaseModel):
    name: str


class LessonCreate(LessonBase):
    name: str
    topic_id: int | None = None
    example_code: str | None = None
    text: str | None = None
    expected_output: str | None = None
    display_index: int | None = None


class Lesson(LessonBase):
    id: int
    name: str
    topic_id: int | None = None
    example_code: str | None = None
    text: str | None = None
    expected_output: str | None = None
    display_index: int | None = None

    class Config:
        orm_mode = True


class TopicBase(BaseModel):
    name: str | None = None


class TopicCreate(TopicBase):
    category_id: int
    display_index: int | None = None


class Topic(TopicBase):
    id: int
    display_index: int | None = None
    lessons: list[Lesson] = []

    class Config:
        orm_mode = True


class CategoryCreate(BaseModel):
    name: str 
    language: str | None = None


class Category(BaseModel):
    id: int
    name: str 
    language: str | None = None
    topics: list[Topic] = []
    lessons: list[Lesson] = []
    thumbnail: bytes | None = None 

    class Config:
        orm_mode = True
