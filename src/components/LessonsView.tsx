"use client";

import { useMemo, useState } from "react";
import { LESSONS, TARGET_LEVEL, folderName, lessonFolder } from "@/data/curriculum";
import type { ContentCount } from "@/lib/content-index";
import { fa, formatMinutes } from "@/lib/dates";
import { ALL_TASKS, ROUND_NAME, type Round } from "@/lib/plan";
import { lessonState } from "@/lib/progress";
import { useProgress } from "@/lib/store";
import { useReader } from "./Reader";
import { De, Loading, Plate } from "./ui";

const STATE_TEXT = { done: "کامل", partial: "نیمه‌کاره", none: "شروع‌نشده" };

const lessonMinutes = (n: number) =>
  ALL_TASKS.filter((t) => t.round === 1 && t.lesson === n).reduce((sum, t) => sum + t.minutes, 0);

const haystack = LESSONS.map((l) =>
  [
    l.title,
    l.titleFa,
    ...l.grammar,
    ...l.vocab,
    ...l.sections.flatMap((s) => [s.title, s.task]),
  ]
    .join(" ")
    .toLowerCase(),
);

function RoundState({ lesson, round }: { lesson: number; round: Round }) {
  const { progress } = useProgress();
  const state = lessonState(progress, lesson, round);
  return (
    <span className="round-state" data-state={state}>
      {ROUND_NAME[round]}: {STATE_TEXT[state]}
    </span>
  );
}

export function LessonsView({ counts }: { counts: Record<number, ContentCount> }) {
  const { ready } = useProgress();
  const { open } = useReader();
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("all");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return LESSONS.filter(
      (l, i) =>
        (!needle || haystack[i].includes(needle)) &&
        (folder === "all" || lessonFolder(l.n) === Number(folder)),
    );
  }, [query, folder]);

  if (!ready) return <Loading />;

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <h1>فهرست درس‌ها</h1>
          <p>دوازده درس کتاب با موضوع، گرامر و وضعیت مطالعه‌ی هر کدام.</p>
        </div>
      </header>

      <div className="filters">
        <label className="field field--grow">
          <span>جست‌وجو</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="مثلاً Konjunktiv یا خانواده"
          />
        </label>
        <label className="field">
          <span>پوشه</span>
          <select value={folder} onChange={(e) => setFolder(e.target.value)}>
            <option value="all">همه‌ی پوشه‌ها</option>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {folderName(n)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length === 0 && (
        <p className="state">درسی با این جست‌وجو پیدا نشد. فیلترها را تغییر بده.</p>
      )}

      <ul className="lessons">
        {visible.map((lesson) => {
          const count = counts[lesson.n];
          return (
            <li key={lesson.n} className="lesson">
              <Plate n={lesson.n} folder={lessonFolder(lesson.n)} />
              <div className="lesson__main">
                <h2>
                  <De>{lesson.title}</De>
                </h2>
                <p className="lesson__fa">{lesson.titleFa}</p>
                <ul className="lesson__facts">
                  <li>{folderName(lessonFolder(lesson.n))}</li>
                  <li>
                    سطح <bdi>{TARGET_LEVEL}</bdi>
                  </li>
                  <li>{fa(lesson.sections.length)} بخش</li>
                  <li>{fa(count.sentences)} جمله</li>
                  <li>{fa(count.words)} لغت</li>
                  <li>حدود {formatMinutes(lessonMinutes(lesson.n))}</li>
                  <li>
                    {count.audio ? (
                      <>
                        صوت: <bdi>{count.audio.split("/").pop()}</bdi>
                      </>
                    ) : (
                      "صوت کتاب اضافه نشده"
                    )}
                  </li>
                </ul>
                <div className="lesson__rounds">
                  <RoundState lesson={lesson.n} round={1} />
                  <RoundState lesson={lesson.n} round={2} />
                  <RoundState lesson={lesson.n} round={3} />
                </div>
              </div>
              <button type="button" className="button" onClick={() => open(lesson.n)}>
                باز کردن متن
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
