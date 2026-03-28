"""
R-ESRGAN 4x+ Anime6B Upscaler
=============================

Extremely lightweight Real-ESRGAN model optimized for anime/illustrations.

Characteristics:
    - VRAM: ~300-500 MB (lowest of all ESRGAN models)
    - Quality: Excellent for anime, cartoon, illustration
    - Speed: Very fast due to smaller model
    - Best For: Anime, manga, cartoon, flat-color artwork

Model File: RealESRGAN_x4plus_anime_6B.pth (~17MB)

Note: Uses only 6 RRDB blocks (vs 23 in standard model), making it
significantly faster and lighter while maintaining quality for anime content.
"""

from pathlib import Path
from typing import Optional

from PIL import Image

from configs.paths import UPSCALER_CONFIGS, UPSCALER_MODELS

from .base import create_upscaler, flush_vram, run_upscale

# Cached upscaler instance
_upscaler = None


def load(half: bool = False, tile: int = 256):
    """
    Load the R-ESRGAN 4x+ Anime6B model.

    Args:
        half: Use FP16 for less VRAM (recommended for 4GB cards)
        tile: Tile size (lower = less VRAM, try 128 for low VRAM)

    Returns:
        RealESRGANer instance
    """
    global _upscaler

    if _upscaler is None:
        model_path = UPSCALER_MODELS["R-ESRGAN 4x+ Anime6B"]
        config = UPSCALER_CONFIGS["R-ESRGAN 4x+ Anime6B"]

        _upscaler = create_upscaler(
            model_path=model_path,
            model_name="RealESRGAN_x4plus_anime_6B",
            scale=config["scale"],
            tile=tile,
            half=half,
            num_block=config["num_block"]  # Only 6 blocks!
        )

    return _upscaler


def upscale(
    image: Image.Image,
    scale: float = 4.0,
    half: bool = False,
    tile: int = 256
) -> Image.Image:
    """
    Upscale an image using R-ESRGAN 4x+ Anime6B.

    Args:
        image: Input PIL Image
        scale: Output scale factor (default 4.0)
        half: Use FP16 for less VRAM
        tile: Tile size for processing

    Returns:
        Upscaled PIL Image
    """
    upscaler = load(half=half, tile=tile)
    result = run_upscale(upscaler, image, outscale=scale)
    return result


def unload():
    """Unload model and free VRAM."""
    global _upscaler
    _upscaler = None
    flush_vram()
