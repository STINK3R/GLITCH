/**
 * Страница управления событиями в админ-панели
 */

import { useState, useEffect, useRef } from "react";
import { adminApi } from "../api";
import { EventModal } from "./EventModal";
import { useToast } from "../../../components/ui/Toast";
import { ConfirmModal } from "../../../components/ui/ConfirmModal";
import { getImageUrl } from "../../../utils/imageUrl";

// Иконка информации
const InfoIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-neutral-300">
    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" />
    <path d="M24 22v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="24" cy="16" r="1.5" fill="currentColor" />
  </svg>
);

// Иконка участников
const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-neutral-500">
    <path
      d="M8 8a3 3 0 100-6 3 3 0 000 6zM2 14a6 6 0 0112 0H2z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Иконка меню (три точки)
const DotsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-neutral-400">
    <circle cx="10" cy="4" r="1.5" fill="currentColor" />
    <circle cx="10" cy="10" r="1.5" fill="currentColor" />
    <circle cx="10" cy="16" r="1.5" fill="currentColor" />
  </svg>
);

// Иконка редактирования
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M11.333 2A1.886 1.886 0 0114 4.667l-9 9-3.667 1 1-3.667 9-9z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Иконка удаления
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Иконка drag handle
const DragIcon = () => (
  <svg width="8" height="20" viewBox="0 0 8 20" fill="none" className="text-neutral-300">
    <circle cx="2" cy="4" r="1.5" fill="currentColor" />
    <circle cx="6" cy="4" r="1.5" fill="currentColor" />
    <circle cx="2" cy="10" r="1.5" fill="currentColor" />
    <circle cx="6" cy="10" r="1.5" fill="currentColor" />
    <circle cx="2" cy="16" r="1.5" fill="currentColor" />
    <circle cx="6" cy="16" r="1.5" fill="currentColor" />
  </svg>
);

// Иконка поиска
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="9" cy="9" r="6" />
    <path d="M13.5 13.5L17 17" strokeLinecap="round" />
  </svg>
);

// Иконка экспорта
const ExportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 1h8l3 3v11a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 6v6M5 9l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Иконка глаза для просмотра
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export function EventsManagement() {
  const [activeTab, setActiveTab] = useState("active");
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [previewEvent, setPreviewEvent] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, eventId: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [tabCounts, setTabCounts] = useState({ active: 0, past: 0, cancelled: 0 });
  const menuRef = useRef(null);
  const toast = useToast();

  // Загрузка событий с плавным переходом
  const loadEvents = async (tab = activeTab, isInitial = false) => {
    if (!isInitial) {
      setIsTransitioning(true);
    } else {
      setLoading(true);
    }
    try {
      let data;
      if (tab === "active") {
        data = await adminApi.getActiveEvents();
      } else if (tab === "past") {
        data = await adminApi.getPastEvents();
      } else if (tab === "cancelled") {
        data = await adminApi.getCancelledEvents();
      }
      setAllEvents(data || []);
      setTabCounts(prev => ({ ...prev, [tab]: (data || []).length }));
    } catch (error) {
      console.error("Ошибка загрузки событий:", error);
      toast.error("Ошибка загрузки событий");
    } finally {
      setLoading(false);
      // Небольшая задержка для плавной анимации
      setTimeout(() => setIsTransitioning(false), 150);
    }
  };

  // Загрузка всех счетчиков при монтировании
  const loadAllCounts = async () => {
    try {
      const [activeData, pastData, cancelledData] = await Promise.all([
        adminApi.getActiveEvents().catch(() => []),
        adminApi.getPastEvents().catch(() => []),
        adminApi.getCancelledEvents().catch(() => []),
      ]);
      setTabCounts({
        active: (activeData || []).length,
        past: (pastData || []).length,
        cancelled: (cancelledData || []).length,
      });
    } catch (error) {
      console.error("Ошибка загрузки счетчиков:", error);
    }
  };

  // Применение поиска
  useEffect(() => {
    if (!searchQuery.trim()) {
      setEvents(allEvents);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const filtered = allEvents.filter((event) =>
        (event.name || "").toLowerCase().includes(query)
      );
      setEvents(filtered);
    }
  }, [searchQuery, allEvents]);

  useEffect(() => {
    loadEvents(activeTab, loading);
  }, [activeTab]);

  // Загрузка счетчиков при монтировании
  useEffect(() => {
    loadAllCounts();
  }, []);

  // Обработчик смены таба с анимацией
  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setIsTransitioning(true);
    setActiveTab(tab);
  };

  // Закрытие меню при клике вне
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Экспорт участников события в CSV (через API)
  const exportEventMembersCSV = async (event) => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem("token");
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE_URL}/api/events/${event.id}/members-csv`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки файла');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${event.name}_участники.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Файл CSV успешно скачан");
    } catch (error) {
      console.error("Ошибка экспорта CSV:", error);
      toast.error("Ошибка экспорта в CSV");
    } finally {
      setIsExporting(false);
    }
  };

  // Экспорт участников события в Excel (через API)
  const exportEventMembersXLSX = async (event) => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem("token");
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE_URL}/api/events/${event.id}/members-excel`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки файла');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${event.name}_участники.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Файл Excel успешно скачан");
    } catch (error) {
      console.error("Ошибка экспорта Excel:", error);
      toast.error("Ошибка экспорта в Excel");
    } finally {
      setIsExporting(false);
    }
  };

  // Подсчет событий
  const activeCount = activeTab === "active" ? allEvents.length : 0;
  const pastCount = activeTab === "past" ? allEvents.length : 0;

  // Открыть модалку создания
  const handleCreate = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  // Открыть модалку редактирования
  const handleEdit = (event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  // Удаление события
  const handleDelete = async () => {
    if (!deleteConfirm.eventId) return;
    
    setIsDeleting(true);
    try {
      await adminApi.deleteEvent(deleteConfirm.eventId);
      toast.success("Событие успешно удалено");
      loadEvents();
    } catch (error) {
      console.error("Ошибка удаления:", error);
      toast.error("Ошибка удаления события");
    } finally {
      setIsDeleting(false);
      setDeleteConfirm({ isOpen: false, eventId: null });
    }
  };

  // Успешное сохранение события
  const handleEventSaved = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    toast.success(editingEvent ? "Событие успешно обновлено" : "Событие успешно добавлено");
    loadEvents();
  };

  // Форматирование даты
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="animate-fade-in">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900">
          События {events.length > 0 && <span className="text-neutral-400">{events.length}</span>}
        </h1>
      </div>

      {/* Табы - растянуты на всю ширину */}
      <div className="flex border-b border-neutral-200 mb-6">
        <button
          onClick={() => handleTabChange("active")}
          className={`flex-1 px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
            activeTab === "active"
              ? "border-red-500 text-neutral-900"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Активные <span className={`ml-1 transition-colors duration-200 ${activeTab === "active" ? "text-red-500" : "text-neutral-400"}`}>{tabCounts.active}</span>
        </button>
        <button
          onClick={() => handleTabChange("past")}
          className={`flex-1 px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
            activeTab === "past"
              ? "border-red-500 text-neutral-900"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Прошедшие <span className={`ml-1 transition-colors duration-200 ${activeTab === "past" ? "text-red-500" : "text-neutral-400"}`}>{tabCounts.past}</span>
        </button>
        <button
          onClick={() => handleTabChange("cancelled")}
          className={`flex-1 px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
            activeTab === "cancelled"
              ? "border-red-500 text-neutral-900"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Отклонённые <span className={`ml-1 transition-colors duration-200 ${activeTab === "cancelled" ? "text-red-500" : "text-neutral-400"}`}>{tabCounts.cancelled}</span>
        </button>
      </div>

      {/* Поиск по названию */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Поиск по названию события..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>
      </div>

      {/* Контент с плавными переходами */}
      <div className={`transition-all duration-300 ease-out ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : events.length === 0 ? (
          /* Пустое состояние */
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <InfoIcon />
            <h2 className="mt-4 text-xl font-semibold text-neutral-900">
              {activeTab === "cancelled" ? "Нет отклонённых событий" : "Пустая страница"}
            </h2>
            <p className="mt-2 text-neutral-500 text-center">
              {activeTab === "cancelled" 
                ? "Отклонённые события будут отображаться здесь"
                : activeTab === "past"
                ? "Прошедших событий пока нет"
                : <>Данная страница пока пустая.<br />Добавьте сюда событие</>
              }
            </p>
          </div>
        ) : (
          /* Список событий */
          <div className="space-y-3 sm:space-y-4">
          {events.map((event, index) => (
            <div
              key={event.id}
              className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start gap-3 sm:gap-4 shadow-sm animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Drag handle - скрыт на мобильных */}
              <div className="hidden sm:block pt-2 cursor-grab">
                <DragIcon />
              </div>

              {/* Изображение */}
              <div className="w-full sm:w-32 h-40 sm:h-24 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100">
                {event.image_url ? (
                  <img
                    src={getImageUrl(event.image_url)}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                      <path d="M21 15l-5-5L5 21" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Информация */}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-red-500 font-medium mb-1">
                      {event.type || "Событие"}
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-neutral-900 truncate">
                      {event.name}
                    </h3>
                  </div>
                  {/* Меню действий - мобильная версия */}
                  <div className="sm:hidden relative" ref={openMenuId === event.id ? menuRef : null}>
                    <button
                      onClick={() => setOpenMenuId(openMenuId === event.id ? null : event.id)}
                      className="p-1 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      <DotsIcon />
                    </button>
                    {openMenuId === event.id && (
                      <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-neutral-200 py-1 z-10 animate-scale-in">
                        <button
                          onClick={() => {
                            setPreviewEvent(event);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                        >
                          <EyeIcon />
                          Просмотр
                        </button>
                        <button
                          onClick={() => handleEdit(event)}
                          className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                        >
                          <EditIcon />
                          Редактировать
                        </button>
                        <div className="border-t border-neutral-100 my-1"></div>
                        <button
                          onClick={() => {
                            exportEventMembersCSV(event);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                        >
                          <ExportIcon />
                          CSV
                        </button>
                        <button
                          onClick={() => {
                            exportEventMembersXLSX(event);
                            setOpenMenuId(null);
                          }}
                          disabled={isExporting}
                          className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 disabled:opacity-50"
                        >
                          <ExportIcon />
                          Excel
                        </button>
                        <div className="border-t border-neutral-100 my-1"></div>
                        <button
                          onClick={() => {
                            setDeleteConfirm({ isOpen: true, eventId: event.id });
                            setOpenMenuId(null);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <TrashIcon />
                          Удалить
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-1 mb-2">
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-neutral-500">
                    <UsersIcon />
                    <span>
                      {event.members?.length || 0} / {event.max_members || "∞"}
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 line-clamp-2 mb-2">
                  {event.short_description || event.description}
                </p>
                <div className="text-xs text-neutral-400">
                  {formatDate(event.start_date)} — {formatDate(event.end_date)}
                  {event.location && ` | ${event.location}`}
                </div>
              </div>

              {/* Меню действий - десктоп */}
              <div className="hidden sm:block relative" ref={openMenuId === event.id ? menuRef : null}>
                <button
                  onClick={() => setOpenMenuId(openMenuId === event.id ? null : event.id)}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <DotsIcon />
                </button>

                {openMenuId === event.id && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-neutral-200 py-1 z-10 animate-scale-in">
                    <button
                      onClick={() => {
                        setPreviewEvent(event);
                        setOpenMenuId(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                    >
                      <EyeIcon />
                      Просмотр
                    </button>
                    <button
                      onClick={() => handleEdit(event)}
                      className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                    >
                      <EditIcon />
                      Редактировать
                    </button>
                    <div className="border-t border-neutral-100 my-1"></div>
                    <button
                      onClick={() => {
                        exportEventMembersCSV(event);
                        setOpenMenuId(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                    >
                      <ExportIcon />
                      Экспорт в CSV
                    </button>
                    <button
                      onClick={() => {
                        exportEventMembersXLSX(event);
                        setOpenMenuId(null);
                      }}
                      disabled={isExporting}
                      className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 disabled:opacity-50"
                    >
                      <ExportIcon />
                      Экспорт в Excel
                    </button>
                    <div className="border-t border-neutral-100 my-1"></div>
                    <button
                      onClick={() => {
                        setDeleteConfirm({ isOpen: true, eventId: event.id });
                        setOpenMenuId(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <TrashIcon />
                      Удалить
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          </div>
        )}
      </div>

      {/* Кнопка добавления - закреплена слева внизу */}
      <div className="fixed bottom-8 left-8 lg:left-[296px] z-30">
        <button
          onClick={handleCreate}
          className="px-10 py-4 bg-red-500 text-white text-base font-semibold rounded-2xl hover:bg-red-600 hover:shadow-2xl transition-all duration-200 shadow-xl hover:scale-105"
        >
          Добавить событие
        </button>
      </div>

      {/* Модальное окно создания/редактирования */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleEventSaved}
        event={editingEvent}
      />

      {/* Модальное окно подтверждения удаления */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, eventId: null })}
        onConfirm={handleDelete}
        title="Удаление события"
        message="Вы уверены, что хотите удалить это событие? Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
        isLoading={isDeleting}
        variant="danger"
      />

      {/* Модальное окно просмотра события от лица пользователя */}
      {previewEvent && (
        <EventPreviewModal
          event={previewEvent}
          onClose={() => setPreviewEvent(null)}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}

// Модальное окно просмотра события от лица пользователя
function EventPreviewModal({ event, onClose, formatDate }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const imageUrl = event.image_url ? getImageUrl(event.image_url) : null;
  const participantsCount = event.members?.length || 0;
  const maxMembers = event.max_members;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl transform animate-scale-in overflow-hidden flex flex-col"
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">Просмотр события</h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Контент */}
        <div className="flex-1 overflow-y-auto">
          {/* Изображение */}
          <div className="w-full h-48 sm:h-64 bg-neutral-100">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={event.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                  <path d="M21 15l-5-5L5 21" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </div>

          <div className="p-6">
            {/* Бейджи */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1.5 text-sm font-medium bg-red-500 text-white rounded-full">
                Активное
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-neutral-100 text-neutral-900 rounded-full">
                <UsersIcon />
                {maxMembers && maxMembers > 0 
                  ? `${participantsCount} / ${maxMembers}` 
                  : participantsCount}
              </span>
              {event.type && (
                <span className="px-3 py-1.5 text-sm font-medium bg-neutral-100 text-neutral-900 rounded-full">
                  {event.type}
                </span>
              )}
            </div>

            {/* Название */}
            <h3 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-2">
              {event.name}
            </h3>

            {/* Дата и место */}
            <p className="text-sm text-neutral-500 mb-6">
              {formatDate(event.start_date)} — {formatDate(event.end_date)}
              {event.location && ` | ${event.location}`}
            </p>

            {/* Кнопка участия (превью) */}
            <div className="mb-6">
              <button
                disabled
                className="w-full py-3.5 text-base font-medium text-white bg-red-500 rounded-2xl cursor-default"
              >
                Подтвердить участие
              </button>
              <p className="text-center text-xs text-neutral-400 mt-2">
                Вы не участвуете
              </p>
            </div>

            {/* О событии */}
            <div className="mb-6">
              <h4 className="text-base font-semibold text-neutral-900 mb-2">О событии</h4>
              <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">
                {event.description || event.short_description || "Описание отсутствует"}
              </p>
            </div>

            {/* Оплата */}
            <div>
              <h4 className="text-base font-semibold text-neutral-900 mb-2">Оплата</h4>
              <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">
                {event.pay_data || "Бесплатно"}
              </p>
            </div>
          </div>
        </div>

        {/* Футер */}
        <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50">
          <button
            onClick={onClose}
            className="w-full py-3 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
