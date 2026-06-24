import os
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from supabase import Client, create_client

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()

_client: Optional[Client] = None


def _normalize_supabase_url(url: str) -> str:
    if not url:
        return url
    return url.rstrip("/").replace("/rest/v1", "")


def get_supabase_client() -> Client:
    global _client
    if _client is None:
        normalized_url = _normalize_supabase_url(SUPABASE_URL)
        if not normalized_url or not SUPABASE_KEY:
            raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set in the backend .env file")
        _client = create_client(normalized_url, SUPABASE_KEY)
    return _client
