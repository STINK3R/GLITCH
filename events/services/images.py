import uuid

from fastapi.datastructures import UploadFile

from main.config.settings import settings


class ImagesService:

    @staticmethod
    def generate_unique_image_name(image: UploadFile) -> str:
        return f"{uuid.uuid4()}.{image.filename.split('.')[-1]}"

    @staticmethod
    async def save_image(image: UploadFile) -> str:
        image_name = ImagesService.generate_unique_image_name(image)
        image_path = settings.IMAGES_DIR / image_name

        # Создаем директорию, если её нет
        image_path.parent.mkdir(parents=True, exist_ok=True)

        with open(image_path, "wb") as f:
            f.write(await image.read())

        # Возвращаем относительный путь для URL
        return f"/images/{image_name}"
