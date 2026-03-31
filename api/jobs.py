import os
import subprocess
import threading
import time
import uuid
from typing import Any, Dict

from schemas import GenerateRequest, JobStatusResponse

# In-memory store for active and completed jobs.
# In a true FAANG production setup, this would be Redis + Celery.
JOBS: Dict[str, JobStatusResponse] = {}

# The root directory of the stable diffusion repository
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# Which Python to use to run the core engine.
# We don't want the current sys.executable since that's the pure API venv.
# Either use a hardcoded env path or just generic "python" which resolves to the system one.
# An environment variable like CORE_PYTHON_EXE is best.
CORE_PYTHON = os.getenv("CORE_PYTHON_EXE", "python")


def create_job(request: GenerateRequest) -> str:
    """Creates a tracking record in the queue and starts a worker thread."""
    job_id = str(uuid.uuid4())
    now = time.time()

    # Initialize the job in memory
    JOBS[job_id] = JobStatusResponse(job_id=job_id, status="pending", progress=0.0, created_at=now, updated_at=now)

    # Start the worker thread
    thread = threading.Thread(target=_worker_process, args=(job_id, request))
    thread.daemon = True
    thread.start()

    return job_id


def get_job(job_id: str) -> JobStatusResponse | None:
    """Retrieves job status."""
    return JOBS.get(job_id)


def _worker_process(job_id: str, request: GenerateRequest):
    """
    Subprocess execution of the core engine.
    This guarantees 100% VRAM release after completion because the entire
    PyTorch/CUDA runtime is instantiated inside the subprocess and killed upon exit.
    """
    now = time.time()
    job = JOBS[job_id]
    job.status = "processing"
    job.progress = 0.1
    job.updated_at = now

    try:
        # Construct CLI arguments
        cmd = [
            CORE_PYTHON,
            "-m",
            "image_gen.runner",
            "--pipeline",
            request.pipeline,
            "--prompt",
            request.prompt,
            "--width",
            str(request.width),
            "--height",
            str(request.height),
            "--steps",
            str(request.steps),
            "--cfg",
            str(request.cfg),
        ]

        if request.style_type:
            cmd.extend(["--type", request.style_type])
        if request.negative_prompt:
            cmd.extend(["--negative", request.negative_prompt])
        if request.seed is not None:
            cmd.extend(["--seed", str(request.seed)])

        # Execute the process
        print(f"[{job_id}] Executing: {' '.join(cmd)}")
        job.progress = 0.5
        job.updated_at = time.time()

        # Run process synchronously in this worker thread
        # Capture stdout to parse the final saved file path
        result = subprocess.run(
            cmd,
            cwd=REPO_ROOT,  # Required to load dot imports and configs properly
            capture_output=True,
            text=True,
        )

        if result.returncode != 0:
            job.status = "failed"
            job.error = f"Engine crashed. Return Code: {result.returncode}. Stderr: {result.stderr[-500:]}"
            job.updated_at = time.time()
            print(f"[{job_id}] Failed: {result.stderr}")
            return

        # Parse output logs to find the final image path.
        # Production standard: output structured JSON from the engine. For now, rely on regex or known string:
        # "Saved final image to: ..."
        final_image_path = None
        for line in reversed(result.stdout.splitlines()):
            if "Saved final image to: " in line:
                raw_path = line.split("Saved final image to: ")[-1].strip()
                # Determine the relative path starting from 'output/images'
                if "output" in raw_path:
                    # e.g., "\output\images\anime\gen_abc.png" -> "anime/gen_abc.png"
                    parts = raw_path.replace("\\", "/").split("/images/")
                    if len(parts) == 2:
                        final_image_path = f"/images/{parts[1]}"
                break

        if not final_image_path:
            # Fallback tracking logic if missing logs
            print(f"[{job_id}] Warning: Could not parse exact output path from logs. {result.stdout}")

        job.status = "completed"
        job.progress = 1.0
        job.image_url = final_image_path
        job.updated_at = time.time()
        print(f"[{job_id}] Completed successfully! Image: {final_image_path}")

    except Exception as e:
        job.status = "failed"
        job.error = str(e)
        job.updated_at = time.time()
        print(f"[{job_id}] Exception wrapper caught: {e}")
