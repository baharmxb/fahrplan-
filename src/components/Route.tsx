"use client";

import Link from "next/link";
import { LESSONS, TARGET_LEVEL, lessonFolder } from "@/data/curriculum";
import { fa } from "@/lib/dates";
import { lessonState } from "@/lib/progress";
import { useProgress } from "@/lib/store";
import type { Round } from "@/lib/plan";
import { De } from "./ui";

const STATE_NAME = { done: "کامل", partial: "نیمه‌کاره", none: "شروع‌نشده" };

// خط دوازده‌ایستگاهی؛ ایستگاه‌های دوحلقه نقطه‌ی مرور هر سه درس‌اند
export function Route({ round, current }: { round: Round; current: number | null }) {
  const { progress } = useProgress();
  const offset = (round - 1) * 13;
  const currentLesson = current ? LESSONS[current - 1] : null;

  return (
    <section className="route" aria-label="مسیر درس‌ها">
      <div className="route__sign">
        <span>{currentLesson ? "ایستگاه فعلی" : "مقصد"}</span>
        <De className="route__station">{currentLesson?.title ?? TARGET_LEVEL}</De>
      </div>
      <div className="route__track">
        <ol>
          {LESSONS.map((lesson) => {
            const state = lessonState(progress, lesson.n, round);
            return (
              <li
                key={lesson.n}
                className="stop"
                data-folder={lessonFolder(lesson.n)}
                data-state={state}
                data-current={lesson.n === current || undefined}
                data-review={lesson.n % 3 === 0 || undefined}
              >
                <Link
                  prefetch={false}
                  href={`/plan/${lesson.n + offset}`}
                  aria-label={`درس ${fa(lesson.n)}، ${lesson.title}، ${STATE_NAME[state]}`}
                >
                  <span className="stop__dot" />
                  <span className="stop__n">{fa(lesson.n)}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
      <p className="route__key">
        مسیر از <bdi>A1</bdi> تا <bdi>{TARGET_LEVEL}</bdi>. ایستگاه دوحلقه یعنی روز بعدش مرور سه درس اخیر را داری.
      </p>
    </section>
  );
}
