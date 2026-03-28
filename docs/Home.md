# Image Gen Framework Wiki 📚

Welcome to the internal engineering wiki for the Image Gen Framework. This documentation is intended for contributors, backend engineers, and maintainers looking to integrate this framework into production SaaS environments, Discord bots, or mobile apps.

### 🎯 Overview
The framework is designed to completely decouple the "What to generate" from the "How to execute it." It provides a 100% headless, VRAM-optimized backend capable of running 20+ specialized Stable Diffusion pipelines on consumer hardware (4GB GTX 1650).

### 📖 Navigation
Use the **sidebar** to navigate through our engineering specs:
- **[System Architecture](ARCHITECTURE)**: Learn about the Registry Pattern, Subprocess Isolation, and Lazy-Loading.
- **[Custom Pipelines](CUSTOM_PIPELINES)**: Learn how to wire up new styles, inject LoRAs, and write decorators.
- **[Upscalers](UPSCALERS)**: Dive into the math behind the Real-ESRGAN and Lanczos fallback chain.
- **[Workflows](WORKFLOWS)**: Understand how to use the scraping tools, prompt enhancers, and our CI/CD testing suites.
