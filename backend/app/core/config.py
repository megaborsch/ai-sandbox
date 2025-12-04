from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    api_v1_prefix: str = "/api/v1"
    cors_origins: list[str] = Field(default_factory=lambda: ["*"])

    class Config:
        env_prefix = "SUNSET_APP_"
        case_sensitive = False


def get_settings() -> Settings:
    return Settings()
