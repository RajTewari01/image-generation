# Upscalers Guide

This document covers all available upscalers, their download links, VRAM costs, and how the 3-stage upscaling pipeline works.

---

## Table of Contents

- [Overview](#overview)
- [The 3-Stage Pipeline](#the-3-stage-pipeline)
- [Upscaler Details](#upscaler-details)
  - [Lanczos (CPU)](#lanczos-cpu)
  - [Real-ESRGAN 4x+](#real-esrgan-4x)
  - [Real-ESRGAN 4x+ Anime6B](#real-esrgan-4x-anime6b)
  - [Diffusion Upscale](#diffusion-upscale)
- [Download Links](#download-links)
- [Auto-Selection Logic](#auto-selection-logic)
- [Troubleshooting](#troubleshooting)

---

## Overview

Image Gen uses a **multi-stage upscaling pipeline** that combines AI-based super-resolution with traditional image processing. Every generated image passes through at least 2 stages (Real-ESRGAN + Lanczos), with an optional 3rd stage (Diffusion) for maximum detail.

---

## The 3-Stage Pipeline

```
  512×768 input
       │
       ▼
┌──────────────────┐
│  Stage 1         │   ← Optional (--add_details flag)
│  DIFFUSION       │
│  Img2Img         │   Hallucinates new fine details
│  1.5× scale      │   using Stable Diffusion
│  ~15-30 sec      │
│  Reuses SD pipe   │
└──────┬───────────┘
       │ 768×1152
       ▼
┌──────────────────┐
│  Stage 2         │   ← Always runs (auto-selected)
│  REAL-ESRGAN     │
│  4× scale        │   Neural network super-resolution
│  ~2-5 sec        │   Pattern-based upscaling
│  500-800 MB VRAM │
└──────┬───────────┘
       │ 3072×4608
       ▼
┌──────────────────┐
│  Stage 3         │   ← Always runs
│  LANCZOS         │
│  + 2-pass        │   CPU-based final polish
│    Unsharp Mask  │   Sharpening + contrast boost
│  + Contrast      │
│  0 MB VRAM       │
└──────┬───────────┘
       │ 3072×4608 (polished)
       ▼
     Final Image
```

---

## Upscaler Details

### Lanczos (CPU)

**Zero VRAM. Always available. No downloads needed.**

| Property | Value |
|----------|-------|
| VRAM | 0 MB (100% CPU) |
| Speed | Instant (~0.1s) |
| Quality | Clean, sharp, no artifacts |
| Model Size | None (built into Pillow) |

The Lanczos upscaler applies a multi-step process:

1. **Lanczos Resampling** — The best interpolation algorithm for upscaling
2. **Two-Pass Unsharp Mask** — Natural sharpening without halos
   - Pass 1: Gentle overall sharpening (radius=1.0, percent=80)
   - Pass 2: Edge enhancement (radius=2.0, percent=40)
3. **Adaptive Contrast Boost** — Subtle 8% contrast increase
4. **Optional Cinematic Grading** — Slight desaturation + shadow lift

#### API

```python
from image_gen.upscalers.lanczos import upscale, upscale_fast, upscale_to_2k

# Full processing (sharpen + contrast)
result = upscale(image, scale=2.0)

# Minimal (just resize)
result = upscale_fast(image, scale=2.0)

# Target 2K resolution
result = upscale_to_2k(image)
```

---

### Real-ESRGAN 4x+

**The workhorse for realistic image upscaling.**

| Property | Value |
|----------|-------|
| VRAM | ~500-800 MB |
| Speed | ~2-5 seconds |
| Quality | Excellent for photos and realistic art |
| Model Size | ~64 MB |
| Architecture | RRDBNet (23 blocks) |
| Auto-Selected | When `style_type="realistic"` |

#### Download

```bash
# Download to models/upscalers/
wget -O models/upscalers/RealESRGAN_x4plus.pth \
  https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth
```

Or manually download from: [GitHub Release v0.1.0](https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth)

#### API

```python
from image_gen.upscalers.realesrgan_4x import upscale, load, unload

# Upscale
result = upscale(image, scale=4.0)

# With options
result = upscale(image, scale=4.0, half=True, tile=128)  # Less VRAM

# Cleanup
unload()
```

---

### Real-ESRGAN 4x+ Anime6B

**Lightweight model optimized for anime and illustrations.**

| Property | Value |
|----------|-------|
| VRAM | ~300-500 MB |
| Speed | Very fast (~1-2 seconds) |
| Quality | Excellent for anime, cartoon, flat-color art |
| Model Size | ~17 MB |
| Architecture | RRDBNet (6 blocks — vs 23 in standard) |
| Auto-Selected | When `style_type="anime"` |

#### Download

```bash
# Download to models/upscalers/
wget -O models/upscalers/RealESRGAN_x4plus_anime_6B.pth \
  https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth
```

Or manually download from: [GitHub Release v0.2.2.4](https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth)

#### API

```python
from image_gen.upscalers.realesrgan_anime import upscale, load, unload

result = upscale(image, scale=4.0)
unload()
```

---

### Diffusion Upscale

**AI-enhanced upscaling that hallucinates new details using Stable Diffusion img2img.**

| Property | Value |
|----------|-------|
| VRAM | Reuses base SD pipeline (~4-6 GB total) |
| Speed | Slow (15-30 seconds for 20 steps) |
| Quality | Creative, can add fine details |
| Risk | May alter faces/features at high strength |
| Activation | `--add_details` flag or `config.add_details = True` |

#### Strength Guide

| Strength | Effect | Risk |
|----------|--------|------|
| 0.20–0.35 | Preserves original well | Very low |
| 0.35–0.50 | Moderate detail addition | Low |
| 0.50–0.70 | Major detail changes | **May alter faces** |

#### OOM Fallback

If the diffusion upscaler runs out of VRAM, it automatically falls back to Lanczos upscaling without crashing.

#### API

```python
from image_gen.upscalers.diffusion_upscale import upscale, upscale_with_fallback

# Requires an active StableDiffusionPipeline
result = upscale(
    base_pipe=engine.pipe,
    image=generated_image,
    prompt="detailed portrait",
    scale_factor=1.5,
    strength=0.35,
)

# With auto-fallback on OOM
result = upscale_with_fallback(
    base_pipe=engine.pipe,
    image=generated_image,
    prompt="detailed portrait",
)
```

---

## Download Links

### Required Downloads

| File | Size | URL |
|------|------|-----|
| `RealESRGAN_x4plus.pth` | ~64 MB | [Download](https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth) |
| `RealESRGAN_x4plus_anime_6B.pth` | ~17 MB | [Download](https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth) |

**Both files must be placed in `models/upscalers/`.**

### Quick Download Script (Linux/macOS)

```bash
mkdir -p models/upscalers
cd models/upscalers

curl -L -O https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth
curl -L -O https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth
```

### Quick Download Script (Windows PowerShell)

```powershell
New-Item -ItemType Directory -Force -Path models\upscalers
Invoke-WebRequest -Uri "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth" -OutFile "models\upscalers\RealESRGAN_x4plus.pth"
Invoke-WebRequest -Uri "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth" -OutFile "models\upscalers\RealESRGAN_x4plus_anime_6B.pth"
```

---

## Auto-Selection Logic

The engine automatically selects the correct ESRGAN model based on the pipeline's `style_type`:

```python
# From engine.py
esrgan_name = "R-ESRGAN 4x+ Anime6B" if config.style_type == "anime" else "R-ESRGAN 4x+"
```

Pipeline authors control this by setting `style_type` in their `PipelineConfigs`:

```python
# Anime pipeline
PipelineConfigs(
    style_type="anime",      # → R-ESRGAN 4x+ Anime6B (6 blocks, lighter)
    ...
)

# Realistic pipeline
PipelineConfigs(
    style_type="realistic",  # → R-ESRGAN 4x+ (23 blocks, heavier)
    ...
)
```

---

## Troubleshooting

### "Model not found: models/upscalers/RealESRGAN_x4plus.pth"

Download the model files (see [Download Links](#download-links)) and place them in `models/upscalers/`.

### CUDA Out of Memory during upscaling

Try these options in order:

1. Reduce tile size: Pass `tile=128` to the upscaler
2. Use `half=True` for FP16 inference
3. Use Lanczos only (no ESRGAN)

### Black/corrupted upscaled images

This usually means the image mode is wrong. The base upscaler auto-converts to RGB, but if you're calling it directly, ensure your image is in RGB mode:

```python
image = image.convert("RGB")
```
