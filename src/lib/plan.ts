import {
  LESSONS,
  XTRA_TITLES,
  getLesson,
  grammarPages,
  lessonFolder,
  sectionPages,
  type Lesson,
  type SectionKey,
} from "@/data/curriculum";
import { fa } from "./dates";

export type BookId = "kursbuch" | "arbeitsbuch" | "grammatik" | "deutsch-ueben" | "review" | "osd";
// مرحله‌ی ۴ آمادگی نهایی آزمون است و دیگر دور درسی نیست
export type Round = 1 | 2 | 3 | 4;
type LessonRound = 1 | 2 | 3;

export interface Task {
  id: string;
  day: number;
  round: Round;
  book: BookId;
  lesson: number | null;
  section?: SectionKey;
  label: string; // عنوان فارسی
  de?: string; // عنوان آلمانی کنارش
  note?: string;
  noteDe?: string;
  pages?: [number, number];
  minutes: number;
  reviewOf?: number[];
}

export interface PlanDay {
  day: number;
  round: Round;
  lesson: number | null;
  heading: string;
  germanTitle: string;
  tasks: Task[];
  minutes: number;
}

// از ۱۲ آبان ۱۴۰۵ تا ۳۰ آذر ۱۴۰۵
export const PLAN_START = "2026-11-03";

export const BOOKS: Record<BookId, { name: string; hint: string }> = {
  kursbuch: { name: "Kursbuch", hint: "کتاب اصلی" },
  arbeitsbuch: { name: "Arbeitsbuch", hint: "کتاب کار" },
  grammatik: { name: "Grammatik", hint: "دستور زبان" },
  "deutsch-ueben": { name: "Deutsch Üben", hint: "تمرین تکمیلی" },
  review: { name: "Review", hint: "مرور هر سه درس" },
  osd: { name: "ÖSD", hint: "آمادگی آزمون" },
};

export const ROUND_NAME: Record<Round, string> = {
  1: "دور اول",
  2: "دور دوم",
  3: "دور سوم",
  4: "آمادگی ÖSD",
};
export const ROUND_PHASE: Record<Round, string> = {
  1: "دور اول: یادگیری",
  2: "دور دوم: تثبیت",
  3: "دور سوم: مرور با نگاه آزمون ÖSD",
  4: "آمادگی نهایی آزمون ÖSD",
};

// زمان‌ها برآورد است؛ برای تغییر مدت فعالیت‌ها فقط همین‌جا را عوض کن
const MINUTES = {
  sectionStudy: { 1: 20, 2: 12, 3: 8 },
  listening: { 1: 10, 2: 7, 3: 7 }, // مدت گوش‌دادن هر بخش
  arbeitsbuch: { 1: 30, 2: 20, 3: 15 },
  grammatik: { 1: 20, 2: 15, 3: 10 },
  deutschUeben: { 1: 20, 2: 15, 3: 15 },
  review: 45,
  xtraLesen: 15,
  examMistakes: 15,
  examGrammar: 15,
  examPractice: 45,
} as const;

const pad = (n: number) => String(n).padStart(2, "0");

function sectionNote(lesson: Lesson, index: number, round: LessonRound) {
  if (round === 2) return "متن و صوت این بخش را یک بار دیگر مرور کن.";
  if (round === 3) return "خلاصه‌ی این بخش را بلند به آلمانی بگو و عبارت‌های کلیدی‌اش را به‌کار ببر.";
  if (index === 0) return `اول صفحه‌ی ${fa(lesson.page)} را ببین و بعد این بخش را شروع کن.`;
  if (index === lesson.sections.length - 1) {
    return `در پایان، Xtra Lesen صفحه‌ی ${fa(lesson.endPage)} را هم بخوان.`;
  }
  return undefined;
}

function kursbuchTasks(lesson: Lesson, day: number, round: LessonRound): Task[] {
  return lesson.sections.map((section, i) => ({
    id: `r${round}-l${pad(lesson.n)}-${section.key.toLowerCase()}`,
    day,
    round,
    book: "kursbuch",
    lesson: lesson.n,
    section: section.key,
    label: `بخش ${section.key}`,
    de: section.title,
    note: sectionNote(lesson, i, round),
    noteDe: section.task,
    pages: sectionPages(lesson, i),
    minutes: MINUTES.sectionStudy[round] + MINUTES.listening[round],
  }));
}

function dayTasks(lesson: Lesson, day: number, round: LessonRound): Task[] {
  const base = { day, round, lesson: lesson.n };
  const tag = `r${round}-l${pad(lesson.n)}`;
  // هر دور از یک گرامر متفاوت درس شروع می‌کند تا تمرین تکراری نشود
  const practiceFocus = lesson.grammar[(round - 1) % lesson.grammar.length];
  const workbookNote = {
    1: "بخش مربوط به همین درس را حل کن.",
    2: "تمرین‌هایی را که غلط زدی دوباره حل کن.",
    3: "فقط تمرین‌هایی را حل کن که هنوز در آن‌ها اشتباه داری.",
  };
  return [
    ...kursbuchTasks(lesson, day, round),
    {
      ...base,
      id: `${tag}-ab`,
      book: "arbeitsbuch",
      label: `تمرین‌های درس ${fa(lesson.n)}`,
      note: workbookNote[round],
      minutes: MINUTES.arbeitsbuch[round],
    },
    {
      ...base,
      id: `${tag}-gr`,
      book: "grammatik",
      label: "Grammatik Xpress",
      noteDe: lesson.grammar.join("; "),
      pages: grammarPages(lesson),
      minutes: MINUTES.grammatik[round],
    },
    {
      ...base,
      id: `${tag}-du`,
      book: "deutsch-ueben",
      label: "تمرین هم‌موضوع با درس",
      noteDe: practiceFocus,
      minutes: MINUTES.deutschUeben[round],
    },
  ];
}

const reviewTitle = (first: number, last: number) => `مرور درس‌های ${fa(first)} تا ${fa(last)}`;

function reviewTask(lessons: number[], day: number, round: LessonRound): Task {
  const first = lessons[0];
  const last = lessons[lessons.length - 1];
  return {
    id: `r${round}-rev-${lessonFolder(last)}`,
    day,
    round,
    book: "review",
    lesson: null,
    label: reviewTitle(first, last),
    note: "این سه درس را از صفحه‌ی هر درس مرور کن.",
    minutes: MINUTES.review,
    reviewOf: lessons,
  };
}

interface ExamDay {
  title: string;
  skill: string;
  task: string;
  minutes: number;
  lessons: [number, number];
}

// ساختار از ÖSD Zertifikat A2: کتبی حدود ۷۵ دقیقه و شفاهی حدود ۱۰ دقیقه
const EXAM_DAYS: ExamDay[] = [
  { title: "Lesen", skill: "Lesen", task: "دو متن کوتاه را در ۳۰ دقیقه بخوان و خودت را زمان بگیر.", minutes: 45, lessons: [1, 2] },
  { title: "Hören", skill: "Hören", task: "سه شنیداری کوتاه را گوش بده و جزئیات را یادداشت کن.", minutes: 45, lessons: [3, 4] },
  { title: "Schreiben", skill: "Schreiben", task: "یک ایمیل شخصی را در ۳۰ دقیقه بنویس.", minutes: 45, lessons: [5, 6] },
  { title: "Sprechen: Vorstellung", skill: "Sprechen", task: "خودت را در پنج موضوع معرفی کن و صدایت را ضبط کن.", minutes: 45, lessons: [7, 8] },
  { title: "Sprechen: gemeinsam planen", skill: "Sprechen", task: "با یک هم‌تمرین یا به‌تنهایی یک برنامه‌ی مشترک را طراحی کن.", minutes: 45, lessons: [9, 10] },
  { title: "Schreiben", skill: "Schreiben", task: "ایمیل دیگری بنویس و خطاهای تکراری خودت را فهرست کن.", minutes: 45, lessons: [11, 12] },
  { title: "Probeprüfung schriftlich", skill: "کتبی", task: "آزمون آزمایشی کتبی: Lesen، Hören و Schreiben پشت سر هم و بدون استراحت.", minutes: 75, lessons: [3, 6] },
  { title: "Probeprüfung mündlich", skill: "شفاهی", task: "آزمون آزمایشی شفاهی با ۱۰ دقیقه آماده‌سازی و ۱۰ دقیقه صحبت.", minutes: 30, lessons: [9, 10] },
  { title: "Schwächen", skill: "نقاط ضعف", task: "نتیجه‌ی آزمون‌های آزمایشی را ببین و ضعیف‌ترین مهارت را تمرین کن.", minutes: 45, lessons: [7, 11] },
  { title: "Letzte Wiederholung", skill: "مرور نهایی", task: "مرور سبک لغات و عبارت‌های کلیدی؛ خسته نشو.", minutes: 30, lessons: [8, 12] },
];

function examTasks(exam: ExamDay, day: number): Task[] {
  const base = { day, round: 4 as const };
  const tag = `r4-d${day}`;
  const names = exam.lessons.map(fa).join(" و ");
  return [
    { ...base, id: `${tag}-osd`, book: "osd", lesson: null, label: `تمرین ${exam.skill}`, note: exam.task, minutes: exam.minutes },
    ...exam.lessons.map((n): Task => {
      const lesson = getLesson(n);
      return {
        ...base,
        id: `${tag}-x${n}`,
        book: "kursbuch",
        lesson: n,
        label: "Xtra Lesen",
        de: XTRA_TITLES[n],
        pages: [lesson.endPage, lesson.endPage],
        minutes: MINUTES.xtraLesen,
      };
    }),
    {
      ...base,
      id: `${tag}-ab`,
      book: "arbeitsbuch",
      lesson: null,
      label: "رفع اشتباه‌ها",
      note: `تمرین‌های غلط درس ${names} را دوباره حل کن.`,
      minutes: MINUTES.examMistakes,
      reviewOf: [...exam.lessons],
    },
    {
      ...base,
      id: `${tag}-gr`,
      book: "grammatik",
      lesson: null,
      label: "Grammatik Xpress",
      note: `گرامر درس ${names} را با یادداشت‌های خودت مرور کن.`,
      minutes: MINUTES.examGrammar,
      reviewOf: [...exam.lessons],
    },
    {
      ...base,
      id: `${tag}-du`,
      book: "deutsch-ueben",
      lesson: null,
      label: "تمرین هم‌مهارت",
      note: `تمرین‌هایی را انتخاب کن که به ${exam.skill} کمک می‌کنند.`,
      minutes: MINUTES.deutschUeben[3],
    },
  ];
}

function buildPlan(): PlanDay[] {
  const days: PlanDay[] = [];
  const push = (round: Round, lesson: number | null, heading: string, germanTitle: string, tasks: Task[]) =>
    days.push({
      day: tasks[0].day,
      round,
      lesson,
      heading,
      germanTitle,
      tasks,
      minutes: tasks.reduce((sum, t) => sum + t.minutes, 0),
    });

  let day = 0;
  for (const round of [1, 2, 3] as LessonRound[]) {
    for (const lesson of LESSONS) {
      day += 1;
      const tasks = dayTasks(lesson, day, round);
      // هر سه درس یک گروه است و مرور گروه، پیش از درس روز بعد می‌آید
      const hasReview = lesson.n > 1 && (lesson.n - 1) % 3 === 0;
      if (hasReview) tasks.unshift(reviewTask([lesson.n - 3, lesson.n - 2, lesson.n - 1], day, round));
      const title = `درس ${fa(lesson.n)}`;
      const heading = hasReview ? `${reviewTitle(lesson.n - 3, lesson.n - 1)} + ${title}` : title;
      push(round, lesson.n, heading, lesson.title, tasks);
    }
    // درس ۱۳ نداریم، پس مرور سه درس آخر روز جداگانه‌ی خودش را دارد
    day += 1;
    push(round, null, reviewTitle(10, 12), "Wiederholung", [reviewTask([10, 11, 12], day, round)]);
  }
  for (const exam of EXAM_DAYS) {
    day += 1;
    push(4, null, `آمادگی ÖSD: ${exam.skill}`, exam.title, examTasks(exam, day));
  }
  return days;
}

export const PLAN = buildPlan();
export const TOTAL_DAYS = PLAN.length;
export const ALL_TASKS = PLAN.flatMap((d) => d.tasks);

export const getDay = (day: number) => PLAN[day - 1];
