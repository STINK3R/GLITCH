/**
 * Хелпер для формирования URL изображений
 * Обрабатывает относительные и абсолютные пути
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Получить полный URL изображения
 * @param {string} url - URL изображения из API
 * @returns {string|null} Полный URL или null
 */
export function getImageUrl(url) {
  if (!url) return null;
  
  console.log("getImageUrl input:", url);
  
  // Если уже полный URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    console.log("getImageUrl output (full URL):", url);
    return url;
  }
  
  // Если относительный путь - добавляем базовый URL
  // В dev режиме прокси обработает /uploads и /static
  // В production нужно будет использовать полный URL бэкенда
  let result;
  if (url.startsWith('/')) {
    result = API_BASE_URL + url;
  } else {
    result = API_BASE_URL + '/' + url;
  }
  
  console.log("getImageUrl output:", result);
  return result;
}
