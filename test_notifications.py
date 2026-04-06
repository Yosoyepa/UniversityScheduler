import asyncio
from uuid import UUID
from app.modules.users.infrastructure.token_service import TokenService

def test():
    ts = TokenService()
    user_id = UUID("08aaf790-3f94-465e-9b3d-480d69eba708")
    token = ts.create_access_token(user_id, "jandradeu@unal.edu.co")
    print(f"TOKEN={token}")

if __name__ == "__main__":
    test()
