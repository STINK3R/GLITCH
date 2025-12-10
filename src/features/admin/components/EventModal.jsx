/**
 * Модальное окно создания/редактирования события
 */

import { useState, useEffect, useRef } from "react";
import { adminApi } from "../api";
import { getImageUrl } from "../../../utils/imageUrl";

// Иконка закрытия
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Иконка плюса
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 4v12M4 10h12" strokeLinecap="round" />
  </svg>
);

// Иконка поиска
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="7" cy="7" r="5" />
    <path d="M14 14l-3.5-3.5" strokeLinecap="round" />
  </svg>
);

// Иконка чекбокса
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 6l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Иконка стрелки вниз
const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function EventModal({ isOpen, onClose, onSave, event = null }) {
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);
  const isEditing = !!event;

  // Состояние формы (поля соответствуют API: name, type, city, pay_data, max_members, location)
  const [formData, setFormData] = useState({
    name: "",
    short_description: "",
    description: "",
    pay_data: "",
    type: "",
    city: "",
    location: "",
    max_members: "",
    start_date: "",
    end_date: "",
    invited_users: [],
  });

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Справочники
  const [eventTypes, setEventTypes] = useState([]);
  const [cities, setCities] = useState([]);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [isUsersExpanded, setIsUsersExpanded] = useState(false);
  const [isLoadingRefs, setIsLoadingRefs] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Загрузка справочников
  useEffect(() => {
    if (isOpen) {
      loadReferences();
    }
  }, [isOpen]);

  const loadReferences = async () => {
    setIsLoadingRefs(true);
    try {
      const [typesData, citiesData, usersData] = await Promise.all([
        adminApi.getEventTypes().catch((e) => {
          console.error("Ошибка загрузки типов событий:", e);
          return [];
        }),
        adminApi.getCities().catch((e) => {
          console.error("Ошибка загрузки городов:", e);
          return [];
        }),
        adminApi.getUsers().catch((e) => {
          console.error("Ошибка загрузки пользователей:", e);
          return [];
        }),
      ]);
      // Обработка разных форматов ответа API
      setEventTypes(Array.isArray(typesData) ? typesData : typesData?.items || typesData?.data || []);
      setCities(Array.isArray(citiesData) ? citiesData : citiesData?.items || citiesData?.data || []);
      setUsers(Array.isArray(usersData) ? usersData : usersData?.items || usersData?.data || []);
    } catch (error) {
      console.error("Ошибка загрузки справочников:", error);
    } finally {
      setIsLoadingRefs(false);
    }
  };

  // Инициализация формы при редактировании
  useEffect(() => {
    if (isOpen && event) {
      setFormData({
        name: event.name || "",
        short_description: event.short_description || "",
        description: event.description || "",
        pay_data: event.pay_data || "",
        type: event.type || "",
        city: event.city || "",
        location: event.location || "",
        max_members: event.max_members || "",
        start_date: event.start_date ? event.start_date.split("T")[0] : "",
        end_date: event.end_date ? event.end_date.split("T")[0] : "",
        invited_users: event.members?.map(m => m.id) || [],
      });
      setCoverPreview(event.image_url ? getImageUrl(event.image_url) : null);
    } else if (isOpen) {
      // Сброс формы при создании
      setFormData({
        name: "",
        short_description: "",
        description: "",
        pay_data: "",
        type: "",
        city: "",
        location: "",
        max_members: "",
        start_date: "",
        end_date: "",
        invited_users: [],
      });
      setCoverFile(null);
      setCoverPreview(null);
    }
    setErrors({});
  }, [isOpen, event]);

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Блокировка скролла
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Обработка клика вне модалки
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Обработка изменения полей
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Обработка загрузки файла
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверка размера файла (макс 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, cover: "Файл слишком большой (макс. 5MB)" }));
        return;
      }

      // Проверка типа файла
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, cover: "Выберите изображение" }));
        return;
      }

      setIsUploadingCover(true);
      setCoverFile(file);
      
      // Показываем превью
      const reader = new FileReader();
      reader.onload = () => {
        setCoverPreview(reader.result);
        setIsUploadingCover(false);
      };
      reader.onerror = () => {
        setErrors((prev) => ({ ...prev, cover: "Ошибка чтения файла" }));
        setIsUploadingCover(false);
      };
      reader.readAsDataURL(file);

      // Очищаем ошибку
      if (errors.cover) {
        setErrors((prev) => ({ ...prev, cover: null }));
      }
    }
  };

  // Переключение участника
  const toggleParticipant = (userId) => {
    setFormData((prev) => ({
      ...prev,
      invited_users: prev.invited_users.includes(userId)
        ? prev.invited_users.filter((id) => id !== userId)
        : [...prev.invited_users, userId],
    }));
  };

  // Фильтрация пользователей (используем name, surname из API)
  const filteredUsers = users.filter((user) => {
    const searchLower = userSearch.toLowerCase();
    const fullName = `${user.name || ""} ${user.surname || ""}`.toLowerCase();
    const email = (user.email || "").toLowerCase();
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  // Валидация
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Обязательное поле";
    if (!formData.description.trim()) newErrors.description = "Обязательное поле";
    if (!formData.type) newErrors.type = "Выберите тип";
    if (!formData.city) newErrors.city = "Выберите город";
    if (!formData.start_date) newErrors.start_date = "Укажите дату";
    if (!formData.end_date) newErrors.end_date = "Укажите дату";
    if (!coverPreview) newErrors.cover = "Загрузите обложку";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      // Обязательные поля
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("city", formData.city);
      // Даты в формате YYYY-MM-DD (API ожидает format: date)
      formDataToSend.append("start_date", formData.start_date);
      formDataToSend.append("end_date", formData.end_date);
      
      // Опциональные поля
      if (formData.short_description) formDataToSend.append("short_description", formData.short_description);
      if (formData.pay_data) formDataToSend.append("pay_data", formData.pay_data);
      if (formData.location) formDataToSend.append("location", formData.location);
      if (formData.max_members) formDataToSend.append("max_members", String(formData.max_members));
      if (formData.invited_users?.length > 0) {
        formDataToSend.append("invited_users", JSON.stringify(formData.invited_users));
      }
      
      // Фото (обязательно для создания)
      if (coverFile) {
        formDataToSend.append("photo", coverFile);
      }

      if (isEditing) {
        await adminApi.updateEvent(event.id, formDataToSend);
      } else {
        await adminApi.createEvent(formDataToSend);
      }

      onSave();
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      setErrors({ submit: error.message || "Ошибка сохранения события" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full sm:max-w-lg min-h-screen sm:min-h-0 sm:max-h-[90vh] bg-white sm:rounded-2xl shadow-2xl transform animate-scale-in overflow-hidden flex flex-col"
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
            {isEditing ? "Редактирование события" : "Новое событие"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          {isLoadingRefs ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
          <div className="px-4 sm:px-6 py-4 space-y-4">
            {/* Название */}
            <div>
              <label className="block text-sm text-neutral-600 mb-1">
                Название <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Например: «Балет Щелкунчик»"
                className={`w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 ${
                  errors.name ? "ring-2 ring-red-500/50" : ""
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Краткое описание */}
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Краткое описание</label>
              <input
                type="text"
                name="short_description"
                value={formData.short_description}
                onChange={handleChange}
                placeholder="Расскажите о событии"
                className="w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            {/* Детальное описание */}
            <div>
              <label className="block text-sm text-neutral-600 mb-1">
                Детальное описание <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Подробно расскажите о событии"
                rows={3}
                className={`w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none ${
                  errors.description ? "ring-2 ring-red-500/50" : ""
                }`}
              />
              {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
            </div>

            {/* Данные по оплате */}
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Данные по оплате</label>
              <input
                type="text"
                name="pay_data"
                value={formData.pay_data}
                onChange={handleChange}
                placeholder="Опишите процесс оплаты"
                className="w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            {/* Обложка */}
            <div>
              <label className="block text-sm text-neutral-600 mb-1">
                Обложка карточки <span className="text-red-500">*</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {isUploadingCover ? (
                <div className="w-full h-32 rounded-xl bg-neutral-100 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : coverPreview ? (
                <div className="relative w-full h-32 rounded-xl overflow-hidden bg-neutral-100">
                  <img src={coverPreview} alt="Обложка" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverFile(null);
                      setCoverPreview(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <CloseIcon />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors ${
                    errors.cover ? "text-red-600" : ""
                  }`}
                >
                  <PlusIcon />
                  <span className="text-sm font-medium">Загрузить обложку</span>
                </button>
              )}
              {errors.cover && <p className="mt-1 text-xs text-red-500">{errors.cover}</p>}
            </div>

            {/* Тип события */}
            <div>
              <label className="block text-sm text-neutral-600 mb-1">
                Тип события <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 ${
                    errors.type ? "ring-2 ring-red-500/50" : ""
                  } ${!formData.type ? "text-neutral-400" : "text-neutral-900"}`}
                >
                  <option value="">Выберите тип</option>
                  {eventTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                  <ChevronDownIcon />
                </div>
              </div>
              {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
            </div>

            {/* Город */}
            <div>
              <label className="block text-sm text-neutral-600 mb-1">
                Город <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 ${
                    errors.city ? "ring-2 ring-red-500/50" : ""
                  } ${!formData.city ? "text-neutral-400" : "text-neutral-900"}`}
                >
                  <option value="">Выберите город</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                  <ChevronDownIcon />
                </div>
              </div>
              {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
            </div>

            {/* Место проведения */}
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Место проведения</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Адрес или название места"
                className="w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            {/* Максимальное количество участников */}
            <div>
              <label className="block text-sm text-neutral-600 mb-1">
                Максимальное количество участников
              </label>
              <input
                type="number"
                name="max_members"
                value={formData.max_members}
                onChange={handleChange}
                placeholder="Например: 500"
                min="1"
                className="w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            {/* Дата начала */}
            <div>
              <label className="block text-sm text-neutral-600 mb-1">
                Дата начала <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 ${
                  errors.start_date ? "ring-2 ring-red-500/50" : ""
                } ${!formData.start_date ? "text-neutral-400" : "text-neutral-900"}`}
              />
              {errors.start_date && <p className="mt-1 text-xs text-red-500">{errors.start_date}</p>}
            </div>

            {/* Дата окончания */}
            <div>
              <label className="block text-sm text-neutral-600 mb-1">
                Дата окончания <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 ${
                  errors.end_date ? "ring-2 ring-red-500/50" : ""
                } ${!formData.end_date ? "text-neutral-400" : "text-neutral-900"}`}
              />
              {errors.end_date && <p className="mt-1 text-xs text-red-500">{errors.end_date}</p>}
            </div>

            {/* Выбор участников */}
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Приглашённые участники</label>
              <button
                type="button"
                onClick={() => setIsUsersExpanded(!isUsersExpanded)}
                className="w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-red-500/20"
              >
                <span className="text-neutral-900">
                  Участники: {users.length}{" "}
                  {formData.invited_users.length > 0 && (
                    <span className="text-neutral-500">
                      (Выбрано: {formData.invited_users.length})
                    </span>
                  )}
                </span>
                <ChevronDownIcon />
              </button>

              {isUsersExpanded && (
                <div className="mt-2 border border-neutral-200 rounded-xl overflow-hidden">
                  {/* Поиск */}
                  <div className="p-3 border-b border-neutral-100">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                        <SearchIcon />
                      </div>
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Поиск"
                        className="w-full pl-9 pr-4 py-2 bg-neutral-50 rounded-lg text-sm placeholder-neutral-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Список пользователей */}
                  <div className="max-h-60 overflow-y-auto">
                    {filteredUsers.map((user) => (
                      <label
                        key={user.id}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 cursor-pointer"
                      >
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                            formData.invited_users.includes(user.id)
                              ? "bg-red-500"
                              : "border-2 border-neutral-300"
                          }`}
                          onClick={() => toggleParticipant(user.id)}
                        >
                          {formData.invited_users.includes(user.id) && <CheckIcon />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-neutral-900 truncate">
                            {user.name} {user.surname}
                          </div>
                          <div className="text-xs text-neutral-500 truncate">{user.email}</div>
                        </div>
                      </label>
                    ))}
                    {filteredUsers.length === 0 && (
                      <div className="px-4 py-6 text-center text-sm text-neutral-500">
                        Пользователи не найдены
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Ошибка отправки */}
            {errors.submit && (
              <div className="p-3 bg-red-50 rounded-xl text-sm text-red-600">{errors.submit}</div>
            )}
          </div>
          )}

          {/* Кнопка отправки */}
          <div className="px-4 sm:px-6 py-4 border-t border-neutral-100 sticky bottom-0 bg-white">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Сохранение...
                </>
              ) : isEditing ? (
                "Сохранить изменения"
              ) : (
                "Добавить событие"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
