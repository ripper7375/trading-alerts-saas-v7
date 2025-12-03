"""
Routes Package - Blueprint Registration
"""

from flask import Blueprint

# Create a Blueprint for indicators routes
indicators_bp = Blueprint('indicators', __name__, url_prefix='/api')

# Import routes to register them with the blueprint
from app.routes import indicators

__all__ = ['indicators_bp']
