import type { ReactNode } from "react";
import { fa, faPercent } from "@/lib/dates";

// متن آلمانی همیشه جهت و زبان مستقل دارد تا علامت‌های پایان جمله جابه‌جا نشوند
export function De({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span lang="de" dir="ltr" className={`de ${className}`}>
      {children}
    </span>
  );
}

export function Plate({ n, folder, size = "md" }: { n: number; folder?: number; size?: "md" | "lg" }) {
  return (
    <span className={`plate plate--${size}`} data-folder={folder}>
      {fa(n)}
    </span>
  );
}

export function Loading() {
  return (
    <p className="state" role="status">
      در حال بارگذاری برنامه
    </p>
  );
}

export function Notice({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <section className="notice">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function Meter({ value, label }: { value: number; label: string }) {
  return (
    <span
      className="meter"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
    >
      <span className="meter__fill" style={{ inlineSize: `${value * 100}%` }} />
    </span>
  );
}

export function Ring({ value, title, caption }: { value: number; title: string; caption: string }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  return (
    <figure className="ring">
      <svg viewBox="0 0 120 120" role="img" aria-label={`${title}: ${faPercent(value)}`}>
        <circle className="ring__track" cx="60" cy="60" r={radius} />
        <circle
          className="ring__value"
          cx="60"
          cy="60"
          r={radius}
          strokeDasharray={`${value * circumference} ${circumference}`}
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="60" className="ring__text">
          {faPercent(value)}
        </text>
      </svg>
      <figcaption>
        <strong>{title}</strong>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}
