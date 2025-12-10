from pathlib import Path
from string import Template

import aiofiles  # type: ignore[import-untyped]

from main.config.settings import settings


class TemplatesService:
    @staticmethod
    def get_template_path(template_name: str) -> Path:
        current_file = Path(__file__)
        templates_dir = current_file.parent.parent / "templates"
        return templates_dir / template_name

    @staticmethod
    async def load_template(template_name: str) -> str:
        template_path = TemplatesService.get_template_path(template_name)
        async with aiofiles.open(template_path, "r", encoding="utf-8") as f:
            return await f.read()

    @staticmethod
    async def get_verification_email_html(verification_code: str, verification_url: str) -> str:
        template_content = await TemplatesService.load_template("verification.html")
        template = Template(template_content)
        return template.substitute(
            verification_code=verification_code,
            verification_url=verification_url
        )

    @staticmethod
    async def get_password_reset_email_html(reset_url: str) -> str:
        template_content = await TemplatesService.load_template("password-reset.html")
        template = Template(template_content)
        return template.substitute(reset_url=reset_url)

    @staticmethod
    async def get_password_reset_success_email_html() -> str:
        template_content = await TemplatesService.load_template("password-reset-success.html")
        template = Template(template_content)
        return template.substitute(app_url=settings.APP_URL)

    @staticmethod
    async def get_welcome_email_html() -> str:
        template_content = await TemplatesService.load_template("welcome.html")
        template = Template(template_content)
        return template.substitute(app_url=settings.APP_URL)

    @staticmethod
    async def get_event_created_email_html(
        event_name: str,
        event_date: str,
        event_time: str,
        event_location: str,
        max_participants: int | str,
        event_description: str,
        event_url: str
    ) -> str:
        template_content = await TemplatesService.load_template("event-created.html")
        template = Template(template_content)
        return template.substitute(
            event_name=event_name,
            event_date=event_date,
            event_time=event_time,
            event_location=event_location,
            max_participants=max_participants,
            event_description=event_description,
            event_url=event_url
        )

    @staticmethod
    async def get_event_member_cancelled_email_html(
        event_name: str,
        event_date: str,
        event_time: str,
        event_location: str,
        member_name: str,
        members_count: int,
        event_url: str
    ) -> str:
        template_content = await TemplatesService.load_template("event-member-cancelled.html")
        template = Template(template_content)
        return template.substitute(
            event_name=event_name,
            event_date=event_date,
            event_time=event_time,
            event_location=event_location,
            member_name=member_name,
            members_count=members_count,
            event_url=event_url
        )

    @staticmethod
    async def get_event_member_confirmed_email_html(
        event_name: str,
        event_date: str,
        event_time: str,
        event_location: str,
        member_name: str,
        members_count: int,
        event_url: str
    ) -> str:
        template_content = await TemplatesService.load_template("event-member-confirmed.html")
        template = Template(template_content)
        return template.substitute(
            event_name=event_name,
            event_date=event_date,
            event_time=event_time,
            event_location=event_location,
            member_name=member_name,
            members_count=members_count,
            event_url=event_url
        )

    @staticmethod
    async def get_event_reminder_24h_email_html(
        event_name: str,
        event_date: str,
        event_time: str,
        event_location: str,
        members_count: int,
        event_url: str
    ) -> str:
        template_content = await TemplatesService.load_template("event-reminder-24h.html")
        template = Template(template_content)
        return template.substitute(
            event_name=event_name,
            event_date=event_date,
            event_time=event_time,
            event_location=event_location,
            members_count=members_count,
            event_url=event_url
        )

    @staticmethod
    async def get_event_updated_email_html(
        event_name: str,
        old_date: str | None,
        new_date: str | None,
        old_location: str | None,
        new_location: str | None,
        new_description: str | None,
        event_url: str
    ) -> str:
        change_items_html = ""
        if old_date and new_date:
            change_item_html = await TemplatesService.load_template("updated/event-updated-date.html")
            change_item_html = Template(change_item_html).substitute(
                event_name=event_name,
                old_date=old_date,
                new_date=new_date,
                event_url=event_url
            )
            change_items_html += change_item_html
        if old_location and new_location:
            change_item_html = await TemplatesService.load_template("updated/event-updated-place.html")
            change_item_html = Template(change_item_html).substitute(
                event_name=event_name,
                old_location=old_location,
                new_location=new_location,
                event_url=event_url
            )
            change_items_html += change_item_html
        if new_description:
            change_item_html = await TemplatesService.load_template("updated/event-updated-desc.html")
            change_item_html = Template(change_item_html).substitute(
                event_name=event_name,
                new_description=new_description,
                event_url=event_url
            )
            change_items_html += change_item_html

        template_content = await TemplatesService.load_template("updated/event-updated.html")
        template = Template(template_content)
        return template.substitute(
            event_name=event_name,
            change_items_html=change_items_html,
            event_url=event_url
        )

    @staticmethod
    async def get_event_cancelled_email_html(
        event_name: str,
        event_date: str,
        event_location: str,
        event_url: str
    ) -> str:
        template_content = await TemplatesService.load_template("event-cancelled.html")
        template = Template(template_content)
        return template.substitute(
            event_name=event_name,
            event_date=event_date,
            event_location=event_location,
            event_url=event_url
        )

    @staticmethod
    async def get_admin_reset_password_email_html(
        new_password: str,
        login_url: str
    ) -> str:
        template_content = await TemplatesService.load_template("admin-password-reset.html")
        template = Template(template_content)
        return template.substitute(
            new_password=new_password,
            login_url=login_url
        )

    @staticmethod
    async def get_event_review_email_html(
        event_name: str,
        event_date: str,
        event_time: str,
        event_location: str,
        event_url: str
    ) -> str:
        template_content = await TemplatesService.load_template("event-review.html")
        template = Template(template_content)
        return template.substitute(
            event_name=event_name,
            event_date=event_date,
            event_time=event_time,
            event_location=event_location,
            event_url=event_url
        )
