"""
Upscalers Package
=================

This package provides image upscaling functionality using various methods.

Available Upscalers:
    - lanczos: CPU-based, zero VRAM, safe fallback
    - realesrgan_4x: R-ESRGAN 4x+, excellent for realistic photos
    - realesrgan_anime: R-ESRGAN 4x+ Anime6B, lightweight for anime
    - diffusion_upscale: Img2Img, hallucinates details (requires SD pipe)

Usage:
    from upscalers import realesrgan_4x

    upscaled_image = realesrgan_4x.upscale(image, scale=4)

All model paths are configured in: configs/paths.py
"""

from pathlib import Path

from configs.paths import UPSCALER_CONFIGS, UPSCALER_MODELS, get_upscaler_path
