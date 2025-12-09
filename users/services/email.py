import logging
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from main.config.settings import settings
from users.services.templates import TemplatesService

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    async def send_email(
        email: str, 
        subject: str, 
        body: str, 
        html_body: Optional[str] = None
    ) -> bool:

        try:
            message = MIMEMultipart('alternative')
            message['From'] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
            message['To'] = email
            message['Subject'] = subject
            
            text_part = MIMEText(body, 'plain', 'utf-8')
            message.attach(text_part)
            
            if html_body:
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
        body = f"""
Здравствуйте!

Для завершения регистрации введите следующий код верификации:

{verification_code}

Если вы не регистрировались на нашем сайте, проигнорируйте это письмо.

С уважением,
Команда Glitch
        """
        
        html_body = TemplatesService.get_verification_email_html(verification_code)
        return await EmailService.send_email(email, subject, body, html_body)

    @staticmethod
    async def send_password_reset_email(email: str, reset_token: str, reset_url: str) -> bool:
        subject = "Сброс пароля"
        body = f"""
Здравствуйте!

Вы запросили сброс пароля для вашего аккаунта.

Для сброса пароля перейдите по следующей ссылке:
{reset_url}

Если вы не запрашивали сброс пароля, проигнорируйте это письмо.

С уважением,
Команда Glitch
        """
        html_body = TemplatesService.get_password_reset_email_html(reset_url)
        return await EmailService.send_email(email, subject, body, html_body)