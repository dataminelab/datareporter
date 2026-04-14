#!/usr/bin/env python
"""
CLI to run worker dev server.
"""

import logging

import click
from flask.cli import FlaskGroup, run_command

from redash.app import create_worker

logger = logging.getLogger(__name__)


def create():
    app = create_worker()

    @app.shell_context_processor
    def shell_context():
        from redash import models, settings

        return {"models": models, "settings": settings}

    return app


@click.group(cls=FlaskGroup, create_app=create)
def server():
    """Management script for Worker server"""


server.add_command(run_command, "runserver")
if __name__ == "__main__":
    server()
