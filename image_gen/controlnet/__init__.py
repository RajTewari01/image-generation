"""
ControlNet Package
==================

This package provides ControlNet preprocessing and loading functionality.

Available ControlNets:
    - canny: Edge detection for line art guidance
    - depth: Depth map for 3D-aware composition
    - openpose: Human pose estimation for body guidance

Usage:
    from controlnet import canny

    # Preprocess an image
    canny_map = canny.detect(image)

    # Load the ControlNet model
    controlnet_model = canny.load_model()

All model paths are configured in: configs/paths.py
"""

from pathlib import Path

from configs.paths import CONTROLNET_MODELS, get_controlnet_path
