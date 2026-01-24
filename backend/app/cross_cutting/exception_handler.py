"""
Global Exception Handler Middleware.

Transforms domain and infrastructure exceptions into consistent
JSON API responses following the error_hierarchy.puml specification.

HTTP Status Code Mapping (from 09_error_handling.md):
    - ScheduleConflictException → 409 Conflict
    - EntityNotFoundException → 404 Not Found
    - ValidationException → 400 Bad Request
    - InvalidEntityStateException → 422 Unprocessable Entity
    - ExternalServiceTimeout → 503 Service Unavailable
    - DatabaseConnectionError → 503 Service Unavailable
"""
from datetime import datetime, timezone
from typing import Callable
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError as PydanticValidationError

from app.shared.domain.exceptions import (
    BaseAppException,
    DomainException,
    InfrastructureException,
    ScheduleConflictException,
    InvalidEntityStateException,
    EntityNotFoundException,
    ValidationException,
    ExternalServiceTimeout,
    DatabaseConnectionError,
    get_http_status_code,
)


async def app_exception_handler(
    request: Request,
    exc: BaseAppException
) -> JSONResponse:
    """
    Handle all application exceptions and return consistent JSON response.
    
    Response format:
    {
        "error": "ERROR_CODE",
        "message": "Human readable message",
        "request_id": "uuid",
        "timestamp": "ISO8601",
        ... (additional fields from exception.to_dict())
    }
    """
    status_code = get_http_status_code(exc)
    
    # Build response body
    body = exc.to_dict()
    body["request_id"] = str(uuid4())
    body["timestamp"] = datetime.now(timezone.utc).isoformat()
    
    return JSONResponse(
        status_code=status_code,
        content=body
    )


async def pydantic_validation_handler(
    request: Request,
    exc: PydanticValidationError
) -> JSONResponse:
    """
    Handle Pydantic validation errors and convert to our format.
    
    Pydantic errors come from FastAPI request body validation.
    We transform them into our ValidationException format.
    """
    # Transform Pydantic errors to our format
    details = {}
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"])
        if field not in details:
            details[field] = []
        details[field].append(error["msg"])
    
    body = {
        "error": "VALIDATION_ERROR",
        "message": "Validation failed for request body",
        "details": details,
        "request_id": str(uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    
    return JSONResponse(
        status_code=400,
        content=body
    )


async def unhandled_exception_handler(
    request: Request,
    exc: Exception
) -> JSONResponse:
    """
    Handle any unhandled exceptions.
    
    In development: include exception details.
    In production: generic error message only.
    """
    # TODO: Check environment and log appropriately
    # For now, return generic 500 error
    
    body = {
        "error": "INTERNAL_SERVER_ERROR",
        "message": "An unexpected error occurred",
        "request_id": str(uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    
    # Log the actual error (in production, use proper logging)
    print(f"[ERROR] Unhandled exception: {exc}")
    
    return JSONResponse(
        status_code=500,
        content=body
    )


def register_exception_handlers(app: FastAPI) -> None:
    """
    Register all exception handlers with the FastAPI application.
    
    Call this in main.py after creating the app instance.
    
    Args:
        app: The FastAPI application instance
    """
    # Register handler for our base exception
    app.add_exception_handler(BaseAppException, app_exception_handler)
    
    # Register handler for Pydantic validation errors
    app.add_exception_handler(PydanticValidationError, pydantic_validation_handler)
    
    # Register catch-all handler for unhandled exceptions
    app.add_exception_handler(Exception, unhandled_exception_handler)
