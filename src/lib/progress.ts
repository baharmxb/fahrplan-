import { LESSONS } from "@/data/curriculum";
import { addDays, diffDays, monthKey, monthName, weekStart, shortDate } from "./dates";
import { ALL_TASKS, BOOKS, PLAN, TOTAL_DAYS, type BookId, type PlanDay, type Round, type Task } from "./plan";

export interface Entry {
  done: boolean;
  at: number;
}

export interface Progress {
  version: 1;
  startDate: string;
  startDateAt: number;
  // لغو تیک هم ثبت می‌شود تا هنگام ادغام با نسخه‌ی گیت‌هاب برنگردد
  entries: Record<string, Entry>;
}

export const emptyProgress = (startDate: string): Progress => ({
  version: 1,
  startDate,
  startDateAt: 0,
  entries: {},
});

// برای هر فعالیت، آخرین تغییر برنده است
export function mergeProgress(a: Progress, b: Progress): Progress {
  const entries = { ...a.entries };
  for (const [id, entry] of Object.entries(b.entries)) {
    if (!entries[id] || entry.at > entries[id].at) entries[id] = entry;
  }
  const newer = b.startDateAt > a.startDateAt ? b : a;
  return { version: 1, startDate: newer.startDate, startDateAt: newer.startDateAt, entries };
}

export const isDone = (p: Progress, id: string) => p.entries[id]?.done === true;

export const dayDate = (p: Progress, day: number) => addDays(p.startDate, day - 1);

// شماره‌ی روز برنامه؛ قبل از شروع کوچک‌تر از ۱ و بعد از پایان بزرگ‌تر از تعداد روزهاست
export const currentDayNumber = (p: Progress, today: string) => diffDays(today, p.startDate) + 1;

export const doneCount = (p: Progress, tasks: Task[]) => tasks.filter((t) => isDone(p, t.id)).length;
export const doneMinutes = (p: Progress, tasks: Task[]) =>
  tasks.reduce((sum, t) => sum + (isDone(p, t.id) ? t.minutes : 0), 0);
export const ratio = (done: number, total: number) => (total ? done / total : 0);

export const isDayComplete = (p: Progress, day: PlanDay) => day.tasks.every((t) => isDone(p, t.id));

export function overdueTasks(p: Progress, today: string): Task[] {
  const current = Math.min(currentDayNumber(p, today), TOTAL_DAYS + 1);
  return PLAN.slice(0, Math.max(current - 1, 0))
    .flatMap((d) => d.tasks)
    .filter((t) => !isDone(p, t.id));
}

export function carriedCount(p: Progress, day: PlanDay, today: string) {
  return day.day < currentDayNumber(p, today) ? day.tasks.length - doneCount(p, day.tasks) : 0;
}

export type LessonState = "done" | "partial" | "none";

export function lessonState(p: Progress, lesson: number, round: Round): LessonState {
  const tasks = ALL_TASKS.filter((t) => t.round === round && t.lesson === lesson);
  const done = doneCount(p, tasks);
  if (done === tasks.length) return "done";
  return done ? "partial" : "none";
}

export function summary(p: Progress) {
  const round1 = ALL_TASKS.filter((t) => t.round === 1);
  const round2 = ALL_TASKS.filter((t) => t.round === 2);
  const round3 = ALL_TASKS.filter((t) => t.round === 3);
  const exam = ALL_TASKS.filter((t) => t.round === 4);
  const sections = round1.filter((t) => t.book === "kursbuch");
  return {
    // پوشش سطح یعنی چند بخش از درس‌ها دست‌کم یک بار خوانده شده
    coverage: ratio(doneCount(p, sections), sections.length),
    round1: ratio(doneCount(p, round1), round1.length),
    round2: ratio(doneCount(p, round2), round2.length),
    round3: ratio(doneCount(p, round3), round3.length),
    exam: ratio(doneCount(p, exam), exam.length),
    lessonsDone: LESSONS.filter((l) => lessonState(p, l.n, 1) === "done").length,
    minutesDone: doneMinutes(p, ALL_TASKS),
    listeningDone: ALL_TASKS.filter((t) => t.book === "kursbuch" && isDone(p, t.id)).reduce(
      (sum, t) => sum + (t.round === 1 ? 10 : 7),
      0,
    ),
    fullDays: PLAN.filter((d) => isDayComplete(p, d)).length,
  };
}

export function bookProgress(p: Progress) {
  return (Object.keys(BOOKS) as BookId[]).map((book) => {
    const tasks = ALL_TASKS.filter((t) => t.book === book);
    return { book, done: doneCount(p, tasks), total: tasks.length };
  });
}

export interface Period {
  key: string;
  title: string;
  days: PlanDay[];
  ratio: number;
  fullDays: number;
  plannedMinutes: number;
  doneMinutes: number;
  lessons: number[];
}

function toPeriods(p: Progress, keyOf: (iso: string) => string, titleOf: (iso: string) => string) {
  const groups = new Map<string, { title: string; days: PlanDay[] }>();
  for (const day of PLAN) {
    const date = dayDate(p, day.day);
    const key = keyOf(date);
    if (!groups.has(key)) groups.set(key, { title: titleOf(date), days: [] });
    groups.get(key)!.days.push(day);
  }
  return [...groups].map(([key, { title, days }]): Period => {
    const tasks = days.flatMap((d) => d.tasks);
    return {
      key,
      title,
      days,
      ratio: ratio(doneCount(p, tasks), tasks.length),
      fullDays: days.filter((d) => isDayComplete(p, d)).length,
      plannedMinutes: tasks.reduce((sum, t) => sum + t.minutes, 0),
      doneMinutes: doneMinutes(p, tasks),
      lessons: days
        .filter((d) => d.lesson && isDayComplete(p, d))
        .map((d) => d.lesson!)
        .filter((n, i, all) => all.indexOf(n) === i),
    };
  });
}

export const weeklyReport = (p: Progress) =>
  toPeriods(p, weekStart, (iso) => {
    const start = weekStart(iso);
    return `${shortDate(start)} تا ${shortDate(addDays(start, 6))}`;
  });

export const monthlyReport = (p: Progress) => toPeriods(p, monthKey, monthName);
