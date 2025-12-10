/**
 * Страница управления пользователями в админ-панели
 */

import { useState, useEffect, useRef } from "react";
import { adminApi } from "../api";
import { useToast } from "../../../components/ui/Toast";

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

// Иконка сброса пароля
const KeyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M10.5 5.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM8 8a4 4 0 00-4 4v2h8v-2a4 4 0 00-4-4z"
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

// Иконка меню (три точки)
const DotsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-neutral-400">
    <circle cx="10" cy="4" r="1.5" fill="currentColor" />
    <circle cx="10" cy="10" r="1.5" fill="currentColor" />
    <circle cx="10" cy="16" r="1.5" fill="currentColor" />
  </svg>
);

// Иконка закрытия
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Иконка стрелки вниз
const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Компонент модального окна
function Modal({ isOpen, onClose, children, title }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

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

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
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
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl transform animate-scale-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className="text-xl font-semibold text-neutral-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Модальное окно подтверждения удаления
function DeleteConfirmModal({ isOpen, onClose, onConfirm, userName, isLoading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="px-6 pb-6 text-center">
        <p className="text-lg text-neutral-900">
          Вы точно хотите удалить пользователя{" "}
          <span className="text-red-500">{userName}</span>?
        </p>
      </div>
      <div className="flex gap-3 px-6 pb-6">
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 px-4 py-3 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Удаление..." : "Удалить"}
        </button>
        <button
          onClick={onClose}
          disabled={isLoading}
          className="flex-1 px-4 py-3 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          Назад
        </button>
      </div>
    </Modal>
  );
}

// Модальное окно подтверждения сброса пароля
function ResetPasswordConfirmModal({ isOpen, onClose, onConfirm, userName, isLoading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="px-6 pb-6 text-center">
        <p className="text-lg text-neutral-900">
          Вы точно хотите сбросить пароль пользователю{" "}
          <span className="text-red-500">{userName}</span>?
        </p>
      </div>
      <div className="flex gap-3 px-6 pb-6">
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 px-4 py-3 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50"
        >
          Сбросить
        </button>
        <button
          onClick={onClose}
          disabled={isLoading}
          className="flex-1 px-4 py-3 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          Назад
        </button>
      </div>
    </Modal>
  );
}

// Модальное окно ввода нового пароля
function NewPasswordModal({ isOpen, onClose, onConfirm, isLoading }) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.length >= 8) {
      onConfirm(password);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setPassword("");
    }
  }, [isOpen]);

  const isValid = password.length >= 8;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Сброс пароля">
      <form onSubmit={handleSubmit}>
        <div className="px-6 pb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Новый пароль <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль (мин. 8 символов)"
            className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div className="px-6 pb-6">
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className={`w-full px-4 py-3 text-sm font-medium text-white rounded-xl transition-colors ${
              isValid
                ? "bg-red-500 hover:bg-red-600"
                : "bg-red-300 cursor-not-allowed"
            } disabled:opacity-50`}
          >
            {isLoading ? "Сохранение..." : "Подтвердить"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Модальное окно редактирования пользователя (API: name, surname, father_name, role, status)
function EditUserModal({ isOpen, onClose, onSave, user, isLoading }) {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    father_name: "",
    role: "user",
    status: "active",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        name: user.name || "",
        surname: user.surname || "",
        father_name: user.father_name || "",
        role: user.role || "user",
        status: user.status || "active",
      });
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const isValid = formData.name.trim() && formData.surname.trim();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Редактирование">
      <form onSubmit={handleSubmit}>
        <div className="px-6 space-y-4">
          {/* Имя */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Имя <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Введите настоящее имя"
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Фамилия */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Фамилия <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.surname}
              onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
              placeholder="Введите фамилию"
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Отчество */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Отчество
            </label>
            <input
              type="text"
              value={formData.father_name}
              onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
              placeholder="Введите отчество"
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Роль */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Роль пользователя <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="user">Пользователь</option>
                <option value="admin">Администратор</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                <ChevronDownIcon />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className={`w-full px-4 py-3 text-sm font-medium text-white rounded-xl transition-colors ${
              isValid
                ? "bg-red-500 hover:bg-red-600"
                : "bg-red-300 cursor-not-allowed"
            } disabled:opacity-50`}
          >
            {isLoading ? "Сохранение..." : "Подтвердить"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Иконка поиска
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="9" cy="9" r="6" />
    <path d="M13.5 13.5L17 17" strokeLinecap="round" />
  </svg>
);

// Иконка фильтра
const FilterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 5h14M5 10h10M7 15h6" strokeLinecap="round" />
  </svg>
);

export function UsersManagement() {
  const [activeTab, setActiveTab] = useState("active");
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [counts, setCounts] = useState({ active: 0, deleted: 0 });
  const menuRef = useRef(null);
  const toast = useToast();

  // Обработчик смены таба с анимацией
  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setIsTransitioning(true);
    setActiveTab(tab);
    // Небольшая задержка для плавной анимации
    setTimeout(() => setIsTransitioning(false), 150);
  };

  // Фильтры
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });

  // Модальные окна
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
  const [resetConfirmModal, setResetConfirmModal] = useState({ isOpen: false, user: null });
  const [newPasswordModal, setNewPasswordModal] = useState({ isOpen: false, user: null });
  const [editModal, setEditModal] = useState({ isOpen: false, user: null });
  const [isProcessing, setIsProcessing] = useState(false);

  // Загрузка пользователей
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers();
      const fetchedUsers = data || [];
      setAllUsers(fetchedUsers);
      
      // Разделяем на активных и удаленных
      const activeUsers = fetchedUsers.filter((u) => u.status !== "deleted");
      const deletedUsers = fetchedUsers.filter((u) => u.status === "deleted");
      
      setCounts({ active: activeUsers.length, deleted: deletedUsers.length });
    } catch (error) {
      console.error("Ошибка загрузки пользователей:", error);
      toast.error("Ошибка загрузки пользователей");
    } finally {
      setLoading(false);
    }
  };

  // Применение фильтров
  const applyFilters = () => {
    let filtered = allUsers;

    // Фильтр по табу (активные/удаленные)
    if (activeTab === "active") {
      filtered = filtered.filter((u) => u.status !== "deleted");
    } else {
      filtered = filtered.filter((u) => u.status === "deleted");
    }

    // Поиск по ФИО
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase().trim();
      filtered = filtered.filter((u) => {
        const fullName = `${u.surname || ""} ${u.name || ""} ${u.father_name || ""}`.toLowerCase();
        const email = (u.email || "").toLowerCase();
        return fullName.includes(searchLower) || email.includes(searchLower);
      });
    }

    // Фильтр по роли
    if (filters.role) {
      filtered = filtered.filter((u) => u.role === filters.role);
    }

    // Фильтр по статусу (для активных пользователей)
    if (filters.status && activeTab === "active") {
      filtered = filtered.filter((u) => u.status === filters.status);
    }

    // Фильтр по дате регистрации
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter((u) => {
        if (!u.created_at) return false;
        return new Date(u.created_at) >= fromDate;
      });
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((u) => {
        if (!u.created_at) return false;
        return new Date(u.created_at) <= toDate;
      });
    }

    setUsers(filtered);
  };

  // Сброс фильтров
  const resetFilters = () => {
    setFilters({
      search: "",
      role: "",
      status: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [activeTab, filters, allUsers]);

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

  // Получить полное имя пользователя (API использует name, surname, father_name)
  const getFullName = (user) => {
    const parts = [user.surname, user.name, user.father_name].filter(Boolean);
    return parts.join(" ") || user.email || "Без имени";
  };

  // Получить роль на русском
  const getRoleLabel = (role) => {
    const roles = {
      admin: "Администратор",
      user: "Пользователь",
    };
    return roles[role] || "Пользователь";
  };

  // Получить статус на русском
  const getStatusLabel = (status) => {
    const statuses = {
      active: "Активен",
      deleted: "Удален",
      blocked: "Заблокирован",
    };
    return statuses[status] || "Активен";
  };

  // Обработчики действий
  const handleEdit = (user) => {
    setEditModal({ isOpen: true, user });
    setOpenMenuId(null);
  };

  const handleResetPassword = (user) => {
    setResetConfirmModal({ isOpen: true, user });
    setOpenMenuId(null);
  };

  const handleDelete = (user) => {
    setDeleteModal({ isOpen: true, user });
    setOpenMenuId(null);
  };

  // Подтверждение удаления (мягкое удаление - смена статуса на deleted)
  const confirmDelete = async () => {
    if (!deleteModal.user) return;
    setIsProcessing(true);
    try {
      await adminApi.deleteUser(deleteModal.user.id, deleteModal.user);
      toast.success("Пользователь успешно удален");
      setDeleteModal({ isOpen: false, user: null });
      loadUsers();
    } catch (error) {
      console.error("Ошибка удаления:", error);
      toast.error("Ошибка удаления пользователя");
    } finally {
      setIsProcessing(false);
    }
  };

  // Подтверждение сброса пароля - открыть окно ввода нового пароля
  const confirmResetPassword = () => {
    setNewPasswordModal({ isOpen: true, user: resetConfirmModal.user });
    setResetConfirmModal({ isOpen: false, user: null });
  };

  // Сохранение нового пароля
  const saveNewPassword = async (password) => {
    if (!newPasswordModal.user) return;
    setIsProcessing(true);
    try {
      await adminApi.resetUserPassword(newPasswordModal.user.id, password);
      toast.success("Пароль успешно изменен");
      setNewPasswordModal({ isOpen: false, user: null });
    } catch (error) {
      console.error("Ошибка сброса пароля:", error);
      toast.error("Ошибка сброса пароля");
    } finally {
      setIsProcessing(false);
    }
  };

  // Сохранение редактирования
  const saveEdit = async (formData) => {
    if (!editModal.user) return;
    setIsProcessing(true);
    try {
      await adminApi.updateUser(editModal.user.id, formData);
      toast.success("Пользователь успешно обновлен");
      setEditModal({ isOpen: false, user: null });
      loadUsers();
    } catch (error) {
      console.error("Ошибка обновления:", error);
      toast.error("Ошибка обновления пользователя");
    } finally {
      setIsProcessing(false);
    }
  };

  const totalUsers = counts.active + counts.deleted;

  return (
    <div className="animate-fade-in">
      {/* Заголовок */}
      <h1 className="text-2xl font-semibold text-neutral-900 mb-6">
        Пользователи{" "}
        <span className="text-neutral-400">{totalUsers}</span>
      </h1>

      {/* Табы - растянуты на всю ширину */}
      <div className="flex border-b border-neutral-200 mb-6">
        <button
          onClick={() => handleTabChange("active")}
          className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
            activeTab === "active"
              ? "border-red-500 text-neutral-900"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Активные <span className={`ml-1 transition-colors duration-200 ${activeTab === "active" ? "text-red-500" : "text-neutral-400"}`}>{counts.active}</span>
        </button>
        <button
          onClick={() => handleTabChange("deleted")}
          className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
            activeTab === "deleted"
              ? "border-red-500 text-neutral-900"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Удалённые <span className={`ml-1 transition-colors duration-200 ${activeTab === "deleted" ? "text-red-500" : "text-neutral-400"}`}>{counts.deleted}</span>
        </button>
      </div>

      {/* Панель фильтрации */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
        {/* Строка поиска и кнопка фильтров */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Поиск по ФИО */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Поиск по ФИО или email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>
          
          {/* Кнопка показа/скрытия фильтров */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${
              showFilters
                ? "border-red-500 text-red-500 bg-red-50"
                : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            <FilterIcon />
            Фильтры
            {(filters.role || filters.status || filters.dateFrom || filters.dateTo) && (
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
        </div>

        {/* Расширенные фильтры с анимацией */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Роль */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Роль</label>
                <div className="relative">
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white appearance-none cursor-pointer hover:border-neutral-300 transition-colors"
                  >
                    <option value="">Все роли</option>
                    <option value="admin">Администратор</option>
                    <option value="user">Пользователь</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>

              {/* Статус */}
              {activeTab === "active" && (
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Статус</label>
                  <div className="relative">
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white appearance-none cursor-pointer hover:border-neutral-300 transition-colors"
                    >
                      <option value="">Все статусы</option>
                      <option value="active">Активен</option>
                      <option value="blocked">Заблокирован</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                      <ChevronDownIcon />
                    </div>
                  </div>
                </div>
              )}

              {/* Дата регистрации от */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Дата регистрации от</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              {/* Дата регистрации до */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Дата регистрации до</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
            </div>

            {/* Кнопка сброса */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Сбросить фильтры
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Контент с плавными переходами */}
      <div className={`transition-all duration-300 ease-out ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
        {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-neutral-900">Нет пользователей</h2>
          <p className="mt-2 text-neutral-500 text-center">
            {activeTab === "active"
              ? "Активных пользователей пока нет"
              : "Удаленных пользователей нет"}
          </p>
        </div>
      ) : (
        <>
          {/* Мобильный вид - карточки */}
          <div className="md:hidden space-y-3">
            {users.map((user, index) => (
              <div key={user.id} className="bg-white rounded-xl p-4 shadow-sm animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden flex-shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-500 font-medium text-sm">
                          {user.name?.[0] || user.email?.[0] || "?"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-neutral-900 truncate">
                        {getFullName(user)}
                      </div>
                      <div className="text-xs text-neutral-500 truncate">{user.email}</div>
                    </div>
                  </div>
                  <div className="relative" ref={openMenuId === user.id ? menuRef : null}>
                    <button
                      onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                      className="p-1 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      <DotsIcon />
                    </button>
                    {openMenuId === user.id && (
                      <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-neutral-200 py-1 z-50">
                        <button
                          onClick={() => handleEdit(user)}
                          className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                        >
                          <span className="text-red-500"><EditIcon /></span>
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleResetPassword(user)}
                          className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                        >
                          <span className="text-red-500"><KeyIcon /></span>
                          Сброс пароля
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                        >
                          <span className="text-neutral-400"><TrashIcon /></span>
                          Удалить
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 text-xs">
                  <span className="px-2 py-1 bg-neutral-100 rounded-lg text-neutral-600">
                    {getRoleLabel(user.role)}
                  </span>
                  <span className="px-2 py-1 bg-neutral-100 rounded-lg text-neutral-600">
                    {getStatusLabel(user.status)}
                  </span>
                  <span className="px-2 py-1 bg-neutral-100 rounded-lg text-neutral-400">
                    {formatDate(user.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Десктоп вид - таблица */}
          <div className="hidden md:block bg-white rounded-2xl">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 w-12">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">ФИО / Почта</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Роль</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Статус</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Дата регистрации</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                    <td className="px-4 py-4 text-sm text-neutral-500">{index + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden flex-shrink-0">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-500 font-medium text-sm">
                              {user.name?.[0] || user.email?.[0] || "?"}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-neutral-900">
                            {getFullName(user)}
                          </div>
                          <div className="text-xs text-neutral-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-700">
                      {getRoleLabel(user.role)}
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-700">
                      {getStatusLabel(user.status)}
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-700">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative" ref={openMenuId === user.id ? menuRef : null}>
                        <button
                          onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                          <DotsIcon />
                        </button>

                        {openMenuId === user.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-neutral-200 py-1 z-50">
                            <button
                              onClick={() => handleEdit(user)}
                              className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                            >
                              <span className="text-red-500"><EditIcon /></span>
                              Редактировать
                            </button>
                            <button
                              onClick={() => handleResetPassword(user)}
                              className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                            >
                              <span className="text-red-500"><KeyIcon /></span>
                              Сброс пароля
                            </button>
                            <button
                              onClick={() => handleDelete(user)}
                              className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                            >
                              <span className="text-neutral-400"><TrashIcon /></span>
                              Удалить
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
        )}
      </div>

      {/* Модальные окна */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, user: null })}
        onConfirm={confirmDelete}
        userName={deleteModal.user ? getFullName(deleteModal.user) : ""}
        isLoading={isProcessing}
      />

      <ResetPasswordConfirmModal
        isOpen={resetConfirmModal.isOpen}
        onClose={() => setResetConfirmModal({ isOpen: false, user: null })}
        onConfirm={confirmResetPassword}
        userName={resetConfirmModal.user ? getFullName(resetConfirmModal.user) : ""}
        isLoading={isProcessing}
      />

      <NewPasswordModal
        isOpen={newPasswordModal.isOpen}
        onClose={() => setNewPasswordModal({ isOpen: false, user: null })}
        onConfirm={saveNewPassword}
        isLoading={isProcessing}
      />

      <EditUserModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, user: null })}
        onSave={saveEdit}
        user={editModal.user}
        isLoading={isProcessing}
      />
    </div>
  );
}
