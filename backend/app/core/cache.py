import json
import logging
from typing import Any , Optional
from redis import Redis , ConnectionError, TimeoutError

from app.core.config import settings

logger = logging.getLogger(__name__)

def _create_redis_client() -> Optional[Redis]:
    if not settings.UPSTASH_REDIS_URL:
        logger.warning(
            "UPSTASH_REDIS URL not set - caching disabled."
            "Set this variable to enable Redis caching."
        )

        return None
    
    try:
        client = Redis.from_url(
            settings.UPSTASH_REDIS_URL,
            decode_response = True,
            socket_connect_timeout=3,
            socket_time=3,
            retry_on_timeout=False,
        )

        client.ping()       #Verify the connection
        logger.info("Redis (Upstash) connetion successfully.")
        return client
    except (ConnectionError , TimeoutError, Exception) as e:
        logger.error(f"Redis connection  failed: {e}")
        return None
    

redis_client: Optional[Redis] = _create_redis_client()

class RedisCache:
    """
    Thin wrapper around redis_client that:
    - Serialises/deserialises JSON automatically
    - Never raises — all errors are logged and return None
    - Degrades gracefully when Redis is unavailable
    """

    LEADERBOARD_KEY = "leaderboard:global"
    LEADERBOARD_TTL = 60 * 5

    @staticmethod
    def get(key: str) -> Optional[Any]:
        if redis_client is None:
            return None
        
        try:
            value = redis_client.get(key)
            if value is None:
                return None
            return json.loads(value)
        
        except (ConnectionError , TimeoutError) as e:
            logger.warning(f"Redis GET failed for key '{key}': {e}")
            return None
        except json.JSONDecodeError as e:
            logger.warning(f"Redis value for key '{key}' is not valid JSON: {e}")
            return None
        
    @staticmethod
    def set(key: str, value: Any, ttl_seconds: int) -> bool:
        if redis_client is None:
            return False
        
        try:
            serialised = json.dump(value)
            redis_client.setex(key , ttl_seconds, serialised)
            return True
        except (ConnectionError, TimeoutError) as e:
            logger.warning(f"Redis SET failed for key '{key}': {e}")
            return False
        
    @staticmethod
    def delete(key: str) -> bool:
        if redis_client is None:
            return False
        
        try:
            redis_client.delete(key)
            return True
        except (ConnectionError, TimeoutError) as e:
            logger.warning(f"Redis DELETE failed for key '{key}': {e} ")
            return False
        
    @staticmethod
    def is_available() -> bool:
        if redis_client is None:
            return None
        
        try:
            redis_client.ping()
            return True
        except Exception:
            return False
        

cache = RedisCache()