/**
 * Модальное окно создания/редактирования события
 */

import { useState, useEffect, useRef } from "react";
import { adminApi } from "../api";

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

  // Состояние формы
  const [formData, setFormData] = useState({
    title: "",
    short_description: "",
    description: "",
    payment_info: "",
    type_id: "",
    city_id: "",
    max_participants: "",
    start_date: "",
    end_date: "",
    participant_ids: [],
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
        title: event.title || "",
        short_description: event.short_description || "",
        description: event.description || "",
        payment_info: event.payment_info || "",
        type_id: event.type_id || "",
        city_id: event.city_id || "",
        max_participants: event.max_participants || "",
        start_date: event.start_date ? event.start_date.split("T")[0] : "",
        end_date: event.end_date ? event.end_date.split("T")[0] : "",
        participant_ids: event.participant_ids || [],
      });
      setCoverPreview(event.cover_url || null);
    } else if (isOpen) {
      // Сброс формы при создании
      setFormData({
        title: "",
        short_description: "",
        description: "",
        payment_info: "",
        type_id: "",
        city_id: "",
        max_participants: "",
        start_date: "",
        end_date: "",
        participant_ids: [],
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
      participant_ids: prev.participant_ids.includes(userId)
        ? prev.participant_ids.filter((id) => id !== userId)
        : [...prev.participant_ids, userId],
    }));
  };

  // Фильтрация пользователей
  const filteredUsers = users.filter((user) => {
    const searchLower = userSearch.toLowerCase();
    const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
    const email = (user.email || "").toLowerCase();
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  // Валидация
  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Обязательное поле";
    if (!formData.description.trim()) newErrors.description = "Обязательное поле";
    if (!formData.type_id) newErrors.type_id = "Выберите тип";
    if (!formData.start_date) newErrors.start_date = "Укажите дату";
    if (!formData.end_date) newErrors.end_date = "Укажите дату";
    if (!coverPreview && !isEditing) newErrors.cover = "Загрузите обложку";
    
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
      formDataToSend.append("title", formData.title);
      formDataToSend.append("short_description", formData.short_description);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("payment_info", formData.payment_info);
      formDataToSend.append("type_id", formData.type_id);
      if (formData.city_id) formDataToSend.append("city_id", formData.city_id);
      if (formData.max_participants) formDataToSend.append("max_participants", formData.max_participants);
      formDataToSend.append("start_date", formData.start_date);
      formDataToSend.append("end_date", formData.end_date);
      formData.participant_ids.forEach((id) => {
        formDataToSend.append("participant_ids", id);
      });
      if (coverFile) {
        formDataToSend.append("cover", coverFile);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg max-h-[90vh] bg-white rounded-2xl shadow-2xl transform animate-scale-in overflow-hidden flex flex-col"
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-xl font-semibold text-neutral-900">
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
          <div className="px-6 py-4 space-y-4">
            {/* Название */}
            <div>
              <label className="block text-sm text-neutral-600 mb-1">
                Название <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Например: «Балет Щелкунчик»"
                className={`w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 ${
                  errors.title ? "ring-2 ring-red-500/50" : ""
                }`}
              />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
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
                name="payment_info"
                value={formData.payment_info}
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
                  name="type_id"
                  value={formData.type_id}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 ${
                    errors.type_id ? "ring-2 ring-red-500/50" : ""
                  } ${!formData.type_id ? "text-neutral-400" : "text-neutral-900"}`}
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
              {errors.type_id && <p className="mt-1 text-xs text-red-500">{errors.type_id}</p>}
            </div>

            {/* Место проведения */}
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Место проведения</label>
              <div className="relative">
                <select
                  name="city_id"
                  value={formData.city_id}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 ${
                    !formData.city_id ? "text-neutral-400" : "text-neutral-900"
                  }`}
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
            </div>

            {/* Максимальное количество участников */}
            <div>
              <label className="block text-sm text-neutral-600 mb-1">
                Максимальное количество участников
              </label>
              <input
                type="number"
                name="max_participants"
                value={formData.max_participants}
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
              <label className="block text-sm text-neutral-600 mb-1">Выбор участников</label>
              <button
                type="button"
                onClick={() => setIsUsersExpanded(!isUsersExpanded)}
                className="w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-red-500/20"
              >
                <span className="text-neutral-900">
                  Участники: {users.length}{" "}
                  {formData.participant_ids.length > 0 && (
                    <span className="text-neutral-500">
                      (Выбрано: {formData.participant_ids.length})
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
                            formData.participant_ids.includes(user.id)
                              ? "bg-red-500"
                              : "border-2 border-neutral-300"
                          }`}
                          onClick={() => toggleParticipant(user.id)}
                        >
                          {formData.participant_ids.includes(user.id) && <CheckIcon />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-neutral-900 truncate">
                            {user.first_name} {user.last_name}
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
          <div className="px-6 py-4 border-t border-neutral-100">
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
