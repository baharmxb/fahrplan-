import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LESSONS, getLesson, grammarPages, sectionPages } from "@/data/curriculum";
import type { LessonContent } from "./content";
import { addDays, diffDays, longDate, weekStart } from "./dates";
import { ALL_TASKS, PLAN, PLAN_START, TOTAL_DAYS, getDay } from "./plan";
import {
  currentDayNumber,
  emptyProgress,
  isDayComplete,
  isDone,
  lessonState,
  mergeProgress,
  overdueTasks,
  type Progress,
} from "./progress";

const withDone = (ids: string[], start = "2026-11-01"): Progress => ({
  ...emptyProgress(start),
  entries: Object.fromEntries(ids.map((id) => [id, { done: true, at: 1 }])),
});

describe("plan", () => {
  it("runs one lesson a day for three rounds, then ten exam days ending on 30 Azar", () => {
    expect(TOTAL_DAYS).toBe(49);
    expect(longDate(PLAN_START)).toBe("۱۲ آبان ۱۴۰۵");
    expect(longDate(addDays(PLAN_START, TOTAL_DAYS - 1))).toBe("۳۰ آذر ۱۴۰۵");
    expect(getDay(40).round).toBe(4);
    expect(PLAN.slice(0, 12).map((d) => d.lesson)).toEqual(LESSONS.map((l) => l.n));
    expect(getDay(13).lesson).toBeNull();
    expect(getDay(14).lesson).toBe(1);
    expect(getDay(14).round).toBe(2);
  });

  it("splits Kursbuch by the lesson's own sections, so lesson 5 gets three activities", () => {
    const kursbuch = getDay(5).tasks.filter((t) => t.book === "kursbuch");
    expect(kursbuch.map((t) => t.section)).toEqual(["A", "B", "C"]);
    for (const lesson of LESSONS) {
      const sections = getDay(lesson.n).tasks.filter((t) => t.book === "kursbuch");
      expect(sections).toHaveLength(lesson.sections.length);
    }
  });

  it("gives every lesson day Kursbuch, Arbeitsbuch, Grammatik and Deutsch Üben", () => {
    for (const day of PLAN.filter((d) => d.lesson)) {
      const books = new Set(day.tasks.map((t) => t.book));
      expect(books).toEqual(
        new Set(
          day.tasks.some((t) => t.book === "review")
            ? ["kursbuch", "arbeitsbuch", "grammatik", "deutsch-ueben", "review"]
            : ["kursbuch", "arbeitsbuch", "grammatik", "deutsch-ueben"],
        ),
      );
    }
  });

  it("adds review only on the day after every third lesson", () => {
    const reviewDays = PLAN.filter((d) => d.round === 1 && d.tasks.some((t) => t.book === "review"));
    expect(PLAN.filter((d) => d.tasks.some((t) => t.book === "review")).length).toBe(12);
    expect(reviewDays.map((d) => d.day)).toEqual([4, 7, 10, 13]);
    expect(getDay(4).tasks.find((t) => t.book === "review")?.reviewOf).toEqual([1, 2, 3]);
    expect(getDay(13).tasks[0].reviewOf).toEqual([10, 11, 12]);
  });

  it("keeps Kursbuch, Arbeitsbuch and Grammatik on every exam day too", () => {
    for (const day of PLAN.filter((d) => d.round === 4)) {
      const books = new Set(day.tasks.map((t) => t.book));
      for (const book of ["osd", "kursbuch", "arbeitsbuch", "grammatik", "deutsch-ueben"] as const) {
        expect(books.has(book)).toBe(true);
      }
    }
  });

  it("uses the printed book pages: two per section, then Grammatik Xpress and Xtra Lesen", () => {
    const lesson5 = getLesson(5);
    expect(sectionPages(lesson5, 0)).toEqual([54, 55]);
    expect(sectionPages(lesson5, 2)).toEqual([58, 59]);
    expect(grammarPages(lesson5)).toEqual([60, 61]);
    for (const lesson of LESSONS) {
      const last = sectionPages(lesson, lesson.sections.length - 1);
      expect(last[1] + 1).toBe(grammarPages(lesson)[0]);
      expect(grammarPages(lesson)[1] + 1).toBe(lesson.endPage);
    }
  });

  it("gives every task a unique id", () => {
    expect(new Set(ALL_TASKS.map((t) => t.id)).size).toBe(ALL_TASKS.length);
  });
});

describe("progress", () => {
  it("keeps sections independent and marks a lesson partial until all are done", () => {
    const ids = getDay(5).tasks.map((t) => t.id);
    const partial = withDone([ids[0]]);
    expect(isDone(partial, ids[0])).toBe(true);
    expect(isDone(partial, ids[1])).toBe(false);
    expect(lessonState(partial, 5, 1)).toBe("partial");
    expect(lessonState(withDone(ids), 5, 1)).toBe("done");
    expect(isDayComplete(withDone(ids), getDay(5))).toBe(true);
  });

  it("carries only unfinished tasks from earlier days", () => {
    const start = "2026-11-01";
    const day1 = getDay(1).tasks;
    const p = withDone([day1[0].id], start);
    const today = addDays(start, 2);
    expect(currentDayNumber(p, today)).toBe(3);
    const overdue = overdueTasks(p, today);
    expect(overdue.map((t) => t.id)).not.toContain(day1[0].id);
    expect(overdue).toHaveLength(day1.length + getDay(2).tasks.length - 1);
  });

  it("does not report overdue tasks before the plan starts", () => {
    expect(overdueTasks(emptyProgress("2026-11-10"), "2026-11-01")).toEqual([]);
  });

  it("merges per task with the newest change winning, including unticks", () => {
    const a: Progress = {
      ...emptyProgress("2026-11-01"),
      entries: { x: { done: true, at: 5 }, y: { done: true, at: 1 } },
    };
    const b: Progress = {
      ...emptyProgress("2026-11-05"),
      startDateAt: 9,
      entries: { x: { done: false, at: 2 }, y: { done: false, at: 7 }, z: { done: true, at: 3 } },
    };
    const merged = mergeProgress(a, b);
    expect(merged.entries).toEqual({
      x: { done: true, at: 5 },
      y: { done: false, at: 7 },
      z: { done: true, at: 3 },
    });
    expect(merged.startDate).toBe("2026-11-05");
  });
});

describe("dates", () => {
  it("formats Shamsi dates and day arithmetic", () => {
    expect(longDate("2026-11-01")).toBe("۱۰ آبان ۱۴۰۵");
    expect(addDays("2026-03-20", 2)).toBe("2026-03-22");
    expect(diffDays("2026-03-30", "2026-03-20")).toBe(10);
  });

  it("starts the week on Saturday", () => {
    expect(weekStart("2026-11-01")).toBe("2026-10-31"); // یکشنبه
    expect(weekStart("2026-10-31")).toBe("2026-10-31"); // شنبه
    expect(weekStart("2026-11-06")).toBe("2026-10-31"); // جمعه
  });
});

describe("content files", () => {
  const dir = path.join(process.cwd(), "public", "content");
  const files = readdirSync(dir).sort();

  it("has one well-formed file per lesson", () => {
    expect(files).toHaveLength(12);
    files.forEach((file, i) => {
      const data = JSON.parse(readFileSync(path.join(dir, file), "utf8")) as LessonContent;
      const lesson = LESSONS[i];
      expect(data.lesson).toBe(lesson.n);
      // هر نکته‌ی گرامر فهرست کتاب باید توضیح داشته باشد
      expect(data.grammar.map((g) => g.title)).toEqual(lesson.grammar);
      const keys = new Set(lesson.sections.map((s) => s.key));
      expect(new Set(Object.keys(data.guide.sections))).toEqual(keys);
      expect(data.guide.phrases.length).toBeGreaterThanOrEqual(6);
      expect(data.sentences.every((s) => keys.has(s.section))).toBe(true);
      expect(new Set(data.words.map((w) => w.de)).size).toBe(data.words.length);
      for (const key of keys) {
        expect(data.sentences.filter((s) => s.section === key).length).toBeGreaterThanOrEqual(3);
      }
      // هر لغت باید زیر یکی از موضوع‌های فهرست بیاید و هیچ موضوعی خالی نماند
      expect(data.words.every((w) => lesson.vocab.includes(w.topic))).toBe(true);
      for (const topic of lesson.vocab) {
        expect(data.words.filter((w) => w.topic === topic).length).toBeGreaterThanOrEqual(4);
      }
    });
  });
});
