from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    OPENAI_API_KEY: str = ""
    DATABASE_URL: str = ""
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        extra = "allow"  # Allow extra fields

settings = Settings() 