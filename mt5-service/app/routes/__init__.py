"""
Routes Package - Blueprint Registration
"""

from flask import Blueprint
from typing import TYPE_CHECKING

# Create a Blueprint for indicators routes
indicators_bp = Blueprint('indicators', __name__, url_prefix='/api')

# Import routes to register them with the blueprint
# This import will be uncommented after indicators.py is created (File 3/15)
# from app.routes import indicators

__all__ = ['indicators_bp']
