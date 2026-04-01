---
name: cross_platform_code
description: Write portable code that works across different platforms and environments
---

# Cross-Platform Code

## When to Apply

Activate this skill when:
- Working with file paths
- Reading configuration values
- Writing code that must run on Windows, Linux, and Mac
- Setting up environment-specific settings

## Core Principles

### 1. Use pathlib for Paths
**Never concatenate path strings manually**

```python
# ❌ Bad: Platform-specific, fragile
path = "C:\\Users\\data\\file.txt"           # Windows only!
path = "/home/user" + "/" + "data" + "/" + "file.txt"  # String concat!

# ✅ Good: Cross-platform with pathlib
from pathlib import Path

path = Path("data") / "subfolder" / "file.txt"  # Works everywhere!
path = Path.home() / "Documents" / "project"    # Home directory

# pathlib handles separators automatically
# Windows: data\subfolder\file.txt
# Linux/Mac: data/subfolder/file.txt
```

### 2. Environment Variables for Configuration
**Never hardcode environment-specific values**

```python
# ❌ Bad: Hardcoded values
DB_HOST = "localhost"
API_URL = "http://dev.example.com/api"

# ✅ Good: Environment variables with defaults
import os

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
API_URL = os.getenv("API_URL", "http://localhost:8000/api")
```

### 3. Configuration Abstraction
**Centralize configuration in a class**

```python
import os
from pathlib import Path

class Config:
    """Configuration abstraction - portable across environments"""
    
    def __init__(self):
        # Paths with pathlib
        self.data_dir = Path(os.getenv("DATA_DIR", "./data"))
        self.output_dir = Path(os.getenv("OUTPUT_DIR", "./output"))
        
        # Service configuration
        self.db_host = os.getenv("DB_HOST", "localhost")
        self.db_port = int(os.getenv("DB_PORT", "5432"))
        self.api_url = os.getenv("API_URL", "http://localhost:8000")
        
        # Ensure directories exist
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    @classmethod
    def from_env_file(cls, env_path: Path):
        """Load from .env file"""
        # Load environment from file, then create config
        return cls()
```

## Implementation Pattern

```python
from pathlib import Path
import os

class DataProcessor:
    """Portable processor - works on any platform"""
    
    def __init__(self, config: Config = None):
        self.config = config or Config()
    
    def process_file(self, filename: str) -> Path:
        # Cross-platform path handling
        input_path = self.config.data_dir / filename
        
        # Platform-independent manipulation
        output_name = Path(filename).stem + ".csv"
        output_path = self.config.output_dir / output_name
        
        print(f"Input: {input_path}")
        print(f"Output: {output_path}")
        
        return output_path
```

## Environment File Pattern

```bash
# .env or config.env
# Development
DATA_DIR=./data
OUTPUT_DIR=./output
DB_HOST=localhost
DB_PORT=5432
API_URL=http://localhost:8000

# Production (different file or CI/CD secrets)
# DATA_DIR=/var/app/data
# OUTPUT_DIR=/var/app/output
# DB_HOST=prod-db.example.com
# API_URL=https://api.example.com
```

## Decision Tree

```
Am I using a file path?
├─ Yes → Use pathlib.Path, never string concat
└─ No → ✓

Am I hardcoding host/port/url?
├─ Yes → Use os.getenv() with sensible default
└─ No → ✓

Am I using os.path.join()?
├─ Yes → Switch to pathlib (more Pythonic)
└─ No → ✓

Will this code run in different environments?
├─ Yes → Abstract configuration into Config class
└─ No → Still use env vars (easier to change later)
```

## Python pathlib Cheat Sheet

```python
from pathlib import Path

# Create path
p = Path("data") / "file.txt"

# Home directory
home = Path.home()

# Current directory
cwd = Path.cwd()

# Check existence
p.exists()
p.is_file()
p.is_dir()

# Get parts
p.name        # "file.txt"
p.stem        # "file"
p.suffix      # ".txt"
p.parent      # Path("data")
p.absolute()  # Full absolute path

# Create directories
p.mkdir(parents=True, exist_ok=True)

# Read/write
p.read_text()
p.write_text("content")

# Glob
Path(".").glob("*.py")       # All .py files
Path(".").rglob("*.py")      # Recursive
```

## Anti-Patterns to Avoid

| Anti-Pattern          | Problem      | Solution                            |
| --------------------- | ------------ | ----------------------------------- |
| `"C:\\Users\\..."`    | Windows only | `Path.home()`                       |
| `path1 + "/" + path2` | Fragile      | `Path(path1) / path2`               |
| Hardcoded `localhost` | Inflexible   | `os.getenv("DB_HOST", "localhost")` |
| Platform checks       | Complexity   | Use cross-platform libs             |
| `os.path.join()`      | Older style  | `pathlib.Path()`                    |
