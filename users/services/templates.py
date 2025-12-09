from pathlib import Path


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
    def get_verification_email_html(verification_code: str) -> str:
        template = TemplatesService.load_template("verification.html")
        return template.format(verification_code=verification_code)

    @staticmethod
    def get_password_reset_email_html(reset_url: str) -> str:
        template = TemplatesService.load_template("password_reset.html")
        return template.format(reset_url=reset_url)
