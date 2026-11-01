"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { addDays, longDate } from "@/lib/dates";
import type { SyncError } from "@/lib/github";
import { useProgress } from "@/lib/store";

const ERROR_TEXT: Record<SyncError, string> = {
  offline: "به گیت‌هاب وصل نشد. اینترنت را بررسی کن؛ تیک‌ها در همین دستگاه ذخیره می‌مانند.",
  auth: "گیت‌هاب توکن را نپذیرفت. توکن و دسترسی Contents آن را بررسی کن.",
  "not-found": "این مخزن پیدا نشد. نام را به شکل owner/repo بنویس.",
  conflict: "هم‌زمان نسخه‌ی دیگری ذخیره شد. دکمه‌ی ذخیره را دوباره بزن.",
  unknown: "گیت‌هاب ذخیره را انجام نداد. کمی بعد دوباره امتحان کن.",
};

export function StartDatePicker() {
  const { progress, today, setStartDate } = useProgress();
  // تاریخ را از فهرست شمسی انتخاب می‌کنیم چون تقویم بومی مرورگر میلادی است
  const options = useMemo(() => {
    const dates = Array.from({ length: 91 }, (_, i) => addDays(today, i - 60));
    return dates.includes(progress.startDate) ? dates : [progress.startDate, ...dates];
  }, [today, progress.startDate]);

  return (
    <label className="field">
      <span>تاریخ شروع برنامه</span>
      <select value={progress.startDate} onChange={(e) => setStartDate(e.target.value)}>
        {options.map((date) => (
          <option key={date} value={date}>
            {longDate(date)}
          </option>
        ))}
      </select>
    </label>
  );
}

type Theme = "system" | "light" | "dark";
const THEME_KEY = "fahrplan.theme";

export function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    try {
      setTheme((localStorage.getItem(THEME_KEY) as Theme | null) ?? "system");
    } catch {
      // بدون حافظه‌ی مرورگر، تم سیستم می‌ماند
    }
  }, []);

  const choose = (next: Theme) => {
    setTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // انتخاب فقط برای همین نشست اعمال می‌شود
    }
    if (next === "system") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.dataset.theme = next;
  };

  const names: Record<Theme, string> = { system: "مثل سیستم", light: "روشن", dark: "تاریک" };
  return (
    <div className="field">
      <span id="theme-label">ظاهر</span>
      <div className="segmented" role="group" aria-labelledby="theme-label">
        {(Object.keys(names) as Theme[]).map((key) => (
          <button key={key} type="button" aria-pressed={theme === key} onClick={() => choose(key)}>
            {names[key]}
          </button>
        ))}
      </div>
    </div>
  );
}

export function GithubPanel() {
  const { repo, status, syncError, lastSync, connect, disconnect, syncNow } = useProgress();
  const [repoInput, setRepoInput] = useState("baharmxb/fahrplan-data");
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const failure = await connect({ repo: repoInput.trim(), token: token.trim() });
    setBusy(false);
    if (!failure) setToken("");
  };

  if (repo) {
    return (
      <div className="github">
        <p>
          پیشرفت در مخزن <bdi dir="ltr">{repo}</bdi> ذخیره می‌شود.
          {lastSync && ` آخرین ذخیره ساعت ${new Date(lastSync).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}.`}
        </p>
        {syncError && (
          <p className="error" role="alert">
            {ERROR_TEXT[syncError]}
          </p>
        )}
        <div className="github__actions">
          <button type="button" className="button" onClick={syncNow} disabled={status === "syncing"}>
            ذخیره در گیت‌هاب
          </button>
          <button type="button" className="link-button" onClick={disconnect}>
            حذف توکن از این دستگاه
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="github" onSubmit={submit}>
      <p>
        پیشرفت فعلاً فقط در همین گوشی است. با اتصال به یک مخزن خصوصی، تیک‌ها و جای مطالعه روی گیت‌هاب هم ذخیره
        می‌شوند و بعد از نصب دوباره برمی‌گردند. توکن فقط در حافظه‌ی همین گوشی می‌ماند.
      </p>
      <label className="field">
        <span>مخزن</span>
        <input
          dir="ltr"
          value={repoInput}
          onChange={(e) => setRepoInput(e.target.value)}
          placeholder="owner/repo"
          pattern="[\w.\-]+/[\w.\-]+"
          required
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      <label className="field">
        <span>توکن گیت‌هاب</span>
        <input
          dir="ltr"
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
          autoComplete="off"
        />
      </label>
      {syncError && (
        <p className="error" role="alert">
          {ERROR_TEXT[syncError]}
        </p>
      )}
      <button type="submit" className="button" disabled={busy}>
        {busy ? "در حال اتصال" : "اتصال به گیت‌هاب"}
      </button>
    </form>
  );
}
