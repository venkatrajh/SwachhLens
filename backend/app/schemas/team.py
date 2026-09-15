import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class TeamBase(BaseModel):
    name: str = Field(..., max_length=100)
    category: str | None = Field(default=None, max_length=50)
    active: bool = True


class TeamCreate(TeamBase):
    pass


class TeamUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=100)
    category: str | None = Field(default=None, max_length=50)
    active: bool | None = None


class TeamResponse(TeamBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
