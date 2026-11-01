import type { SectionKey } from "@/data/curriculum";

export interface Line {
  de: string;
  fa: string;
}

export interface Sentence extends Line {
  section: SectionKey;
}

export interface Word {
  de: string;
  art: "der" | "die" | "das" | null;
  pl?: string;
  fa: string;
  topic: string; // یکی از موضوع‌های Wortschatz در فهرست کتاب
}

export interface GrammarNote {
  title: string;
  fa: string;
  examples: Line[];
}

export interface DialogLine extends Line {
  who: string;
}

// راهنمای فارسی از روی خوانش کتاب؛ متن کامل در خود کتاب است
export interface LessonGuide {
  osd: string;
  starten: string;
  sections: Partial<Record<SectionKey, string>>;
  xtra: string;
  phrases: Line[];
}

export interface LessonContent {
  lesson: number;
  guide: LessonGuide;
  // "app" یعنی متن تمرینی نوشته‌شده برای اپ؛ وقتی متن کتاب وارد شد "book" می‌شود
  source: "app" | "book";
  audio: string | null;
  sentences: Sentence[];
  words: Word[];
  grammar: GrammarNote[];
  proverbs: Line[];
  dialog: { title: string; lines: DialogLine[] };
}

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// این فایل فقط روی دستگاه خود کاربر است و در گیت و انتشار نمی‌آید
export const BOOK_PDF = `${BASE_PATH}/book/kursbuch.pdf`;

export const contentPath = (lesson: number) => `content/lektion-${String(lesson).padStart(2, "0")}.json`;

export async function loadLesson(lesson: number): Promise<LessonContent> {
  const res = await fetch(`${BASE_PATH}/${contentPath(lesson)}`);
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}
