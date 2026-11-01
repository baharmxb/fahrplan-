// تاریخ‌ها را به‌صورت رشته‌ی YYYY-MM-DD نگه می‌داریم تا منطقه‌ی زمانی در محاسبه‌ی روزها خطا نسازد
const toDate = (iso: string) => new Date(`${iso}T12:00:00Z`);
const DAY_MS = 86_400_000;

const shamsi = (options: Intl.DateTimeFormatOptions, numbering = "arabext") =>
  new Intl.DateTimeFormat(`fa-IR-u-ca-persian-nu-${numbering}`, { timeZone: "UTC", ...options });

const part = (iso: string, type: Intl.DateTimeFormatPartTypes, options: Intl.DateTimeFormatOptions) =>
  shamsi(options)
    .formatToParts(toDate(iso))
    .find((p) => p.type === type)?.value ?? "";

export const fa = (n: number) => n.toLocaleString("fa-IR");
export const faPercent = (ratio: number) => `${fa(Math.round(ratio * 100))}٪`;

export function todayIso(now = new Date()) {
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${m}-${d}`;
}

export const addDays = (iso: string, days: number) =>
  new Date(toDate(iso).getTime() + days * DAY_MS).toISOString().slice(0, 10);

export const diffDays = (later: string, earlier: string) =>
  Math.round((toDate(later).getTime() - toDate(earlier).getTime()) / DAY_MS);

export const weekday = (iso: string) => part(iso, "weekday", { weekday: "long" });
export const shortDate = (iso: string) =>
  `${part(iso, "day", { day: "numeric" })} ${part(iso, "month", { day: "numeric", month: "long" })}`;
export const longDate = (iso: string) =>
  `${shortDate(iso)} ${part(iso, "year", { year: "numeric" })}`;
export const monthName = (iso: string) => {
  const year = part(iso, "year", { year: "numeric" });
  return `${part(iso, "month", { day: "numeric", month: "long" })} ${year}`;
};

// کلید ماه شمسی، برای گروه‌بندی گزارش ماهانه
export const monthKey = (iso: string) => {
  const parts = shamsi({ year: "numeric", month: "numeric" }, "latn").formatToParts(toDate(iso));
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  return `${year}-${month}`;
};

// هفته‌ی ایرانی از شنبه شروع می‌شود
export const weekStart = (iso: string) => addDays(iso, -((toDate(iso).getUTCDay() + 1) % 7));

export const formatMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${fa(rest)} دقیقه`;
  return rest ? `${fa(hours)} ساعت و ${fa(rest)} دقیقه` : `${fa(hours)} ساعت`;
};
