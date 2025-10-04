import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager

# Database URL from environment.
DATABASE_URL = os.getenv("DATABASE_URL")

# Fallback to a temporary SQLite DB in Cloud Run's writable /tmp directory
# if no DATABASE_URL is provided.
if not DATABASE_URL:
    DATABASE_URL = "sqlite:////tmp/bjj.db"  # Use writable /tmp directory
    _use_sqlite = True
else:
    _use_sqlite = DATABASE_URL.startswith("sqlite")

# Create SQLAlchemy engine.
if _use_sqlite:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}, pool_pre_ping=True)
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@contextmanager
def get_db_context():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
