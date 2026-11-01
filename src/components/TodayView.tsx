"use client";

import Link from "next/link";
import { getLesson } from "@/data/curriculum";
import { fa, faPercent, formatMinutes, longDate, shortDate, weekday } from "@/lib/dates";
import { ROUND_PHASE, TOTAL_DAYS, getDay, type PlanDay } from "@/lib/plan";
import { currentDayNumber, dayDate, doneCount, isDone, overdueTasks, pendingReviews, ratio, reviewState } from "@/lib/progress";
import { useProgress } from "@/lib/store";
import { TAB_NAMES, useReader, type ReaderTab } from "./Reader";
import { TaskList } from "./TaskList";
import { De, Loading, Notice, Plate } from "./ui";

function Poster({ day, iso }: { day: PlanDay; iso: string }) {
  const { progress } = useProgress();
  const done = doneCount(progress, day.tasks);
  const value = ratio(done, day.tasks.length);

  return (
    <header className="poster">
      <div className="poster__top">
        {day.lesson && <Plate n={day.lesson} size="lg" />}
        <div className="poster__when">
          <p className="poster__date">
            {weekday(iso)}، {longDate(iso)}
          </p>
          <p>{ROUND_PHASE[day.round]}</p>
        </div>
      </div>
      <h1>
        <De>{day.germanTitle}</De>
      </h1>
      <p className="poster__facts">
        <span>{day.heading}</span>
        <span>
          روز {fa(day.day)} از {fa(TOTAL_DAYS)}
        </span>
        <span>برنامه‌ی امروز {formatMinutes(day.minutes)}</span>
      </p>
      <div
        className="ticks"
        role="progressbar"
        aria-label="پیشرفت امروز"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
      >
        {day.tasks.map((task) => (
          <span key={task.id} data-done={isDone(progress, task.id) || undefined} />
        ))}
      </div>
      <p className="poster__progress">
        {fa(done)} از {fa(day.tasks.length)} فعالیت، {faPercent(value)}
      </p>
    </header>
  );
}

function ResumeCard() {
  const { progress } = useProgress();
  const { open } = useReader();
  const spot = progress.lastRead;
  if (!spot) return null;
  const tab = spot.tab as ReaderTab;
  return (
    <button type="button" className="resume" onClick={() => open(spot.lesson, tab, spot.scroll)}>
      <span className="resume__label">ادامه از همان‌جا</span>
      <De className="resume__title">{getLesson(spot.lesson).title}</De>
      <span className="resume__where">
        درس {fa(spot.lesson)}، {TAB_NAMES[tab]}
      </span>
    </button>
  );
}

export function TodayView() {
  const { ready, progress, today } = useProgress();
  if (!ready) return <Loading />;

  const number = currentDayNumber(progress, today);
  const overdue = overdueTasks(progress, today);

  if (number < 1) {
    return (
      <Notice title={`برنامه ${fa(1 - number)} روز دیگر شروع می‌شود`}>
        <p>اولین درس روز {longDate(progress.startDate)} است.</p>
        <Link prefetch={false} className="button" href="/dashboard">
          تغییر تاریخ شروع
        </Link>
      </Notice>
    );
  }

  const day = number <= TOTAL_DAYS ? getDay(number) : null;
  const reviews = pendingReviews(progress, today);
  const lessonTasks = day?.tasks.filter((t) => t.book !== "review" || isDone(progress, t.id)) ?? [];
  const planned = [...reviews, ...lessonTasks];
  const upcoming = day?.tasks.find((t) => t.book === "review" && !isDone(progress, t.id) && !reviews.includes(t));
  const upcomingState = upcoming && reviewState(progress, upcoming, today);

  return (
    <div className="page">
      {day ? (
        <Poster day={day} iso={dayDate(progress, day.day)} />
      ) : (
        <Notice title={overdue.length ? "فقط کارهای جامانده باقی مانده است" : "برنامه تا ۳۰ آذر تمام شد"}>
          <p>{overdue.length ? "با تمام‌کردن فهرست زیر، برنامه کامل می‌شود." : "همه‌ی فعالیت‌های برنامه انجام شده است."}</p>
        </Notice>
      )}

      <ResumeCard />

      {overdue.length > 0 && (
        <section className="block" aria-labelledby="overdue-title">
          <h2 id="overdue-title" className="block__title block__title--alert">
            جامانده از روزهای قبل
            <span className="count">{fa(overdue.length)}</span>
          </h2>
          <TaskList tasks={overdue} carried />
        </section>
      )}

      {(planned.length > 0 || upcoming) && (
        <section className="block" aria-labelledby="today-title">
          <h2 id="today-title" className="block__title">
            کارهای امروز
          </h2>
          {upcoming && upcomingState && (
            <p className="review-hint">
              {upcoming.label}{" "}
              {upcomingState.kind === "waiting"
                ? `از ${shortDate(upcomingState.from)} اضافه می‌شود.`
                : "بعد از تکمیل این سه درس به برنامه اضافه می‌شود."}
            </p>
          )}
          {planned.length > 0 && <TaskList tasks={planned} />}
        </section>
      )}
    </div>
  );
}
