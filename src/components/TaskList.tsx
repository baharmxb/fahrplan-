"use client";

import { fa, shortDate } from "@/lib/dates";
import { BOOKS, type Task } from "@/lib/plan";
import { dayDate, isDone, reviewState } from "@/lib/progress";
import { useProgress } from "@/lib/store";
import { useReader, type ReaderTab } from "./Reader";
import { De } from "./ui";

function TaskRow({ task, carried }: { task: Task; carried?: boolean }) {
  const { progress, today, toggle } = useProgress();
  const { open } = useReader();
  const done = isDone(progress, task.id);
  const inputId = `task-${task.id}`;
  const locked = task.book === "review" && !done && reviewState(progress, task, today).kind !== "open";
  const tab: ReaderTab | null = task.book === "kursbuch" ? "guide" : task.book === "grammatik" ? "grammar" : null;

  return (
    <li className="task" data-done={done || undefined} data-carried={carried || undefined} data-book={task.book}>
      <input id={inputId} type="checkbox" checked={done} disabled={locked} onChange={() => toggle(task.id)} />
      <div className="task__body">
        <label htmlFor={inputId}>
          <span className="task__label">{task.label}</span>
          {task.de && <De className="task__de">{task.de}</De>}
        </label>
        {task.noteDe && (
          <p className="task__note">
            <De>{task.noteDe}</De>
          </p>
        )}
        {task.note && <p className="task__note">{locked ? "بعد از تکمیل این سه درس باز می‌شود." : task.note}</p>}
        {carried && (
          <p className="task__carried">
            منتقل‌شده از روز {fa(task.day)}، {shortDate(dayDate(progress, task.day))}
          </p>
        )}
      </div>
      <div className="task__meta">
        <De className="task__book">{BOOKS[task.book].name}</De>
        {task.pages && (
          <span>
            {task.pages[0] === task.pages[1]
              ? `صفحه ${fa(task.pages[0])}`
              : `صفحه ${fa(task.pages[0])} تا ${fa(task.pages[1])}`}
          </span>
        )}
        <span>{fa(task.minutes)} دقیقه</span>
      </div>
      <div className="task__actions">
        {tab && task.lesson && (
          <button type="button" className="link-button" onClick={() => open(task.lesson!, tab)}>
            باز کردن متن
          </button>
        )}
        {task.reviewOf?.map((n) => (
          <button key={n} type="button" className="link-button" onClick={() => open(n, task.book === "grammatik" ? "grammar" : "words")}>
            درس {fa(n)}
          </button>
        ))}
      </div>
    </li>
  );
}

export function TaskList({ tasks, carried }: { tasks: Task[]; carried?: boolean }) {
  return (
    <ol className="timetable">
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} carried={carried} />
      ))}
    </ol>
  );
}
