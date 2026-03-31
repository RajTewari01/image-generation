from typing import Literal, Optional

from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    """Payload for generating an image."""

    prompt: str = Field(..., max_length=1500, description="The positive prompt to generate the image")
    pipeline: str = Field(
        ...,
        description="The target pipeline to use (must be a registered pipeline like 'anime', 'cars', 'difconsistency')",
    )
    style_type: Optional[str] = Field(
        None, description="For pipelines that support sub-types (e.g., 'photo' or 'detail')."
    )
    width: int = Field(512, ge=256, le=1024, description="Width, must be a multiple of 8")
    height: int = Field(768, ge=256, le=1024, description="Height, must be a multiple of 8")
    steps: int = Field(20, ge=1, le=150, description="Number of denoising steps")
    cfg: float = Field(7.0, ge=1.0, le=30.0, description="Classifier Free Guidance scale")
    negative_prompt: Optional[str] = Field(None, max_length=1500)
    seed: Optional[int] = Field(None, description="Random seed. If omitted, one will be generated.")


class JobStatusResponse(BaseModel):
    """Response representing the status of an active or completed job."""

    job_id: str
    status: Literal["pending", "processing", "completed", "failed"]
    progress: float = Field(..., description="Progress from 0.0 to 1.0")
    image_url: Optional[str] = Field(None, description="URL path to access the final image")
    error: Optional[str] = None
    created_at: float
    updated_at: float
