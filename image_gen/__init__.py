"""
Image Gen — Stable Diffusion Image Generation Engine
======================================================

Production-grade inference engine for Stable Diffusion 1.5 models,
optimized for low-VRAM GPUs (GTX 1650, 4GB).

Features:
    - 13 specialized style pipelines with auto-detection
    - 6 noise schedulers (Euler A, DPM++, DDIM, LMS)
    - 4 upscalers (Lanczos, Real-ESRGAN 4x+, Anime6B, Diffusion)
    - 3 ControlNets (Canny, Depth, OpenPose)
    - Plugin-style pipeline registry with @register_pipeline decorator
    - CivitAI prompt scraper and smart prompt enhancer
    - SQLite generation history database

Quick Start:
    from image_gen.engine import DiffusionEngine
    from image_gen.pipeline.registry import discover_pipelines, get_pipeline

    discover_pipelines()
    config_fn = get_pipeline("anime")["get_config"]
    config = config_fn(prompt="a girl in a forest")

    engine = DiffusionEngine()
    saved_path = engine.generate(config)
    engine.unload()
"""

__version__ = "1.0.0"
__author__ = "RajTewari01"
