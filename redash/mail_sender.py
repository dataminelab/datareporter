import logging

from redash import mail

logger = logging.getLogger(__name__)


def send_message(message):
    """Send an email message via Flask-Mail SMTP.

    Args:
        message: A flask_mail.Message instance.
    """
    mail.send(message)
