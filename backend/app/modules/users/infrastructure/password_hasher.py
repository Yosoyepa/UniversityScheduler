"""
Password Hashing Service.

Infrastructure service for password hashing and verification.
Uses bcrypt via passlib for secure password handling.

Following testable_code skill:
    - Service is injectable (can be mocked in tests)
    - Pure methods that don't depend on global state
"""
from passlib.context import CryptContext


class PasswordHasher:
    """
    Password hashing service using bcrypt.
    
    This is an infrastructure service that should be injected
    into use cases that need password operations.
    """
    
    def __init__(self):
        self._context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    def hash(self, password: str) -> str:
        """
        Hash a plain-text password.
        
        Args:
            password: Plain-text password
            
        Returns:
            Hashed password string
        """
        return self._context.hash(password)
    
    def verify(self, plain_password: str, hashed_password: str) -> bool:
        """
        Verify a password against a hash.
        
        Args:
            plain_password: Plain-text password to verify
            hashed_password: Previously hashed password
            
        Returns:
            True if password matches, False otherwise
        """
        return self._context.verify(plain_password, hashed_password)


# Singleton instance for dependency injection
_password_hasher = PasswordHasher()


def get_password_hasher() -> PasswordHasher:
    """Get the password hasher instance. Used for FastAPI Depends."""
    return _password_hasher
