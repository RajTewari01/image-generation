"""
Image Generation Database Package
==================================
SQLite database for tracking generated image paths and metadata.
"""

from .image_db import (
    init_db,
    save_image_record,
    get_image_by_path,
    search_images_by_prompt,
    get_recent_images,
    get_images_by_model,
    delete_image_record,
    DB_PATH
)

__all__ = [
    "init_db",
    "save_image_record",
    "get_image_by_path",
    "search_images_by_prompt",
    "get_recent_images",
    "get_images_by_model",
    "delete_image_record",
    "DB_PATH"
]
