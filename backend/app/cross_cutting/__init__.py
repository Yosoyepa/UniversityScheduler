"""
Cross-Cutting Concerns Module.

Contains middleware, exception handlers, and other concerns
that span multiple modules.
"""
from app.cross_cutting.exception_handler import (
    app_exception_handler,
    register_exception_handlers,
)

__all__ = [
    "app_exception_handler",
    "register_exception_handlers",
]
