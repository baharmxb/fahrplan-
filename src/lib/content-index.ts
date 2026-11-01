import { readFile } from "node:fs/promises";
import path from "node:path";
import { LESSONS } from "@/data/curriculum";
import { contentPath, type LessonContent } from "./content";

export interface ContentCount {
  sentences: number;
  words: number;
  audio: string | null;
}

// فقط هنگام build اجرا می‌شود تا فهرست درس‌ها بدون دانلود همه‌ی فایل‌ها شمارش‌ها را بداند
export async function readContentCounts(): Promise<Record<number, ContentCount>> {
  const entries = await Promise.all(
    LESSONS.map(async ({ n }) => {
      const raw = await readFile(path.join(process.cwd(), "public", contentPath(n)), "utf8");
      const { sentences, words, audio } = JSON.parse(raw) as LessonContent;
      return [n, { sentences: sentences.length, words: words.length, audio }] as const;
    }),
  );
  return Object.fromEntries(entries);
}
