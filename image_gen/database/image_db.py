"""
Image Generation Database
==========================
SQLite database for tracking generated images.
Stores image paths, prompts, settings, and metadata for future reference.
"""

import sqlite3
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict, Any
from dataclasses import asdict


# Database file location
DB_PATH = Path(__file__).parent / "images.db"


def _get_connection() -> sqlite3.Connection:
    """Get database connection with row factory for dict-like access."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Initialize the database with required tables."""
    conn = _get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS generated_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            
            -- Core paths
            image_path TEXT NOT NULL UNIQUE,
            canny_image_path TEXT DEFAULT NULL,
            base_model TEXT NOT NULL,
            output_dir TEXT NOT NULL,
            
            -- Prompts
            prompt TEXT NOT NULL,
            neg_prompt TEXT DEFAULT '',
            triggers TEXT DEFAULT NULL,
            
            -- Generation settings
            width INTEGER NOT NULL,
            height INTEGER NOT NULL,
            steps INTEGER NOT NULL,
            cfg REAL NOT NULL,
            seed INTEGER DEFAULT NULL,
            clip_skip INTEGER DEFAULT NULL,
            
            -- Method settings
            vae TEXT DEFAULT 'realistic',
            scheduler_name TEXT DEFAULT 'euler_a',
            upscale_method TEXT DEFAULT 'Lanczos',
            
            -- LoRA info (JSON string for multiple LoRAs)
            loras TEXT DEFAULT NULL,
            
            -- ControlNet info (JSON string)
            controlnets TEXT DEFAULT NULL,
            
            -- Metadata
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            tags TEXT DEFAULT NULL
        )
    """)
    
    # Migration: Add canny_image_path column if it doesn't exist (for existing databases)
    try:
        cursor.execute("ALTER TABLE generated_images ADD COLUMN canny_image_path TEXT DEFAULT NULL")
        print("[DB] Migrated: Added canny_image_path column")
    except sqlite3.OperationalError:
        pass  # Column already exists
    
    # Create index for faster searches
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_prompt ON generated_images(prompt)
    """)
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_created_at ON generated_images(created_at)
    """)
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_base_model ON generated_images(base_model)
    """)
    
    conn.commit()
    conn.close()
    print(f"[DB] Initialized database at: {DB_PATH}")


def save_image_record(
    image_path: Path,
    base_model: Path,
    output_dir: Path,
    prompt: str,
    neg_prompt: str = "",
    triggers: Optional[str] = None,
    width: int = 512,
    height: int = 768,
    steps: int = 25,
    cfg: float = 7.0,
    seed: Optional[int] = None,
    clip_skip: Optional[int] = None,
    vae: str = "realistic",
    scheduler_name: str = "euler_a",
    upscale_method: str = "Lanczos",
    loras: Optional[List[Dict]] = None,
    controlnets: Optional[List[Dict]] = None,
    canny_image_path: Optional[Path] = None,
    tags: Optional[str] = None
) -> int:
    """
    Save a generated image record to database.
    
    Returns:
        The id of the inserted record.
    """
    import json
    
    conn = _get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO generated_images (
            image_path, canny_image_path, base_model, output_dir,
            prompt, neg_prompt, triggers,
            width, height, steps, cfg, seed, clip_skip,
            vae, scheduler_name, upscale_method,
            loras, controlnets, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        str(image_path),
        str(canny_image_path) if canny_image_path else None,
        str(base_model),
        str(output_dir),
        prompt,
        neg_prompt,
        triggers,
        width,
        height,
        steps,
        cfg,
        seed,
        clip_skip,
        vae,
        scheduler_name,
        upscale_method,
        json.dumps(loras) if loras else None,
        json.dumps(controlnets) if controlnets else None,
        tags
    ))
    
    record_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    print(f"[DB] Saved image record: {image_path.name} (id: {record_id})")
    return record_id


def get_image_by_path(image_path: str) -> Optional[Dict]:
    """Get image record by file path."""
    conn = _get_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT * FROM generated_images WHERE image_path = ?",
        (str(image_path),)
    )
    row = cursor.fetchone()
    conn.close()
    
    return dict(row) if row else None


def search_images_by_prompt(keyword: str, limit: int = 50) -> List[Dict]:
    """Search images by prompt keyword."""
    conn = _get_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT * FROM generated_images WHERE prompt LIKE ? ORDER BY created_at DESC LIMIT ?",
        (f"%{keyword}%", limit)
    )
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]


def get_recent_images(limit: int = 20) -> List[Dict]:
    """Get most recent generated images."""
    conn = _get_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT * FROM generated_images ORDER BY created_at DESC LIMIT ?",
        (limit,)
    )
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]


def get_images_by_model(model_path: str, limit: int = 50) -> List[Dict]:
    """Get images generated with a specific model."""
    conn = _get_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT * FROM generated_images WHERE base_model LIKE ? ORDER BY created_at DESC LIMIT ?",
        (f"%{model_path}%", limit)
    )
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]


def delete_image_record(image_path: str) -> bool:
    """Delete an image record from database."""
    conn = _get_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "DELETE FROM generated_images WHERE image_path = ?",
        (str(image_path),)
    )
    
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    
    return deleted


# Initialize database when module is imported
init_db()
