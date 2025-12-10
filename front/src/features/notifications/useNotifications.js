/**
 * React Query хуки для работы с уведомлениями
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "./api";

// Ключи для кэширования
export const notificationKeys = {
  all: ["notifications"],
};

/**
 * Хук для получения всех уведомлений
 */
export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.all,
    queryFn: notificationsApi.getAll,
    refetchInterval: 30000, // Обновлять каждые 30 секунд
    staleTime: 10000, // Считать данные свежими 10 секунд
  });
}

/**
 * Хук для отметки уведомления как прочитанного
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      // Инвалидируем кэш уведомлений
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * Хук для отметки всех уведомлений как прочитанных
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      // Инвалидируем кэш уведомлений
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
