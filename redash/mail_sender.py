import logging

from redash import settings

logger = logging.getLogger(__name__)


def send_message(message):
    """Send an email message via Resend API if configured, otherwise via Flask-Mail SMTP.

    Args:
        message: A flask_mail.Message instance.
    """
    if settings.RESEND_API_KEY:
        _send_via_resend(message)
    else:
        _send_via_flask_mail(message)


def _send_via_flask_mail(message):
    from redash import mail

    mail.send(message)


def _send_via_resend(message):
    try:
        import resend
    except ImportError:
        logger.error("RESEND_API_KEY is set but the 'resend' package is not installed. Falling back to SMTP.")
        _send_via_flask_mail(message)
        return

    resend.api_key = settings.RESEND_API_KEY

    sender = message.sender or settings.MAIL_DEFAULT_SENDER

    params = {
        "from": sender,
        "to": message.recipients,
        "subject": message.subject,
    }

    if message.html:
        params["html"] = message.html
    if message.body:
        params["text"] = message.body

    if message.cc:
        params["cc"] = message.cc
    if message.bcc:
        params["bcc"] = message.bcc
    if message.reply_to:
        params["reply_to"] = message.reply_to

    resend.Emails.send(params)
    logger.debug("Email sent via Resend to %s", message.recipients)
