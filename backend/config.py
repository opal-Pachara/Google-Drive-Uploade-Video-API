import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    CREDENTIALS_PATH: str = os.getenv("CREDENTIALS_PATH", "credentials/credentials.json")
    TOKEN_PATH: str = os.getenv("TOKEN_PATH", "credentials/token.json")
    SCOPES: list = ['https://www.googleapis.com/auth/drive']
    PARENT_FOLDER_ID: str = os.getenv("PARENT_FOLDER_ID", "")

settings = Settings()
