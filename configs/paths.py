"""
Path Configuration for Image Gen
==================================

All model, output, and asset paths are defined here.
Adjust these paths to match your local model download locations.

Directory Structure Expected:
    models/
    ├── checkpoints/       # Stable Diffusion .safetensors / .ckpt files
    ├── vae/               # VAE .safetensors files
    ├── lora/              # LoRA .safetensors files
    ├── controlnet/        # ControlNet .pth / .safetensors files
    └── upscalers/         # Real-ESRGAN .pth files
"""

from pathlib import Path

# =============================================================================
# ROOT PATHS
# =============================================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODELS_DIR = PROJECT_ROOT / "models"
OUTPUT_DIR = PROJECT_ROOT / "output"

# =============================================================================
# MODEL DIRECTORIES
# =============================================================================

CHECKPOINTS_DIR = MODELS_DIR / "checkpoints"
VAE_DIR = MODELS_DIR / "vae"
LORA_DIR = MODELS_DIR / "lora"
CONTROLNET_DIR = MODELS_DIR / "controlnet"
UPSCALER_DIR = MODELS_DIR / "upscalers"
EMBEDDING_DIR = MODELS_DIR / "embeddings"

# =============================================================================
# EMBEDDINGS
# =============================================================================
EMBEDDING_FASTNEGATIVE = EMBEDDING_DIR / "FastNegativeV2.pt"
EMBEDDING_DIFCONSISTENCY_NEG = EMBEDDING_DIR / "difConsistency_negative_v2.pt"

# =============================================================================
# OUTPUT
# =============================================================================

IMAGE_GEN_OUTPUT_DIR = OUTPUT_DIR / "images"
CANNY_TEMP_IMAGES = OUTPUT_DIR / "temp" / "canny"

# Create output directories
IMAGE_GEN_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
CANNY_TEMP_IMAGES.mkdir(parents=True, exist_ok=True)

# =============================================================================
# DIFFUSION CHECKPOINTS
# =============================================================================
# Download from CivitAI or HuggingFace and place in models/checkpoints/
#
# Format: "key": CHECKPOINTS_DIR / "filename.safetensors"
#
# Add your own models here. The key names are used by pipeline files
# to reference specific models.

DIFFUSION_MODELS = {
    # --- Anime Models ---
    "meinamix": CHECKPOINTS_DIR / "meinamix_v11.safetensors",
    "facebomb": CHECKPOINTS_DIR / "facebombmix.safetensors",
    "novaporn": CHECKPOINTS_DIR / "novaporn.safetensors",
    "bloodorangemix": CHECKPOINTS_DIR / "bloodorangemix.safetensors",
    "abyssorangemix": CHECKPOINTS_DIR / "abyssorangemix3.safetensors",
    "eerieorangemix_hard": CHECKPOINTS_DIR / "eerieorangemix_hard.safetensors",
    "eerieorangemix_nsfw": CHECKPOINTS_DIR / "eerieorangemix_nsfw.safetensors",
    "azovya_rpg": CHECKPOINTS_DIR / "azovya_rpg.safetensors",
    "shiny_sissy": CHECKPOINTS_DIR / "shiny_sissy.safetensors",
    # --- Realistic Models ---
    "realistic_vision": CHECKPOINTS_DIR / "realisticVisionV60B1_v51VAE.safetensors",
    "ghostmix": CHECKPOINTS_DIR / "ghostmix_v20.safetensors",
    "majicmix": CHECKPOINTS_DIR / "majicmix_v7.safetensors",
    # --- Specialty Models ---
    "difconsistency": CHECKPOINTS_DIR / "difconsistency.safetensors",
    "diffusionbrush": CHECKPOINTS_DIR / "diffusionbrush.safetensors",
    "deliberate": CHECKPOINTS_DIR / "deliberate_v2.safetensors",
    "dreamshaper": CHECKPOINTS_DIR / "dreamshaper_8.safetensors",
    "revanimated": CHECKPOINTS_DIR / "revanimated.safetensors",
    "papercut": CHECKPOINTS_DIR / "papercut.safetensors",
    "horror": CHECKPOINTS_DIR / "horror_v1.safetensors",
    "walking_dead": CHECKPOINTS_DIR / "walking_dead.safetensors",
    "neverending_dream": CHECKPOINTS_DIR / "neverending_dream.safetensors",
    "deep_space": CHECKPOINTS_DIR / "deep_space.safetensors",
    "realistic_digital": CHECKPOINTS_DIR / "realistic_digital.safetensors",
    "typhoon": CHECKPOINTS_DIR / "typhoon.safetensors",
}

# Convenience aliases
MODEL_REALISTIC_VISION = DIFFUSION_MODELS["realistic_vision"]
MODEL_DIFCONSISTENCY = DIFFUSION_MODELS["difconsistency"]
MODEL_GHOSTMIX = DIFFUSION_MODELS["ghostmix"]
MODEL_DIFFUSIONBRUSH = DIFFUSION_MODELS["diffusionbrush"]
MODEL_HORROR = DIFFUSION_MODELS["horror"]
MODEL_MAJICMIX = DIFFUSION_MODELS["majicmix"]
MODEL_WALKING_DEAD = DIFFUSION_MODELS["walking_dead"]

# =============================================================================
# VAE MODELS
# =============================================================================
# Download and place in models/vae/

VAE_MODELS = {
    "anime": VAE_DIR / "anime.vae.safetensors",
    "realistic": VAE_DIR / "vae-ft-mse-840000-ema-pruned.safetensors",
    "orangemix": VAE_DIR / "orangemix.vae.safetensors",
}

VAE_DIFCONSISTENCY = VAE_DIR / "difConsistency_vae.safetensors"

# =============================================================================
# LORA MODELS
# =============================================================================
# Download and place in models/lora/

LORA_MODELS = {
    # Car LoRAs
    "car_sketch": LORA_DIR / "car_sketch.safetensors",
    "car_sedan": LORA_DIR / "car_sedan.safetensors",
    "car_retro": LORA_DIR / "car_retro.safetensors",
    "car_speedtail": LORA_DIR / "car_speedtail.safetensors",
    "car_f1": LORA_DIR / "car_f1.safetensors",
    "car_mx5": LORA_DIR / "car_mx5.safetensors",
    "car_autohome": LORA_DIR / "car_autohome.safetensors",
    "car_amsdr": LORA_DIR / "car_amsdr.safetensors",
    "car_rx7": LORA_DIR / "car_rx7.safetensors",
    "car_jetcar": LORA_DIR / "car_jetcar.safetensors",
    "car_motorbike": LORA_DIR / "car_motorbike.safetensors",
    # Style LoRAs
    "violet_evergarden": LORA_DIR / "violet_evergarden.safetensors",
    # DifConsistency LoRAs
    "dif_consistency_photo": LORA_DIR / "dif_consistency_photo.safetensors",
    "dif_consistency_detail": LORA_DIR / "dif_consistency_detail.safetensors",
    # Specialty LoRAs
    "chinese_zombie": LORA_DIR / "chinese_zombie.safetensors",
    "polaroid": LORA_DIR / "polaroid.safetensors",
    # Add your own
    # "my_lora": LORA_DIR / "my_lora.safetensors",
}

# =============================================================================
# CONTROLNET MODELS
# =============================================================================
# Download ControlNet v1.1 models and place in models/controlnet/
#
# Source: https://huggingface.co/lllyasviel/ControlNet-v1-1

CONTROLNET_MODELS = {
    "canny": CONTROLNET_DIR / "control_v11p_sd15_canny.pth",
    "depth": CONTROLNET_DIR / "control_v11f1p_sd15_depth.pth",
    "openpose": CONTROLNET_DIR / "control_v11p_sd15_openpose.pth",
}

# =============================================================================
# UPSCALER MODELS
# =============================================================================
# Download Real-ESRGAN models and place in models/upscalers/
#
# Download Links:
#   RealESRGAN_x4plus.pth (~64MB):
#       https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth
#
#   RealESRGAN_x4plus_anime_6B.pth (~17MB):
#       https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth

UPSCALER_MODELS = {
    "R-ESRGAN 4x+": UPSCALER_DIR / "RealESRGAN_x4plus.pth",
    "R-ESRGAN 4x+ Anime6B": UPSCALER_DIR / "RealESRGAN_x4plus_anime_6B.pth",
}

UPSCALER_CONFIGS = {
    "R-ESRGAN 4x+": {
        "scale": 4,
        "num_block": 23,
    },
    "R-ESRGAN 4x+ Anime6B": {
        "scale": 4,
        "num_block": 6,
    },
}


def get_upscaler_path(name: str) -> Path:
    """Get upscaler model path by name."""
    if name not in UPSCALER_MODELS:
        raise ValueError(f"Unknown upscaler: {name}. Available: {list(UPSCALER_MODELS.keys())}")
    return UPSCALER_MODELS[name]


def get_controlnet_path(name: str) -> Path:
    """Get ControlNet model path by name."""
    if name not in CONTROLNET_MODELS:
        raise ValueError(f"Unknown ControlNet: {name}. Available: {list(CONTROLNET_MODELS.keys())}")
    return CONTROLNET_MODELS[name]
