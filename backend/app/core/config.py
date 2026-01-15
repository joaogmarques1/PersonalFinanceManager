from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

# Loading .env
load_dotenv()

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    API_PREFIX: str = os.getenv("API_PREFIX", "/api")

settings = Settings()