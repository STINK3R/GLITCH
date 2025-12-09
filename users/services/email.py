import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

import aiosmtplib

from main.config.settings import settings
from users.services.templates import TemplatesService

logger = logging.getLogger(__name__)


class EmailService:
    @staticmethod
    async def send_email(
        email: str,
        subject: str,
        html_body: Optional[str] = None
    ) -> bool:

        try:
            message = MIMEMultipart('alternative')
            message['From'] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
            message['To'] = email
            message['Subject'] = subject

            if html_body is None:
                html_body = ""
            html_part = MIMEText(html_body, 'html', 'utf-8')
            message.attach(html_part)

            smtp = aiosmtplib.SMTP(
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                use_tls=False,
                start_tls=True,
            )
            await smtp.connect()
            await smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            await smtp.send_message(message)
            await smtp.quit()

            logger.info(f"Email successfully sent to {email}")
            return True
        except Exception as e:
            logger.error(f"Unexpected error sending email: {e}", exc_info=True)
            return False

    @staticmethod
    async def send_verification_email(email: str, verification_code: str) -> bool:

        subject = "Подтверждение регистрации"
        verification_url = f"{settings.APP_URL}{settings.VERIFICATION_URL}?code={verification_code}"
        html_body = TemplatesService.get_verification_email_html(verification_code, verification_url)
        return await EmailService.send_email(email, subject, html_body)

    @staticmethod
    async def send_password_reset_email(email: str, reset_token: str) -> bool:
        reset_url = f"{settings.APP_URL}{settings.RESET_URL}?token={reset_token}"
        subject = "Сброс пароля"
        html_body = TemplatesService.get_password_reset_email_html(reset_url)
        return await EmailService.send_email(email, subject, html_body)

    @staticmethod
    async def send_password_reset_success_email(email: str) -> bool:
        subject = "Сброс пароля успешно выполнен"
        html_body = TemplatesService.get_password_reset_success_email_html()
        return await EmailService.send_email(email, subject, html_body)

    @staticmethod
    async def send_welcome_email(email: str) -> bool:
        subject = "Добро пожаловать в Glitch" # TODO: change to Слёт
        html_body = TemplatesService.get_welcome_email_html()
        return await EmailService.send_email(email, subject, html_body)
