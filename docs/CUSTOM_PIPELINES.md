# Creating Custom Pipelines

This guide walks you through creating a new style pipeline from scratch. By the end, you'll have a fully working pipeline that integrates with the CLI and engine.

---

## Table of Contents

- [Overview](#overview)
- [Minimal Pipeline (5 Minutes)](#minimal-pipeline)
- [Full Pipeline with LoRA](#full-pipeline-with-lora)
- [Pipeline with ControlNet](#pipeline-with-controlnet)
- [Auto-Detection](#auto-detection)
- [PipelineConfigs Reference](#pipelineconfigs-reference)
- [Testing Your Pipeline](#testing-your-pipeline)

---

## Overview

Every pipeline is a Python module that:

1. **Defines a config function** that takes a prompt and returns a `PipelineConfigs` dataclass
2. **Registers itself** using the `@register_pipeline` decorator
3. **Is imported** in `registry.py`'s `discover_pipelines()` function

The engine handles everything else — loading, inference, upscaling, and saving.

---

## Minimal Pipeline

The simplest possible pipeline in `image_gen/pipeline/my_style.py`:

```python
"""My Style Pipeline — Minimal Example"""

from configs.paths import DIFFUSION_MODELS, IMAGE_GEN_OUTPUT_DIR
from image_gen.pipeline.pipeline_types import PipelineConfigs
from image_gen.pipeline.registry import register_pipeline

OUTPUT_DIR = IMAGE_GEN_OUTPUT_DIR / "my_style"


@register_pipeline(
    name="my_style",
    keywords=["mystyle", "my art", "custom"],
    description="My custom art style",
)
def get_config(prompt: str, **kwargs) -> PipelineConfigs:
    return PipelineConfigs(
        base_model=DIFFUSION_MODELS["realistic_vision"],
        output_dir=OUTPUT_DIR,
        prompt=f"masterpiece, best quality, {prompt}",
        neg_prompt="worst quality, low quality, blurry",
        vae="realistic",
        style_type="realistic",
        scheduler_name="euler_a",
        width=512,
        height=768,
        steps=25,
        cfg=7.0,
    )
```

Register it in `image_gen/pipeline/registry.py`:

```python
def discover_pipelines():
    from . import (
        # ... existing ...
        my_style,     # ← Add this
    )
```

Done! Use it:

```bash
python -m image_gen.runner "sunset over mountains" --style my_style
```

---

## Full Pipeline with LoRA

A more advanced pipeline that uses LoRA models, sub-types, and auto-detection:

```python
"""Watercolor Pipeline — Uses LoRA for painterly effects"""

from pathlib import Path
from typing import Optional, Literal
from configs.paths import DIFFUSION_MODELS, IMAGE_GEN_OUTPUT_DIR, LORA_MODELS
from image_gen.pipeline.pipeline_types import PipelineConfigs, LoraConfig
from image_gen.pipeline.registry import register_pipeline

OUTPUT_DIR = IMAGE_GEN_OUTPUT_DIR / "watercolor"

# Define sub-types
STYLES = {
    "soft":  {"trigger": "soft watercolor",  "strength": 0.7},
    "bold":  {"trigger": "bold watercolor",  "strength": 0.9},
    "ink":   {"trigger": "ink wash painting", "strength": 0.8},
}

WatercolorStyle = Literal["soft", "bold", "ink"]


@register_pipeline(
    name="watercolor",
    keywords=["watercolor", "painting", "ink wash", "painterly"],
    description="Watercolor and ink painting styles",
    types={
        "soft": "Soft, dreamy watercolor",
        "bold": "Bold, saturated watercolor",
        "ink": "Traditional ink wash painting",
    }
)
def get_watercolor_config(
    prompt: str,
    style: Optional[WatercolorStyle] = "soft",
    **kwargs,
) -> PipelineConfigs:

    style_info = STYLES.get(style, STYLES["soft"])

    # Build prompt with trigger
    final_prompt = (
        f"{style_info['trigger']}, {prompt}, "
        "masterpiece, best quality, detailed brushstrokes"
    )

    # Configure LoRA (you'd add your own LoRA to configs/paths.py)
    # lora_config = LoraConfig(
    #     lora_path=LORA_MODELS["watercolor"],
    #     scale=style_info["strength"],
    #     lora_trigger_word=style_info["trigger"],
    # )

    return PipelineConfigs(
        base_model=DIFFUSION_MODELS["dreamshaper"],
        output_dir=OUTPUT_DIR,
        prompt=final_prompt,
        neg_prompt="photo, realistic, 3d render, worst quality",
        vae="realistic",
        style_type="realistic",
        scheduler_name="dpm++_2m_karras",
        width=768,
        height=512,
        steps=25,
        cfg=7.5,
        # lora=[lora_config],  # Uncomment when LoRA is available
    )
```

Usage:

```bash
python -m image_gen.runner "cherry blossoms in a garden" --style watercolor --type ink
```

---

## Pipeline with ControlNet

Pipelines can specify ControlNet conditioning for structure-guided generation:

```python
from image_gen.pipeline.pipeline_types import PipelineConfigs, ControlNetConfig

@register_pipeline(
    name="traced",
    keywords=["trace", "outline", "reference"],
    description="Generate from a reference image outline",
)
def get_traced_config(
    prompt: str,
    control_image: str = None,
    control_type: str = "canny",
    **kwargs,
) -> PipelineConfigs:

    config = PipelineConfigs(
        base_model=DIFFUSION_MODELS["realistic_vision"],
        output_dir=OUTPUT_DIR,
        prompt=prompt,
        # ... other settings ...
    )

    # Add ControlNet if image provided
    if control_image:
        config.c_net = [
            ControlNetConfig(
                control_type=control_type,   # "canny", "depth", or "openpose"
                image_path=control_image,
                scale=0.8,                    # Conditioning strength (0.0 - 1.5)
            )
        ]

    return config
```

The CLI passes `--control_image` and `--control_type` automatically.

---

## Auto-Detection

Many pipelines auto-detect settings from the prompt. Here's the pattern:

```python
import re

def _detect_variant(prompt: str) -> str:
    """Score-based keyword detection."""
    prompt_lower = prompt.lower()

    scores = {
        "soft":  sum(1 for kw in ["soft", "dreamy", "pastel"] if kw in prompt_lower),
        "bold":  sum(1 for kw in ["bold", "vivid", "saturated"] if kw in prompt_lower),
        "ink":   sum(1 for kw in ["ink", "sumi-e", "calligraphy"] if kw in prompt_lower),
    }

    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "soft"  # Default fallback
```

---

## PipelineConfigs Reference

The `PipelineConfigs` dataclass is the contract between pipelines and the engine:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `base_model` | `Path` | ✅ | — | Path to `.safetensors` checkpoint |
| `output_dir` | `Path` | ✅ | — | Directory for saved images |
| `prompt` | `str` | ✅ | — | Generation prompt |
| `vae` | `str\|Path` | | `"realistic"` | `"anime"`, `"realistic"`, `"semi-realistic"`, `"default"`, or path |
| `neg_prompt` | `str` | | `""` | Negative prompt |
| `triggers` | `str` | | `None` | Auto-injected into prompt |
| `style_type` | `str` | | `"realistic"` | `"anime"` or `"realistic"` (selects upscaler) |
| `scheduler_name` | `str` | | `"euler_a"` | Scheduler choice |
| `add_details` | `bool` | | `False` | Enable diffusion upscale |
| `width` | `int` | | `768` | Image width (multiple of 8) |
| `height` | `int` | | `512` | Image height (multiple of 8) |
| `steps` | `int` | | `25` | Inference steps (1–44) |
| `cfg` | `float` | | `7.0` | Classifier-free guidance (1–14) |
| `clip_skip` | `int` | | `None` | CLIP layer skip |
| `seed` | `int` | | `None` | Random seed |
| `lora` | `List[LoraConfig]` | | `[]` | LoRA configurations |
| `c_net` | `List[ControlNetConfig]` | | `[]` | ControlNet configurations |
| `embeddings` | `List[Path]` | | `[]` | Textual inversion embeddings |
| `model_config` | `str` | | `None` | HuggingFace config for safetensors |

### Validation Rules (enforced in `__post_init__`)

- Dimensions are auto-rounded to multiples of 8
- Steps must be 1–44 (hardcapped for VRAM safety)
- CFG must be 1–14
- `dpm++_2m_karras` is capped at 26 steps (VRAM safety on low-end GPUs)
- `base_model` must exist on disk
- `output_dir` is auto-created if missing
- Triggers are auto-injected into prompt if not already present

---

## Testing Your Pipeline

### Quick Config Test

```python
# Run from project root
python -c "
from image_gen.pipeline.registry import discover_pipelines, get_pipeline
discover_pipelines()

p = get_pipeline('my_style')
print(f'Name: {p[\"name\"]}')
print(f'Keywords: {p[\"keywords\"]}')
print(f'Types: {p[\"types\"]}')

# Test config creation (requires model files)
# config = p['get_config'](prompt='test')
# print(f'Model: {config.base_model}')
"
```

### Full Generation Test

```bash
python -m image_gen.runner "test prompt for my style" --style my_style --seed 42
```

### List Verification

```bash
python -m image_gen.runner --list
# Should show your pipeline in the output
```
