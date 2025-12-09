import React from "react";
import { useAuthStore } from "../../features/auth/AuthStore";

export const ProfilePage = () => {
    const user = useAuthStore((state) => state.user);

    // Заглушки, если данных нет
    const fullName = [user?.name, user?.surname].filter(Boolean).join(" ") || "Пользователь";
    const email = user?.email || "email@example.com";

    // В будущем аватар может приходить с бэкенда
    const avatarUrl = null;

    const menuGroups = [
        {
            title: "Аккаунт",
            items: [
                { icon: "user", label: "Личные данные", action: () => console.log("Edit Profile") },
                { icon: "lock", label: "Безопасность", action: () => console.log("Security") },
            ]
        },
        {
            title: "Настройки",
            items: [
                { icon: "bell", label: "Уведомления", action: () => console.log("Notifications") },
            ]
        },
        {
            title: "Поддержка",
            items: [
                { icon: "help", label: "Помощь и поддержка", action: () => console.log("Help") },
            ]
        }
    ];

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-8 animate-fade-in">
            <div className="bg-white rounded-[32px] shadow-sm border border-neutral-100 overflow-hidden">

                {/* Шапка профиля */}
                <div className="flex flex-col md:flex-row items-center gap-6 p-8 border-b border-neutral-100 bg-gradient-to-b from-[#FFF5F5] to-white">
                    <div className="relative group cursor-pointer">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-neutral-200 overflow-hidden border-4 border-white shadow-md">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#EE2C34] text-white text-3xl md:text-4xl font-bold">
                                    {fullName.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        {/* Индикатор редактирования (ховер) */}
                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>

                    <div className="text-center md:text-left space-y-1 flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">{fullName}</h1>
                        <p className="text-neutral-500 text-lg">{email}</p>
                    </div>
                </div>

                {/* Меню настроек */}
                <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8 md:gap-12">
                    {menuGroups.map((group, idx) => (
                        <div key={idx} className="space-y-4">
                            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider pl-2">
                                {group.title}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map((item, itemIdx) => (
                                    <button
                                        key={itemIdx}
                                        onClick={item.action}
                                        className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-neutral-50 transition-colors group text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] text-neutral-600 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                                <MenuIcon name={item.icon} />
                                            </div>
                                            <span className="font-medium text-neutral-900 text-lg">{item.label}</span>
                                        </div>
                                        <svg className="text-neutral-300 group-hover:text-[#EE2C34] transition-colors" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}


                </div>

            </div>
        </div>
    );
};

const MenuIcon = ({ name }) => {
    switch (name) {
        case "user": return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
        );
        case "lock": return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
        );
        case "bell": return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
        );
        case "help": return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
        );
        default: return null;
    }
};

