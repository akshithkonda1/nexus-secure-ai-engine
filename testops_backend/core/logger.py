import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path
from .config import LOG_DIR, WARROOM_DIR


def _build_handler(path: Path) -> RotatingFileHandler:
    handler = RotatingFileHandler(path, maxBytes=1_000_000, backupCount=5)
    formatter = logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    return handler


def get_logger(name: str, warroom: bool = False) -> logging.Logger:
    logger = logging.getLogger(name)
    if logger.handlers:
        return logger

    logger.setLevel(logging.INFO)
    log_file = LOG_DIR / f"{name}.log"
    war_file = WARROOM_DIR / f"{name}.log"

    logger.addHandler(_build_handler(log_file))
    if warroom:
        logger.addHandler(_build_handler(war_file))

    console = logging.StreamHandler()
    console.setFormatter(
        logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    )
    logger.addHandler(console)
    return logger
