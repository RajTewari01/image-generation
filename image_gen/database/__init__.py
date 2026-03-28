"""
Image Generation Database Package
==================================
SQLite database for tracking generated image paths and metadata.
"""

from .image_db import (
    DB_PATH,
    delete_image_record,
    get_image_by_path,
    get_images_by_model,
    get_recent_images,
    init_db,
    save_image_record,
    search_images_by_prompt,
)

__all__ = [
    "init_db",
    "save_image_record",
    "get_image_by_path",
    "search_images_by_prompt",
    "get_recent_images",
    "get_images_by_model",
    "delete_image_record",
    "DB_PATH",
]
