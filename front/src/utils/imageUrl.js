/**
 * Хелпер для формирования URL изображений
 * Использует эндпоинт /api/media/{photo_url}
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Получить полный URL изображения через API media
 * @param {string} photoUrl - URL/путь изображения из API
 * @returns {string|null} Полный URL или null
 */
export function getImageUrl(photoUrl) {
  if (!photoUrl) return null;
  
  // Если уже полный URL - возвращаем как есть
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
    return photoUrl;
  }
  
  // Убираем начальный слеш если есть
  const cleanPath = photoUrl.startsWith('/') ? photoUrl.slice(1) : photoUrl;
  
  // Формируем URL через /api/media/
  return `${API_BASE_URL}/api/media/${cleanPath}`;
}
