import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class VehicleBase(BaseModel):
    plate_number: str = Field(..., max_length=20)
    type: str = Field(..., max_length=50)
    active: bool = True


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    plate_number: str | None = Field(default=None, max_length=20)
    type: str | None = Field(default=None, max_length=50)
    active: bool | None = None


class VehicleResponse(VehicleBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
