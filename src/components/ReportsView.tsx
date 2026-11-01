"use client";

import { useState } from "react";
import { monthlyReport, weeklyReport } from "@/lib/progress";
import { useProgress } from "@/lib/store";
import { DayBars, PeriodCards, PeriodSwitch } from "./Charts";
import { Loading } from "./ui";

export function ReportsView() {
  const { ready, progress } = useProgress();
  const [period, setPeriod] = useState<"week" | "month">("week");
  if (!ready) return <Loading />;

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <h1>گزارش پیشرفت</h1>
          <p>هر ستون یک روز از برنامه است و ارتفاعش سهم فعالیت‌های انجام‌شده را نشان می‌دهد.</p>
        </div>
      </header>

      <section className="block" aria-labelledby="daily-title">
        <h2 id="daily-title" className="block__title">
          پیشرفت روزانه
        </h2>
        <DayBars />
      </section>

      <section className="block" aria-labelledby="periods-title">
        <div className="block__row">
          <h2 id="periods-title" className="block__title">
            گزارش بازه‌ای
          </h2>
          <PeriodSwitch value={period} onChange={setPeriod} />
        </div>
        <PeriodCards periods={period === "week" ? weeklyReport(progress) : monthlyReport(progress)} />
      </section>
    </div>
  );
}
