#!/usr/bin/env python
"""
CLI to run worker dev server.
"""

import click

import logging

from flask.cli import FlaskGroup, run_command
from redash.app import create_worker

logger = logging.getLogger(__name__)


def create(group):
    app = create_worker()
    group.app = app

    @app.shell_context_processor
    def shell_context():
        from redash import models, settings

        return {"models": models, "settings": settings}

    return app


@click.group(cls=FlaskGroup, create_app=create)
def server():
    """Management script for Worker server"""


server.add_command(run_command, "runserver")
if __name__ == '__main__':
    server()
