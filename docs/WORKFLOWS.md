# 🔄 Developer Workflows

This document outlines the standard operating procedures and workflows for contributing to and managing the Image Gen framework.

## 1. Tooling Workflows

We provide several CLI tools in the `scripts/` directory to automate prompt engineering.

### CivitAI Scraping Workflow
When introducing a new model to the framework, never guess the best settings.
1. Find the model on CivitAI.
2. Run the API Scraper: `python scripts/api_scraper.py <civitai_url>`
3. The scraper authenticates, parses the top 100 images by reaction, and dumps the raw generation metadata (Steps, CFG, Prompt, Negative Prompt) into `assets/prompts/`.

### Prompt Enhancement Workflow
We dynamically build prompts based on scraped community data using `scripts/prompt_enhancer.py`.
- **Usage**: Instantiate `ModelPromptEnhancer(model_id=XYZ)`.
- It calculates the statistical mode of steps/CFG and extracts the most frequent LoRAs.
- Pass this object into your pipeline's `get_config()` method to automatically inject optimal settings.

## 2. CI/CD Workflows

The repository uses GitHub Actions (`.github/workflows/`) to enforce FAANG-level engineering standards.

### `lint.yml`
Runs `ruff` on every push to enforce clean, PEP-8 compliant Python. It explicitly checks for unused imports which are critical to avoid since we rely on `importlib` for lazy-loading.

### `security.yml`
Runs `trufflehog` and secret scanners to ensure no hardcoded API keys (like the CivitAI key) or absolute local system paths are committed.

### `test.yml`
Creates an isolated Ubuntu environment, installs CPU-only PyTorch mocks, and boots the SQLite database and `@register_pipeline` router. If the CLI or Registry crashes, the PR is blocked.

## 3. Deployment Workflow

Because the engine is entirely headless, deployment is trivial:
1. **Pull** the repository to your target worker machine.
2. **Execute** via REST using FastAPI (example provided in the README).
3. **Monitor** generations locally using the built-in SQLite database at `image_gen/database/images.db`.
