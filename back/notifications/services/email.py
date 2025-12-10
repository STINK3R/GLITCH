import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

import aiosmtplib

from main.config.settings import settings
from notifications.services.templates import TemplatesService

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
        html_body = await TemplatesService.get_verification_email_html(verification_code, verification_url)
        return await EmailService.send_email(email, subject, html_body)

    @staticmethod
    async def send_password_reset_email(email: str, reset_token: str) -> bool:
        reset_url = f"{settings.APP_URL}{settings.RESET_URL}?token={reset_token}"
        subject = "Сброс пароля"
        html_body = await TemplatesService.get_password_reset_email_html(reset_url)
        return await EmailService.send_email(email, subject, html_body)

    @staticmethod
    async def send_password_reset_success_email(email: str) -> bool:
        subject = "Сброс пароля успешно выполнен"
        html_body = await TemplatesService.get_password_reset_success_email_html()
        return await EmailService.send_email(email, subject, html_body)

    @staticmethod
    async def send_welcome_email(email: str) -> bool:
        subject = f"Добро пожаловать в {settings.SMTP_FROM_NAME}"
        html_body = await TemplatesService.get_welcome_email_html()
        return await EmailService.send_email(email, subject, html_body)

    @staticmethod
    async def send_event_created_email(
        email: str,
        event_name: str,
        event_date: str,
        event_time: str,
        event_location: str,
        max_participants: int | str,
        event_description: str,
        event_url: str
    ) -> bool:
        subject = "Событие создано"
        html_body = await TemplatesService.get_event_created_email_html(
            event_name,
            event_date,
            event_time,
            event_location,
            max_participants,
            event_description,
            event_url
        )
        return await EmailService.send_email(email, subject, html_body)

    @staticmethod
    async def send_event_member_cancelled_email(
        email: str,
        event_name: str,
        event_date: str,
        event_time: str,
        event_location: str,
        member_name: str,
        new_members_count: int,
        event_url: str
    ) -> bool:
        subject = "Участник отменил участие в событии"
        html_body = await TemplatesService.get_event_member_cancelled_email_html(
            event_name=event_name,
            event_date=event_date,
            event_time=event_time,
            event_location=event_location,
            member_name=member_name,
            members_count=new_members_count,
            event_url=event_url
        )
        return await EmailService.send_email(email, subject, html_body)

    @staticmethod
    async def send_event_member_confirmed_email(
        email: str,
        event_name: str,
        event_date: str,
        event_time: str,
        event_location: str,
        member_name: str,
        new_members_count: int,
        event_url: str
    ) -> bool:
        subject = "Участник подтвердил участие в событии"
        html_body = await TemplatesService.get_event_member_confirmed_email_html(
            event_name=event_name,
            event_date=event_date,
            event_time=event_time,
            event_location=event_location,
            member_name=member_name,
            members_count=new_members_count,
            event_url=event_url
        )
        return await EmailService.send_email(email, subject, html_body)

    @staticmethod
    async def send_event_reminder_24h_email(
        email: str,
        event_name: str,
        event_date: str,
        event_time: str,
        event_location: str,
        members_count: int,
        event_url: str
    ) -> bool:
        subject = "Напоминание о событии"
        html_body = await TemplatesService.get_event_reminder_24h_email_html(
            event_name=event_name,
            event_date=event_date,
            event_time=event_time,
            event_location=event_location,
            members_count=members_count,
            event_url=event_url
        )
        return await EmailService.send_email(email, subject, html_body)

    @staticmethod
    async def send_event_updated_email(
        email: str,
        event_name: str,
        old_date: str | None,
        new_date: str | None,
        old_location: str | None,
        new_location: str | None,
        new_description: str | None,
        event_url: str
    ) -> bool:
        subject = "Изменения в событии"
        html_body = await TemplatesService.get_event_updated_email_html(
            event_name=event_name,
            old_date=old_date,
            new_date=new_date,
            old_location=old_location,
            new_location=new_location,
            new_description=new_description,
            event_url=event_url
        )
        return await EmailService.send_email(email, subject, html_body)

    @staticmethod
    async def send_event_cancelled_email(
        email: str,
        event_name: str,
        event_date: str,
        event_location: str,
        event_url: str
    ) -> bool:
        subject = "Событие отменено"
        html_body = await TemplatesService.get_event_cancelled_email_html(
            event_name=event_name,
            event_date=event_date,
            event_location=event_location,
            event_url=event_url
        )
        return await EmailService.send_email(email, subject, html_body)

    @staticmethod
    async def send_admin_reset_password_email(
        email: str,
        new_password: str
    ) -> bool:
        subject = "Сброс пароля"
        html_body = await TemplatesService.get_admin_reset_password_email_html(
            new_password=new_password,
            login_url=f"{settings.APP_URL}{settings.LOGIN_URL}"
        )
        return await EmailService.send_email(email, subject, html_body)

    @staticmethod
    async def send_event_review_email(
        email: str,
        event_name: str,
        event_date: str,
        event_time: str,
        event_location: str,
        event_url: str
    ) -> bool:
        subject = "Оценка события"
        html_body = await TemplatesService.get_event_review_email_html(
            event_name=event_name,
            event_date=event_date,
            event_time=event_time,
            event_location=event_location,
            event_url=event_url
        )
        return await EmailService.send_email(email, subject, html_body)
