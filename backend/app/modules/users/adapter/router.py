"""
Authentication API Router.

FastAPI router for authentication endpoints.
Handles user registration, login, token refresh, and profile.

Following architecture-patterns skill:
    - Router is the adapter layer (interface adapter)
    - Thin controller - delegates to use cases
    - Handles HTTP concerns only
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.shared.infrastructure.database import get_async_session
from app.modules.users.application.schemas import (
    RegisterUserRequest,
    LoginRequest,
    RefreshTokenRequest,
    AuthResponse,
    TokenResponse,
    UserResponse,
    MessageResponse,
)
from app.modules.users.application.use_cases import (
    RegisterUserUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    GetCurrentUserUseCase,
)
from app.modules.users.adapter.postgres_repository import (
    PostgresUserRepository,
    PostgresSettingsRepository,
)
from app.modules.users.infrastructure.password_hasher import get_password_hasher, PasswordHasher
from app.modules.users.infrastructure.token_service import get_token_service, TokenService
from app.cross_cutting.auth_middleware import get_current_user, AuthenticatedUser


settings = get_settings()

router = APIRouter(prefix="/auth", tags=["Authentication"])


# =============================================================================
# Dependency Injection Helpers
# =============================================================================

def get_user_repository(session: AsyncSession = Depends(get_async_session)):
    return PostgresUserRepository(session)


def get_settings_repository(session: AsyncSession = Depends(get_async_session)):
    return PostgresSettingsRepository(session)


# =============================================================================
# Endpoints
# =============================================================================

@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account and return authentication tokens.",
)
async def register(
    request: RegisterUserRequest,
    session: AsyncSession = Depends(get_async_session),
    password_hasher: PasswordHasher = Depends(get_password_hasher),
    token_service: TokenService = Depends(get_token_service),
):
    """Register a new user account."""
    use_case = RegisterUserUseCase(
        user_repository=PostgresUserRepository(session),
        settings_repository=PostgresSettingsRepository(session),
        password_hasher=password_hasher,
        token_service=token_service,
    )
    return await use_case.execute(request)


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Login to existing account",
    description="Authenticate with email and password to receive tokens.",
)
async def login(
    request: LoginRequest,
    session: AsyncSession = Depends(get_async_session),
    password_hasher: PasswordHasher = Depends(get_password_hasher),
    token_service: TokenService = Depends(get_token_service),
):
    """Login with email and password."""
    use_case = LoginUseCase(
        user_repository=PostgresUserRepository(session),
        password_hasher=password_hasher,
        token_service=token_service,
    )
    return await use_case.execute(request)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh access token",
    description="Exchange a valid refresh token for new access and refresh tokens.",
)
async def refresh_token(
    request: RefreshTokenRequest,
    session: AsyncSession = Depends(get_async_session),
    token_service: TokenService = Depends(get_token_service),
):
    """Refresh the access token."""
    use_case = RefreshTokenUseCase(
        user_repository=PostgresUserRepository(session),
        token_service=token_service,
    )
    return await use_case.execute(request.refresh_token)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
    description="Get the profile of the currently authenticated user.",
)
async def get_me(
    current_user: AuthenticatedUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
):
    """Get the current user's profile."""
    use_case = GetCurrentUserUseCase(
        user_repository=PostgresUserRepository(session),
    )
    return await use_case.execute(str(current_user.user_id))


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Logout user",
    description="Logout the current user. Client should discard tokens.",
)
async def logout(
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Logout the current user.
    
    Note: JWT tokens are stateless, so logout is handled client-side
    by discarding the tokens. This endpoint is for API completeness.
    """
    return MessageResponse(
        message="Successfully logged out",
        success=True,
    )
