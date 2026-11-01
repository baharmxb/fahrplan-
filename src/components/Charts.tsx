"use client";

import { useState } from "react";
import { getLesson } from "@/data/curriculum";
import { fa, faPercent, formatMinutes, shortDate } from "@/lib/dates";
import { PLAN, type PlanDay } from "@/lib/plan";
import { dayDate, doneCount, doneMinutes, isDayComplete, ratio, type Period } from "@/lib/progress";
import { useProgress } from "@/lib/store";
import { De, Meter } from "./ui";

function describeDay(day: PlanDay, done: number, minutes: number) {
  return `روز ${fa(day.day)}، ${day.heading}: ${fa(done)} از ${fa(day.tasks.length)} فعالیت، ${fa(minutes)} از ${fa(day.minutes)} دقیقه`;
}

export function DayBars() {
  const { progress } = useProgress();
  const [active, setActive] = useState<number | null>(null);
  const rows = PLAN.map((day) => {
    const done = doneCount(progress, day.tasks);
    return {
      day,
      done,
      minutes: doneMinutes(progress, day.tasks),
      value: ratio(done, day.tasks.length),
      complete: isDayComplete(progress, day),
    };
  });
  const focused = active ? rows[active - 1] : null;
  const weeks = Array.from({ length: Math.ceil(rows.length / 7) }, (_, i) => rows.slice(i * 7, i * 7 + 7));

  return (
    <figure className="bars">
      <figcaption className="bars__head">
        <p className="bars__readout" aria-live="polite">
          {focused
            ? describeDay(focused.day, focused.done, focused.minutes)
            : "روی یک ستون بزن تا جزئیات آن روز را ببینی."}
        </p>
        <ul className="bars__legend">
          <li data-kind="full">روز کامل</li>
          <li data-kind="part">روز ناقص</li>
        </ul>
      </figcaption>
      <div className="bars__weeks">
        {weeks.map((week, i) => (
          <section key={i} className="bars__week">
            <h3>هفته {fa(i + 1)}</h3>
            <ol className="bars__columns">
              {week.map(({ day, done, minutes, value, complete }) => (
                <li key={day.day} data-active={active === day.day || undefined}>
                  <button
                    type="button"
                    aria-label={describeDay(day, done, minutes)}
                    aria-pressed={active === day.day}
                    onClick={() => setActive(day.day)}
                  >
                    <span
                      className="bars__bar"
                      data-kind={complete ? "full" : "part"}
                      style={{ blockSize: `${value * 100}%` }}
                    />
                  </button>
                  <span className="bars__tick">{fa(day.day)}</span>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
      <details className="bars__table">
        <summary>نمایش به‌صورت جدول</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">روز</th>
              <th scope="col">تاریخ</th>
              <th scope="col">فعالیت‌ها</th>
              <th scope="col">دقیقه</th>
              <th scope="col">وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ day, done, minutes, complete }) => (
              <tr key={day.day}>
                <td>{fa(day.day)}</td>
                <td>{shortDate(dayDate(progress, day.day))}</td>
                <td>
                  {fa(done)} از {fa(day.tasks.length)}
                </td>
                <td>
                  {fa(minutes)} از {fa(day.minutes)}
                </td>
                <td>{complete ? "کامل" : done ? "ناقص" : "شروع‌نشده"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

export function PeriodSwitch({
  value,
  onChange,
}: {
  value: "week" | "month";
  onChange: (value: "week" | "month") => void;
}) {
  return (
    <div className="segmented" role="group" aria-label="بازه‌ی گزارش">
      <button type="button" aria-pressed={value === "week"} onClick={() => onChange("week")}>
        هفتگی
      </button>
      <button type="button" aria-pressed={value === "month"} onClick={() => onChange("month")}>
        ماهانه
      </button>
    </div>
  );
}

export function PeriodMeters({ periods }: { periods: Period[] }) {
  return (
    <ul className="periods-mini">
      {periods.map((period) => (
        <li key={period.key}>
          <span>{period.title}</span>
          <Meter value={period.ratio} label={period.title} />
          <strong>{faPercent(period.ratio)}</strong>
        </li>
      ))}
    </ul>
  );
}

export function PeriodCards({ periods }: { periods: Period[] }) {
  return (
    <ul className="periods">
      {periods.map((period) => (
        <li key={period.key} className="period">
          <header>
            <h3>{period.title}</h3>
            <strong>{faPercent(period.ratio)}</strong>
          </header>
          <Meter value={period.ratio} label={period.title} />
          <dl>
            <div>
              <dt>روزهای کامل</dt>
              <dd>
                {fa(period.fullDays)} از {fa(period.days.length)}
              </dd>
            </div>
            <div>
              <dt>برنامه‌ریزی‌شده</dt>
              <dd>{formatMinutes(period.plannedMinutes)}</dd>
            </div>
            <div>
              <dt>انجام‌شده</dt>
              <dd>{formatMinutes(period.doneMinutes)}</dd>
            </div>
          </dl>
          <p className="period__lessons">
            {period.lessons.length ? (
              <>
                درس‌های تکمیل‌شده:{" "}
                {period.lessons.map((n, i) => (
                  <span key={n}>
                    {i > 0 && "، "}
                    <De>{getLesson(n).title}</De>
                  </span>
                ))}
              </>
            ) : (
              "هنوز درسی در این بازه کامل نشده است."
            )}
          </p>
        </li>
      ))}
    </ul>
  );
}
