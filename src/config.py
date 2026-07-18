import os
import certifi
from dotenv import load_dotenv

load_dotenv()


class Settings:

    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    GOOGLE_MODEL = os.getenv("GOOGLE_MODEL", "gemini-2.5-flash")

    TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

    LANGSMITH_TRACING = os.getenv("LANGSMITH_TRACING")
    LANGSMITH_ENDPOINT = os.getenv("LANGSMITH_ENDPOINT")
    LANGSMITH_API_KEY = os.getenv("LANGSMITH_API_KEY")
    LANGSMITH_PROJECT = os.getenv("LANGSMITH_PROJECT")

    DATABASE_URL = os.getenv("DATABASE_URL")

    os.environ["SSL_CERT_FILE"] = certifi.where()
    os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()


Settings = Settings()