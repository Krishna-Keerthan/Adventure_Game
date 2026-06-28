from typing import List
from pydantic_settings import BaseSettings
from pydantic import field_validator, ConfigDict


class Settings(BaseSettings):

    model_config = ConfigDict(
        env_file = ".env",
        env_file_encoding = "utf-8",
        case_sensitive = True,
    )

    API_PREFIX: str = '/api'
    DEBUG: bool = False
    DATABASE_URL: str
    ALLOWED_ORIGINS: List[str] = []
    GROQ_API_KEY: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7


    @field_validator("ALLOWED_ORIGINS", mode="before")
    def parse_allowed_origins(cls, v:str) -> List[str] | List:
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            return [origin.strip()  for origin in v.split(",") if origin.strip() ]
        return []



settings = Settings()