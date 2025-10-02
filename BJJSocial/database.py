import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager

# Database URL from environment. For developer convenience, when
# DATABASE_URL is not set we fall back to a local SQLite file so the
# backend can be started quickly in development without extra setup.
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # development default: local SQLite file in the submodule folder
    DATABASE_URL = "sqlite:///./bjj.db"
    _use_sqlite = True
else:
    _use_sqlite = DATABASE_URL.startswith("sqlite")

# Create SQLAlchemy engine. SQLite requires connect_args to allow
# usage from multiple threads in common dev setups.
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
