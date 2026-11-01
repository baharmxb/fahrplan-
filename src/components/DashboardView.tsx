"use client";

import Link from "next/link";
import { useState } from "react";
import { fa, faPercent, formatMinutes, longDate } from "@/lib/dates";
import { BOOKS, TOTAL_DAYS, getDay, type Round } from "@/lib/plan";
import { BOOK_NAME, TARGET_LEVEL } from "@/data/curriculum";
import { bookProgress, currentDayNumber, dayDate, monthlyReport, ratio, summary, weeklyReport } from "@/lib/progress";
import { useProgress } from "@/lib/store";
import { storageLabel } from "./AppShell";
import { PeriodMeters, PeriodSwitch } from "./Charts";
import { Route } from "./Route";
import { GithubPanel, StartDatePicker, ThemeSwitch } from "./Settings";
import { De, Loading, Meter, Ring } from "./ui";

export function DashboardView() {
  const { ready, progress, today, status, repo } = useProgress();
  const [period, setPeriod] = useState<"week" | "month">("week");
  if (!ready) return <Loading />;

  const stats = summary(progress);
  const number = Math.min(Math.max(currentDayNumber(progress, today), 1), TOTAL_DAYS);
  const day = getDay(number);
  const steps = [
    { name: "A1", note: "پیش‌نیاز این کتاب", value: 1 },
    { name: TARGET_LEVEL, note: BOOK_NAME, value: stats.coverage },
  ];

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <h1>برنامه آلمانی {TARGET_LEVEL}</h1>
          <p>
            از {longDate(progress.startDate)} تا {longDate(dayDate(progress, TOTAL_DAYS))}، {storageLabel(status, repo)}
          </p>
        </div>
        <Link prefetch={false} className="button button--strong" href="/">
          برنامه امروز
        </Link>
      </header>

      <Route round={Math.min(day.round, 3) as Round} current={day.lesson} />

      <section className="rings" aria-label="درصد پیشرفت">
        <Ring value={stats.coverage} title={`پوشش سطح ${TARGET_LEVEL}`} caption="بخش‌های Kursbuch که خوانده شده" />
        <Ring value={stats.round1} title="دور اول دوره" caption="همه‌ی فعالیت‌های دور اول" />
      </section>

      <section className="block" aria-labelledby="stats-title">
        <h2 id="stats-title" className="block__title">
          آمار کلی
        </h2>
        <dl className="stats">
          <div>
            <dt>درس‌های تکمیل‌شده</dt>
            <dd>
              {fa(stats.lessonsDone)} از {fa(12)}
            </dd>
          </div>
          <div>
            <dt>مجموع مطالعه</dt>
            <dd>{formatMinutes(stats.minutesDone)}</dd>
          </div>
          <div>
            <dt>مجموع گوش‌دادن</dt>
            <dd>{formatMinutes(stats.listeningDone)}</dd>
          </div>
          <div>
            <dt>روزهای کامل</dt>
            <dd>
              {fa(stats.fullDays)} از {fa(TOTAL_DAYS)}
            </dd>
          </div>
          <div>
            <dt>دور دوم</dt>
            <dd>{faPercent(stats.round2)}</dd>
          </div>
          <div>
            <dt>دور سوم</dt>
            <dd>{faPercent(stats.round3)}</dd>
          </div>
          <div>
            <dt>آمادگی ÖSD</dt>
            <dd>{faPercent(stats.exam)}</dd>
          </div>
        </dl>
      </section>

      <section className="block" aria-labelledby="exam-title">
        <h2 id="exam-title" className="block__title">
          ساختار آزمون ÖSD Zertifikat A2
        </h2>
        <dl className="stats">
          <div>
            <dt>Lesen</dt>
            <dd>۳۰ دقیقه، دو تمرین</dd>
          </div>
          <div>
            <dt>Hören</dt>
            <dd>حدود ۱۵ دقیقه، سه تمرین</dd>
          </div>
          <div>
            <dt>Schreiben</dt>
            <dd>۳۰ دقیقه، ایمیل شخصی</dd>
          </div>
          <div>
            <dt>Sprechen</dt>
            <dd>حدود ۱۰ دقیقه، معرفی و برنامه‌ریزی مشترک</dd>
          </div>
        </dl>
      </section>

      <div className="columns">
        <section className="block" aria-labelledby="ladder-title">
          <h2 id="ladder-title" className="block__title">
            نردبان سطح‌ها
          </h2>
          <ol className="ladder">
            {steps.map((step) => (
              <li key={step.name}>
                <De className="ladder__name">{step.name}</De>
                <div>
                  <span>{step.note}</span>
                  <Meter value={step.value} label={step.name} />
                </div>
                <strong>{faPercent(step.value)}</strong>
              </li>
            ))}
          </ol>
        </section>

        <section className="block" aria-labelledby="books-title">
          <h2 id="books-title" className="block__title">
            پیشرفت هر کتاب
          </h2>
          <ul className="books">
            {bookProgress(progress).map(({ book, done, total }) => (
              <li key={book}>
                <span>
                  <De>{BOOKS[book].name}</De>
                  <span className="books__hint">{BOOKS[book].hint}</span>
                </span>
                <Meter value={ratio(done, total)} label={BOOKS[book].name} />
                <span className="books__count">
                  {fa(done)} از {fa(total)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="block" aria-labelledby="period-title">
        <div className="block__row">
          <h2 id="period-title" className="block__title">
            پیشرفت هفتگی و ماهانه
          </h2>
          <PeriodSwitch value={period} onChange={setPeriod} />
        </div>
        <PeriodMeters periods={period === "week" ? weeklyReport(progress) : monthlyReport(progress)} />
        <Link prefetch={false} className="link-button" href="/reports">
          گزارش کامل
        </Link>
      </section>

      <section className="block" aria-labelledby="settings-title">
        <h2 id="settings-title" className="block__title">
          تنظیمات
        </h2>
        <div className="settings">
          <div className="settings__group">
            <StartDatePicker />
            <ThemeSwitch />
          </div>
          <GithubPanel />
        </div>
      </section>
    </div>
  );
}
