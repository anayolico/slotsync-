#!/usr/bin/env python
"""
Root runner for SlotSync database reset utility.
Usage:
    python reset_db.py
    python reset_db.py --confirm
"""
import sys
import os

# Ensure the server directory is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.reset_db import main

if __name__ == "__main__":
    main()
