/**
 * Утилиты для экспорта данных пользователей
 */

import { adminApi } from "../features/admin/api";

/**
 * Получить полное имя пользователя
 */
const getFullName = (user) => {
  const parts = [user.surname, user.name, user.father_name].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : user.email || "Без имени";
};

/**
 * Получить название роли
 */
const getRoleLabel = (role) => {
  const roles = {
    admin: "Администратор",
    user: "Пользователь",
    moderator: "Модератор",
  };
  return roles[role] || role || "Не указана";
};

/**
 * Получить название статуса
 */
const getStatusLabel = (status) => {
  const statuses = {
    active: "Активный",
    inactive: "Неактивный",
    blocked: "Заблокирован",
    deleted: "Удалён",
  };
  return statuses[status] || status || "Не указан";
};

/**
 * Форматировать дату
 */
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Экспорт пользователей в CSV
 */
export async function exportUsersToCSV() {
  try {
    const users = await adminApi.getUsers();
    
    if (!users || users.length === 0) {
      throw new Error("Нет данных для экспорта");
    }

    // Заголовки
    const headers = ["№", "ФИО", "Email", "Роль", "Статус", "Дата регистрации"];
    
    // Данные
    const rows = users.map((user, index) => [
      index + 1,
      getFullName(user),
      user.email || "",
      getRoleLabel(user.role),
      getStatusLabel(user.status),
      formatDate(user.created_at),
    ]);

    // Формируем CSV с BOM для корректного отображения кириллицы
    const BOM = "\uFEFF";
    const csvContent = BOM + [
      headers.join(";"),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
    ].join("\n");

    // Скачиваем файл
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Пользователи_Слёт_${formatDate(new Date())}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, count: users.length };
  } catch (error) {
    console.error("Ошибка экспорта CSV:", error);
    throw error;
  }
}

/**
 * Экспорт пользователей в XLSX
 */
export async function exportUsersToXLSX() {
  try {
    const users = await adminApi.getUsers();
    
    if (!users || users.length === 0) {
      throw new Error("Нет данных для экспорта");
    }

    // Заголовки
    const headers = ["№", "ФИО", "Email", "Роль", "Статус", "Дата регистрации"];
    
    // Данные
    const rows = users.map((user, index) => [
      index + 1,
      getFullName(user),
      user.email || "",
      getRoleLabel(user.role),
      getStatusLabel(user.status),
      formatDate(user.created_at),
    ]);

    // Создаём XML для Excel (простой формат XLSX-совместимый)
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#EE2C34" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    </Style>
    <Style ss:ID="Data">
      <Alignment ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E5E5"/>
      </Borders>
    </Style>
    <Style ss:ID="Number">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E5E5"/>
      </Borders>
    </Style>
  </Styles>
  <Worksheet ss:Name="Пользователи">
    <Table>
      <Column ss:Width="40"/>
      <Column ss:Width="200"/>
      <Column ss:Width="200"/>
      <Column ss:Width="120"/>
      <Column ss:Width="100"/>
      <Column ss:Width="120"/>
      <Row ss:Height="30">
        ${headers.map(h => `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`).join("")}
      </Row>
      ${rows.map(row => `
      <Row ss:Height="25">
        ${row.map((cell, i) => `<Cell ss:StyleID="${i === 0 ? 'Number' : 'Data'}"><Data ss:Type="${typeof cell === 'number' ? 'Number' : 'String'}">${escapeXml(String(cell))}</Data></Cell>`).join("")}
      </Row>`).join("")}
    </Table>
  </Worksheet>
</Workbook>`;

    // Скачиваем файл
    const blob = new Blob([xmlContent], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Пользователи_Слёт_${formatDate(new Date())}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, count: users.length };
  } catch (error) {
    console.error("Ошибка экспорта XLSX:", error);
    throw error;
  }
}

/**
 * Экранирование XML символов
 */
function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
