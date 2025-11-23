"""
Flask MT5 Service - Main Application Package

This is a placeholder file for CI/CD workflows.
Actual implementation will be created during Phase 3.
"""

from flask import Flask


def create_app():
    """
    Application factory pattern for Flask MT5 service.
    This is a minimal placeholder for CI/CD workflows.
    """
    app = Flask(__name__)

    @app.route('/health')
    def health():
        return {'status': 'ok', 'message': 'Placeholder MT5 service'}

    return app
