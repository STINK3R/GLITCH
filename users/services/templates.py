from pathlib import Path
from string import Template

from main.config.settings import settings


class TemplatesService:
    @staticmethod
    def get_template_path(template_name: str) -> Path:
        current_file = Path(__file__)
        templates_dir = current_file.parent.parent / "templates"
        return templates_dir / template_name

    @staticmethod
    def load_template(template_name: str) -> str:
        template_path = TemplatesService.get_template_path(template_name)
        with open(template_path, "r", encoding="utf-8") as f:
            return f.read()

    @staticmethod
    def get_verification_email_html(verification_code: str, verification_url: str) -> str:
        template_content = TemplatesService.load_template("verification.html")
        template = Template(template_content)
        return template.substitute(
            verification_code=verification_code,
            verification_url=verification_url
        )

    @staticmethod
    def get_password_reset_email_html(reset_url: str) -> str:
        template_content = TemplatesService.load_template("password_reset.html")
        template = Template(template_content)
        return template.substitute(reset_url=reset_url)

    @staticmethod
    def get_password_reset_success_email_html() -> str:
        template_content = TemplatesService.load_template("password_reset_success.html")
        template = Template(template_content)
        return template.substitute(app_url=settings.APP_URL)

    @staticmethod
    def get_welcome_email_html() -> str:
        template_content = TemplatesService.load_template("welcome.html")
        template = Template(template_content)
        return template.substitute(app_url=settings.APP_URL)
