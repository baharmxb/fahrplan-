"use client";

import Link from "next/link";
import { Fragment } from "react";
import { getLesson, lessonFolder } from "@/data/curriculum";
import { fa, formatMinutes, longDate, weekday } from "@/lib/dates";
import { PLAN, ROUND_PHASE, TOTAL_DAYS, getDay } from "@/lib/plan";
import { carriedCount, currentDayNumber, dayDate, doneCount, isDayComplete } from "@/lib/progress";
import { useProgress } from "@/lib/store";
import { useReader } from "./Reader";
import { TaskList } from "./TaskList";
import { De, Loading } from "./ui";

export function PlanView() {
  const { ready, progress, today } = useProgress();
  if (!ready) return <Loading />;
  const current = currentDayNumber(progress, today);

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <h1>برنامه مطالعاتی</h1>
          <p>
            هر روز یک درس، و بعد از هر سه درس یک مرور. {fa(TOTAL_DAYS)} روز تا {longDate(dayDate(progress, TOTAL_DAYS))}: سه دور کتاب و ده روز آمادگی آزمون ÖSD.
          </p>
        </div>
      </header>

      <ol className="line">
        {PLAN.map((day) => {
          const date = dayDate(progress, day.day);
          const carried = carriedCount(progress, day, today);
          const newRound = day.day === 1 || PLAN[day.day - 2].round !== day.round;
          const folder = day.lesson ? lessonFolder(day.lesson) : 4;
          return (
            <Fragment key={day.day}>
              {newRound && <li className="line__round">{ROUND_PHASE[day.round]}</li>}
              <li
                className="stopcard"
                data-folder={folder}
                data-today={day.day === current || undefined}
                data-complete={isDayComplete(progress, day) || undefined}
              >
                <Link prefetch={false} href={`/plan/${day.day}`}>
                  <span className="stopcard__day">روز {fa(day.day)}</span>
                  <span className="stopcard__date">
                    {weekday(date)}، {longDate(date)}
                  </span>
                  <span className="stopcard__title">
                    <span>{day.heading}</span>
                    <De>{day.germanTitle}</De>
                  </span>
                  <span className="stopcard__facts">
                    <span>
                      {fa(doneCount(progress, day.tasks))} از {fa(day.tasks.length)} فعالیت
                    </span>
                    <span>{formatMinutes(day.minutes)}</span>
                    {day.tasks.some((t) => t.book === "review") && <span>همراه با مرور</span>}
                    {day.day === current && <span className="flag">امروز</span>}
                    {carried > 0 && <span className="flag flag--alert">{fa(carried)} منتقل‌شده</span>}
                  </span>
                </Link>
              </li>
            </Fragment>
          );
        })}
      </ol>
    </div>
  );
}

export function DayView({ number }: { number: number }) {
  const { ready, progress } = useProgress();
  const { open } = useReader();
  if (!ready) return <Loading />;

  const day = getDay(number);
  const date = dayDate(progress, number);
  const lesson = day.lesson ? getLesson(day.lesson) : null;

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <p>
            روز {fa(number)} از {fa(TOTAL_DAYS)}، {weekday(date)} {longDate(date)}
          </p>
          <h1>
            <De>{day.germanTitle}</De>
          </h1>
          <p>
            {day.heading}
            {lesson && `، صفحه ${fa(lesson.page)} تا ${fa(lesson.endPage)}`}، {ROUND_PHASE[day.round]}
          </p>
        </div>
        {lesson && (
          <button type="button" className="button button--strong" onClick={() => open(lesson.n)}>
            باز کردن متن درس
          </button>
        )}
      </header>

      <section className="block" aria-labelledby="day-tasks">
        <h2 id="day-tasks" className="block__title">
          فعالیت‌های این روز، {formatMinutes(day.minutes)}
        </h2>
        <TaskList tasks={day.tasks} />
      </section>

      {lesson && (
        <section className="block" aria-labelledby="day-goals">
          <h2 id="day-goals" className="block__title">
            هدف‌های هر بخش در کتاب
          </h2>
          <ul className="goals">
            {lesson.sections.map((section) => (
              <li key={section.key} lang="de" dir="ltr">
                <h3>
                  {section.key}. {section.title}
                </h3>
                <p className="goals__task">{section.task}</p>
                <ul>
                  {section.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav className="pager" aria-label="روزهای برنامه">
        {number > 1 && <Link prefetch={false} href={`/plan/${number - 1}`}>روز قبل</Link>}
        <Link prefetch={false} href="/plan">همه‌ی روزها</Link>
        {number < TOTAL_DAYS && <Link prefetch={false} href={`/plan/${number + 1}`}>روز بعد</Link>}
      </nav>
    </div>
  );
}
