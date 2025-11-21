from __future__ import annotations

import os
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

BASE_DIR = Path(__file__).resolve().parent

DATABASE_URL = os.environ.get("PROJECTS_DATABASE_URL")
if not DATABASE_URL:
  db_path = BASE_DIR / "projects.db"
  DATABASE_URL = f"sqlite:///{db_path}"

engine = create_engine(
  DATABASE_URL,
  connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
  future=True,
  echo=False,
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, future=True)
Base = declarative_base()


@contextmanager
def get_session() -> Iterator[Session]:
  session: Session = SessionLocal()
  try:
    yield session
    session.commit()
  except Exception:
    session.rollback()
    raise
  finally:
    session.close()
