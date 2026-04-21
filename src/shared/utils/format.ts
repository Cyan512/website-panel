export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(value);
};

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("es-PE");
};

export const parseUTCDate = (dateString: string): Date => {
  const date = new Date(dateString);
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
};

export const formatUTCDate = (dateString: string, locale = "es-ES"): string => {
  const date = parseUTCDate(dateString);
  return date.toLocaleDateString(locale);
};

export const formatUTCDateLong = (dateString: string, locale = "es-ES"): string => {
  const date = parseUTCDate(dateString);
  return date.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
};

export const formatTime = (date: string | Date) => {
  const d = new Date(date);
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const seconds = d.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};
