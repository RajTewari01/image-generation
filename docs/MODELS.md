# Model Download Guide

This document lists every model file the engine can use, organized by category, with download links and expected file paths.

---

## Table of Contents

- [Directory Structure](#directory-structure)
- [Minimum Required Models](#minimum-required-models)
- [Diffusion Checkpoints](#diffusion-checkpoints)
- [VAE Models](#vae-models)
- [LoRA Models](#lora-models)
- [ControlNet Models](#controlnet-models)
- [Upscaler Models](#upscaler-models)
- [Path Configuration](#path-configuration)

---

## Directory Structure

Create this directory structure in your project root:

```
models/
├── checkpoints/       # Stable Diffusion base models (.safetensors)
├── vae/               # VAE files (.safetensors)
├── lora/              # LoRA files (.safetensors)
├── controlnet/        # ControlNet models (.pth)
└── upscalers/         # Real-ESRGAN models (.pth)
```

```bash
# Create directories
mkdir -p models/checkpoints models/vae models/lora models/controlnet models/upscalers
```

---

## Minimum Required Models

To run your first generation, you need at minimum:

| Category | File | Size | Required By |
|----------|------|------|-------------|
| Checkpoint | Any SD 1.5 model | ~2 GB | Engine |
| VAE | `vae-ft-mse-840000-ema-pruned.safetensors` | ~335 MB | Realistic pipelines |
| Upscaler | `RealESRGAN_x4plus.pth` | ~64 MB | Post-processing |
| Upscaler | `RealESRGAN_x4plus_anime_6B.pth` | ~17 MB | Post-processing |

**Total minimum download: ~2.4 GB**

---

## Diffusion Checkpoints

Place in `models/checkpoints/`. All models are **Stable Diffusion 1.5** architecture.

### Realistic Models

| Model | Filename | Download | Used By |
|-------|----------|----------|---------|
| **Realistic Vision v5.1** | `realisticVisionV60B1_v51VAE.safetensors` | [CivitAI #4201](https://civitai.com/models/4201) | `car`, `ethnicity`, `hyperrealistic` |
| **GhostMix v2.0** | `ghostmix_v20.safetensors` | [CivitAI #36520](https://civitai.com/models/36520) | `ghost`, `horror` |
| **Deliberate v2** | `deliberate_v2.safetensors` | [CivitAI #4823](https://civitai.com/models/4823) | `drawing`, `hyperrealistic` |
| **DreamShaper 8** | `dreamshaper_8.safetensors` | [CivitAI #4384](https://civitai.com/models/4384) | `drawing`, `space` |

### Anime Models

| Model | Filename | Download | Used By |
|-------|----------|----------|---------|
| **MeinaMix v11** | `meinamix_v11.safetensors` | [CivitAI #7240](https://civitai.com/models/7240) | `anime` (meinamix) |
| **BloodOrangeMix** | `bloodorangemix.safetensors` | [CivitAI #11813](https://civitai.com/models/11813) | `anime` (bloodorangemix) |
| **AbyssOrangeMix3** | `abyssorangemix3.safetensors` | [CivitAI #9942](https://civitai.com/models/9942) | `anime` (abyssorangemix) |
| **EerieOrangeMix** | `eerieorangemix_hard.safetensors` | [CivitAI #9942](https://civitai.com/models/9942) | `anime` (eerieorangemix) |
| **Azovya RPG** | `azovya_rpg.safetensors` | [CivitAI](https://civitai.com) | `anime` (azovya) |

### Specialty Models

| Model | Filename | Download | Used By |
|-------|----------|----------|---------|
| **DifConsistency** | `difconsistency.safetensors` | [CivitAI #87371](https://civitai.com/models/87371) | `difconsistency` |
| **DiffusionBrush** | `diffusionbrush.safetensors` | [CivitAI #46294](https://civitai.com/models/46294) | `diffusionbrush` |
| **RevAnimated** | `revanimated.safetensors` | [CivitAI](https://civitai.com) | `space`, `zombie`, `horror` |

> **💡 Tip**: You only need to download models for the pipelines you plan to use. Start with **Realistic Vision** for realistic styles or **MeinaMix** for anime.

---

## VAE Models

Place in `models/vae/`. VAEs improve image quality and color accuracy.

| VAE | Filename | Download | Used By |
|-----|----------|----------|---------|
| **ft-MSE (Realistic)** | `vae-ft-mse-840000-ema-pruned.safetensors` | [HuggingFace](https://huggingface.co/stabilityai/sd-vae-ft-mse-original) | All realistic pipelines |
| **Anime VAE** | `anime.vae.safetensors` | [HuggingFace](https://huggingface.co) | `anime` (meinamix, novaporn, azovya) |
| **OrangeMix VAE** | `orangemix.vae.safetensors` | Bundled with OrangeMix models | `anime` (bloodorangemix, abyssorangemix, eerieorangemix) |

---

## LoRA Models

Place in `models/lora/`. LoRAs are small fine-tuning files that add specific styles.

### Car LoRAs (used by `car` pipeline)

| LoRA | Config Key | Trigger Word | Download |
|------|-----------|--------------|----------|
| Car Sketch | `car_sketch` | `car sketch` | [CivitAI](https://civitai.com) |
| Car Sedan | `car_sedan` | `car` | [CivitAI](https://civitai.com) |
| Car Retro | `car_retro` | `retromoto` | [CivitAI](https://civitai.com) |
| Car Speedtail | `car_speedtail` | `speedtail sport car` | [CivitAI](https://civitai.com) |
| Car F1 | `car_f1` | `f1lm sports car` | [CivitAI](https://civitai.com) |
| Car MX5 | `car_mx5` | `mx5na` | [CivitAI](https://civitai.com) |
| Car AutoHome | `car_autohome` | `autohome car(hqhs5)` | [CivitAI](https://civitai.com) |
| Car AMSDR | `car_amsdr` | `amsdr` | [CivitAI](https://civitai.com) |
| Car RX7 | `car_rx7` | `fd3s car vehicle` | [CivitAI](https://civitai.com) |
| Car JetCar | `car_jetcar` | `Hanshin5000` | [CivitAI](https://civitai.com) |
| Car Motorbike | `car_motorbike` | `yhmotorbike` | [CivitAI](https://civitai.com) |

> **💡 Tip**: LoRAs are only needed if you use the specific pipeline sub-type that references them. The `car` pipeline without `--type` will auto-detect the best style.

---

## ControlNet Models

Place in `models/controlnet/`. Optional — only needed for structure-guided generation.

| Model | Filename | Download | Size |
|-------|----------|----------|------|
| **Canny v1.1** | `control_v11p_sd15_canny.pth` | [HuggingFace](https://huggingface.co/lllyasviel/ControlNet-v1-1/tree/main) | ~1.4 GB |
| **Depth v1.1** | `control_v11f1p_sd15_depth.pth` | [HuggingFace](https://huggingface.co/lllyasviel/ControlNet-v1-1/tree/main) | ~1.4 GB |
| **OpenPose v1.1** | `control_v11p_sd15_openpose.pth` | [HuggingFace](https://huggingface.co/lllyasviel/ControlNet-v1-1/tree/main) | ~1.4 GB |

ControlNets add **~1.5 GB VRAM** on top of the base model. On a 4 GB GPU, use them with smaller resolutions (512×512).

---

## Upscaler Models

Place in `models/upscalers/`. **Both are required** as the engine auto-selects between them.

| Model | Filename | Download | Size |
|-------|----------|----------|------|
| **Real-ESRGAN 4x+** | `RealESRGAN_x4plus.pth` | [GitHub Release](https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth) | ~64 MB |
| **Real-ESRGAN Anime6B** | `RealESRGAN_x4plus_anime_6B.pth` | [GitHub Release](https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth) | ~17 MB |

For detailed information about each upscaler, see [UPSCALERS.md](UPSCALERS.md).

---

## Path Configuration

All paths are defined in `configs/paths.py`. After downloading models, verify the filenames match:

```python
# configs/paths.py (example)
DIFFUSION_MODELS = {
    "realistic_vision": CHECKPOINTS_DIR / "realisticVisionV60B1_v51VAE.safetensors",
    "meinamix":         CHECKPOINTS_DIR / "meinamix_v11.safetensors",
    # ...
}
```

If your files have different names, update the paths in `configs/paths.py` to match.

### Verify Setup

```python
python -c "
from configs.paths import DIFFUSION_MODELS, UPSCALER_MODELS, VAE_MODELS
print('=== Checking Model Files ===')
for name, path in DIFFUSION_MODELS.items():
    status = '✅' if path.exists() else '❌'
    print(f'  {status} {name}: {path.name}')
print()
for name, path in UPSCALER_MODELS.items():
    status = '✅' if path.exists() else '❌'
    print(f'  {status} {name}: {path.name}')
print()
for name, path in VAE_MODELS.items():
    status = '✅' if path.exists() else '❌'
    print(f'  {status} {name}: {path.name}')
"
```
