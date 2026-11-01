"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { todayIso } from "./dates";
import { GithubError, sync, type GithubConfig, type SyncError } from "./github";
import { PLAN_START } from "./plan";
import { emptyProgress, mergeProgress, type Progress, type ReadingSpot } from "./progress";

const PROGRESS_KEY = "fahrplan.progress.v1";
const GITHUB_KEY = "fahrplan.github.v1";
const SYNC_DELAY_MS = 1500;
const REFRESH_AFTER_MS = 60_000;

export type SyncStatus = "local" | "syncing" | "synced" | "error";

interface Store {
  ready: boolean;
  progress: Progress;
  today: string;
  repo: string | null;
  status: SyncStatus;
  syncError: SyncError | null;
  lastSync: number | null;
  toggle: (taskId: string) => void;
  setStartDate: (iso: string) => void;
  saveSpot: (spot: ReadingSpot) => void;
  connect: (cfg: GithubConfig) => Promise<SyncError | null>;
  disconnect: () => void;
  syncNow: () => void;
}

const StoreContext = createContext<Store | null>(null);

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // حافظه‌ی مرورگر پر یا مسدود است؛ اپ با داده‌ی همین نشست ادامه می‌دهد
  }
}

const errorKind = (error: unknown): SyncError => (error instanceof GithubError ? error.kind : "unknown");

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [today, setToday] = useState("");
  const [config, setConfig] = useState<GithubConfig | null>(null);
  const [status, setStatus] = useState<SyncStatus>("local");
  const [syncError, setSyncError] = useState<SyncError | null>(null);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const lastSyncRef = useRef(0);

  const latest = useRef<Progress | null>(null);
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const commit = useCallback((next: Progress) => {
    latest.current = next;
    setProgress(next);
    writeJson(PROGRESS_KEY, next);
  }, []);

  const runSync = useCallback(
    async (cfg: GithubConfig) => {
      if (!latest.current) return null;
      setStatus("syncing");
      dirty.current = false;
      try {
        const merged = await sync(cfg, latest.current);
        // ممکن است هنگام ارسال، فعالیت دیگری تیک خورده باشد
        commit(mergeProgress(latest.current, merged));
        setStatus("synced");
        setSyncError(null);
        lastSyncRef.current = Date.now();
        setLastSync(lastSyncRef.current);
        return null;
      } catch (error) {
        dirty.current = true;
        const kind = errorKind(error);
        setStatus("error");
        setSyncError(kind);
        return kind;
      }
    },
    [commit],
  );

  useEffect(() => {
    const now = todayIso();
    setToday(now);
    const stored = readJson<Progress>(PROGRESS_KEY);
    // تاریخ شروعی که کاربر انتخاب نکرده باشد همان آغاز رسمی برنامه است
    commit(stored?.startDateAt ? stored : { ...(stored ?? emptyProgress(PLAN_START)), startDate: PLAN_START });
    const cfg = readJson<GithubConfig>(GITHUB_KEY);
    if (cfg) {
      setConfig(cfg);
      void runSync(cfg);
    }
  }, [commit, runSync]);

  // اپ نصب‌شده ممکن است روزها باز بماند، پس هنگام برگشت به آن تاریخ را تازه می‌کنیم
  useEffect(() => {
    const refresh = () => setToday(todayIso());
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, []);

  useEffect(() => {
    if (!config) return;
    const retry = () => {
      if (dirty.current) void runSync(config);
    };
    // با برگشت به اپ نسخه‌ی سرور خوانده و هنگام خروج، تغییرهای مانده فرستاده می‌شود
    const onVisibility = () => {
      const hidden = document.visibilityState === "hidden";
      if (hidden ? dirty.current : Date.now() - lastSyncRef.current > REFRESH_AFTER_MS) {
        clearTimeout(timer.current);
        void runSync(config);
      }
    };
    window.addEventListener("online", retry);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("online", retry);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [config, runSync]);

  const update = useCallback(
    (change: (p: Progress) => Progress) => {
      if (!latest.current) return;
      commit(change(latest.current));
      dirty.current = true;
      if (!config) return;
      clearTimeout(timer.current);
      timer.current = setTimeout(() => void runSync(config), SYNC_DELAY_MS);
    },
    [commit, config, runSync],
  );

  const toggle = useCallback(
    (taskId: string) =>
      update((p) => ({
        ...p,
        entries: { ...p.entries, [taskId]: { done: !p.entries[taskId]?.done, at: Date.now() } },
      })),
    [update],
  );

  const setStartDate = useCallback(
    (startDate: string) => update((p) => ({ ...p, startDate, startDateAt: Date.now() })),
    [update],
  );

  const saveSpot = useCallback((spot: ReadingSpot) => update((p) => ({ ...p, lastRead: spot })), [update]);

  const connect = useCallback(
    async (cfg: GithubConfig) => {
      const failure = await runSync(cfg);
      if (!failure) {
        writeJson(GITHUB_KEY, cfg);
        setConfig(cfg);
      }
      return failure;
    },
    [runSync],
  );

  const disconnect = useCallback(() => {
    clearTimeout(timer.current);
    try {
      localStorage.removeItem(GITHUB_KEY);
    } catch {
      // چیزی برای پاک‌کردن در دسترس نیست
    }
    setConfig(null);
    setStatus("local");
    setSyncError(null);
  }, []);

  const syncNow = useCallback(() => {
    if (config) void runSync(config);
  }, [config, runSync]);

  const value = useMemo<Store>(
    () => ({
      ready: progress !== null && today !== "",
      progress: progress ?? emptyProgress(PLAN_START),
      today,
      repo: config?.repo ?? null,
      status,
      syncError,
      lastSync,
      toggle,
      setStartDate,
      saveSpot,
      connect,
      disconnect,
      syncNow,
    }),
    [progress, today, config, status, syncError, lastSync, toggle, setStartDate, saveSpot, connect, disconnect, syncNow],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useProgress() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useProgress must be used inside ProgressProvider");
  return store;
}
