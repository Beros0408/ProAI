from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from supabase import create_client, Client
from core.config import get_settings

settings = get_settings()

# Lazy engine - ne se connecte que quand on en a besoin
_engine = None
_session_factory = None

class Base(DeclarativeBase):
    pass

def get_engine():
    global _engine
    if _engine is None:
        try:
            _engine = create_async_engine(settings.database_url, echo=settings.debug, pool_pre_ping=True)
        except Exception as e:
            print(f"Warning: Could not create DB engine: {e}")
            return None
    return _engine

def get_session_factory():
    global _session_factory
    engine = get_engine()
    if engine and _session_factory is None:
        _session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    return _session_factory

def get_supabase() -> Client:
    return create_client(settings.supabase_url, settings.supabase_service_role_key)

async def get_db() -> AsyncSession:
    factory = get_session_factory()
    if factory is None:
        raise Exception("Database not available")
    async with factory() as session:
        yield session