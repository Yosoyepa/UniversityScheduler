"""
Authentication Use Cases.

Application layer use cases for user authentication.
Orchestrates domain entities, repositories, and infrastructure services.

Following architecture-patterns skill:
    - Use cases depend on abstractions (ports)
    - Use cases orchestrate, don't implement business rules
    - Business rules live in domain entities
"""
from dataclasses import dataclass
from uuid import uuid4

from app.modules.users.domain.entities import User, Settings
from app.modules.users.port.repository import IUserRepository, ISettingsRepository
from app.modules.users.infrastructure.password_hasher import PasswordHasher
from app.modules.users.infrastructure.token_service import TokenService
from app.modules.users.application.schemas import (
    RegisterUserRequest,
    LoginRequest,
    AuthResponse,
    UserResponse,
    TokenResponse,
)
from app.shared.domain.value_objects import Email
from app.shared.domain.exceptions import (
    ValidationException,
    EntityNotFoundException,
)


@dataclass
class RegisterUserUseCase:
    """
    Use case: Register a new user.
    
    1. Validate email is not already registered
    2. Hash password
    3. Create User entity
    4. Persist user
    5. Create default settings
    6. Generate tokens
    7. Return auth response
    """
    user_repository: IUserRepository
    settings_repository: ISettingsRepository
    password_hasher: PasswordHasher
    token_service: TokenService
    
    async def execute(self, request: RegisterUserRequest) -> AuthResponse:
        """Execute the registration use case."""
        # 1. Check if email already exists
        if await self.user_repository.exists_by_email(request.email):
            raise ValidationException(
                code="EMAIL_ALREADY_EXISTS",
                message="A user with this email already exists",
                details={"email": request.email}
            )
        
        # 2. Hash password
        hashed_password = self.password_hasher.hash(request.password)
        
        # 3. Create domain entity
        user = User(
            id=uuid4(),
            email=Email(request.email),
            full_name=request.full_name,
            hashed_password=hashed_password,
            is_active=True,
        )
        
        # 4. Persist user
        saved_user = await self.user_repository.save(user)
        
        # 5. Create default settings
        settings = Settings(user_id=saved_user.id)
        await self.settings_repository.save(settings)
        
        # 6. Generate tokens
        access_token = self.token_service.create_access_token(
            user_id=saved_user.id,
            email=str(saved_user.email)
        )
        refresh_token = self.token_service.create_refresh_token(user_id=saved_user.id)
        
        # 7. Build response
        return AuthResponse(
            user=UserResponse(
                id=saved_user.id,
                email=str(saved_user.email),
                full_name=saved_user.full_name,
                is_active=saved_user.is_active,
                created_at=saved_user.created_at,
                updated_at=saved_user.updated_at,
            ),
            tokens=TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=self.token_service.get_access_token_expire_seconds(),
            )
        )


@dataclass
class LoginUseCase:
    """
    Use case: Login an existing user.
    
    1. Find user by email
    2. Verify password
    3. Check user is active
    4. Generate tokens
    5. Return auth response
    """
    user_repository: IUserRepository
    password_hasher: PasswordHasher
    token_service: TokenService
    
    async def execute(self, request: LoginRequest) -> AuthResponse:
        """Execute the login use case."""
        # 1. Find user by email
        user = await self.user_repository.find_by_email(request.email)
        
        if not user:
            raise ValidationException(
                code="INVALID_CREDENTIALS",
                message="Invalid email or password"
            )
        
        # 2. Verify password
        if not self.password_hasher.verify(request.password, user.hashed_password):
            raise ValidationException(
                code="INVALID_CREDENTIALS",
                message="Invalid email or password"
            )
        
        # 3. Check user is active
        if not user.can_login():
            raise ValidationException(
                code="ACCOUNT_DISABLED",
                message="This account has been deactivated"
            )
        
        # 4. Generate tokens
        access_token = self.token_service.create_access_token(
            user_id=user.id,
            email=str(user.email)
        )
        refresh_token = self.token_service.create_refresh_token(user_id=user.id)
        
        # 5. Build response
        return AuthResponse(
            user=UserResponse(
                id=user.id,
                email=str(user.email),
                full_name=user.full_name,
                is_active=user.is_active,
                created_at=user.created_at,
                updated_at=user.updated_at,
            ),
            tokens=TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=self.token_service.get_access_token_expire_seconds(),
            )
        )


@dataclass
class RefreshTokenUseCase:
    """
    Use case: Refresh access token using refresh token.
    """
    user_repository: IUserRepository
    token_service: TokenService
    
    async def execute(self, refresh_token: str) -> TokenResponse:
        """Execute the token refresh use case."""
        # 1. Verify refresh token
        user_id = self.token_service.verify_refresh_token(refresh_token)
        
        if not user_id:
            raise ValidationException(
                code="INVALID_REFRESH_TOKEN",
                message="Invalid or expired refresh token"
            )
        
        # 2. Find user
        user = await self.user_repository.find_by_id(user_id)
        
        if not user or not user.can_login():
            raise ValidationException(
                code="INVALID_REFRESH_TOKEN",
                message="User not found or account disabled"
            )
        
        # 3. Generate new tokens
        access_token = self.token_service.create_access_token(
            user_id=user.id,
            email=str(user.email)
        )
        new_refresh_token = self.token_service.create_refresh_token(user_id=user.id)
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            expires_in=self.token_service.get_access_token_expire_seconds(),
        )


@dataclass
class GetCurrentUserUseCase:
    """
    Use case: Get current authenticated user's profile.
    """
    user_repository: IUserRepository
    
    async def execute(self, user_id: str) -> UserResponse:
        """Execute the get current user use case."""
        from uuid import UUID
        
        user = await self.user_repository.find_by_id(UUID(user_id))
        
        if not user:
            raise EntityNotFoundException(
                code="USER_NOT_FOUND",
                message="User not found",
                entity_type="User"
            )
        
        return UserResponse(
            id=user.id,
            email=str(user.email),
            full_name=user.full_name,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )
