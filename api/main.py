import os
import sys

import jobs
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from schemas import GenerateRequest, JobStatusResponse

app = FastAPI(
    title="Image Gen Lite API", description="Headless AI Inference Gateway for Stable Diffusion", version="1.0.0"
)

# CORS Middleware for React Vite client (typically running on localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the static files directory to serve generated images
# The engine saves images to 'output/images' relative to project root.
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
IMAGE_DIR = os.path.join(ROOT_DIR, "output", "images")
if not os.path.exists(IMAGE_DIR):
    os.makedirs(IMAGE_DIR)

app.mount("/images", StaticFiles(directory=IMAGE_DIR), name="images")


class HealthResponse(BaseModel):
    status: str
    version: str


@app.get("/api/v1/health", response_model=HealthResponse)
def health_check():
    """Verify the API is running."""
    return HealthResponse(status="ok", version="1.0.0")


@app.get("/api/v1/pipelines")
def list_pipelines():
    """
    Returns available pipelines dynamically sourced from the core engine.
    For the sake of isolation, we just execute a subprocess call to check registry,
    or we could dynamically inject the root directory into sys.path.
    """
    try:
        sys.path.insert(0, ROOT_DIR)
        from image_gen.pipeline.registry import discover_pipelines, get_all_pipelines

        discover_pipelines()

        pipelines = get_all_pipelines()
        out = {}
        for name, info in pipelines.items():
            out[name] = {"description": info.get("description", ""), "types": info.get("types", {})}
        return {"pipelines": out}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load pipelines: {str(e)}")


@app.post("/api/v1/generate")
def generate_image(request: GenerateRequest):
    """
    Submits an image generation job entirely detached from the API's main execution loop.
    Returns a Job ID immediately.
    """
    job_id = jobs.create_job(request)
    return {"job_id": job_id, "message": "Job queued successfully"}


@app.get("/api/v1/jobs/{job_id}", response_model=JobStatusResponse)
def get_job_status(job_id: str):
    """
    Client polling endpoint.
    Retrieves the background job trajectory.
    """
    job = jobs.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
