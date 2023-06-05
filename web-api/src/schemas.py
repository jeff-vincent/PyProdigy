from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class PetBase(BaseModel):
    name: str

class PetCreate(PetBase):
    owner_id: int | None = None

class Pet(PetBase):
    id: int

    class Config:
        orm_mode = True

class PetUpdate(PetBase):
    id: int | None = None
    owner_id: int | None = None
    name: str | None = None

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    email: str | None = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    pets: list[Pet] = []

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

