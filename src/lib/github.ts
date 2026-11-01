import { mergeProgress, sameProgress, type Progress } from "./progress";

export interface GithubConfig {
  token: string;
  repo: string; // owner/name
}

export type SyncError = "offline" | "auth" | "not-found" | "conflict" | "unknown";

export class GithubError extends Error {
  constructor(public kind: SyncError) {
    super(kind);
  }
}

const FILE_PATH = "fahrplan-progress.json";

const toBase64 = (text: string) => {
  const bytes = new TextEncoder().encode(text);
  return btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(""));
};

const fromBase64 = (encoded: string) => {
  const bytes = Uint8Array.from(atob(encoded.replace(/\s/g, "")), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

async function request(cfg: GithubConfig, init?: RequestInit) {
  let res: Response;
  try {
    res = await fetch(`https://api.github.com/repos/${cfg.repo}/contents/${FILE_PATH}`, {
      ...init,
      cache: "no-store",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${cfg.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
  } catch {
    throw new GithubError("offline");
  }
  return res;
}

const errorFor = (status: number) => {
  if (status === 401 || status === 403) return new GithubError("auth");
  if (status === 404) return new GithubError("not-found");
  if (status === 409 || status === 422) return new GithubError("conflict");
  return new GithubError("unknown");
};

export async function pull(cfg: GithubConfig): Promise<{ data: Progress | null; sha?: string }> {
  const res = await request(cfg);
  // نبودن فایل با نبودن مخزن فرق دارد؛ بار اول فایل هنوز ساخته نشده
  if (res.status === 404) {
    const repo = await fetch(`https://api.github.com/repos/${cfg.repo}`, {
      headers: { Authorization: `Bearer ${cfg.token}` },
    }).catch(() => null);
    if (!repo) throw new GithubError("offline");
    if (!repo.ok) throw errorFor(repo.status);
    return { data: null };
  }
  if (!res.ok) throw errorFor(res.status);
  const body = (await res.json()) as { content: string; sha: string };
  return { data: JSON.parse(fromBase64(body.content)) as Progress, sha: body.sha };
}

async function put(cfg: GithubConfig, data: Progress, sha?: string) {
  const res = await request(cfg, {
    method: "PUT",
    body: JSON.stringify({
      message: "Update study progress",
      content: toBase64(JSON.stringify(data, null, 2)),
      sha,
    }),
  });
  if (!res.ok) throw errorFor(res.status);
}

// نسخه‌ی گیت‌هاب و نسخه‌ی این دستگاه را ادغام و ذخیره می‌کند و نتیجه را برمی‌گرداند
export async function sync(cfg: GithubConfig, local: Progress): Promise<Progress> {
  for (let attempt = 0; ; attempt++) {
    const remote = await pull(cfg);
    // زمان‌دار کردن تاریخ شروع باعث می‌شود دستگاه تازه با پیش‌فرض خودش آن را عوض نکند
    const merged = remote.data
      ? mergeProgress(local, remote.data)
      : { ...local, startDateAt: local.startDateAt || Date.now() };
    if (remote.data && sameProgress(merged, remote.data)) return merged;
    try {
      await put(cfg, merged, remote.sha);
      return merged;
    } catch (error) {
      const retry = error instanceof GithubError && error.kind === "conflict" && attempt < 1;
      if (!retry) throw error;
    }
  }
}
