"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { XTRA_TITLES, getLesson, grammarPages, lessonFolder, pdfPage, sectionPages } from "@/data/curriculum";
import { BASE_PATH, BOOK_PDF, contentPath, loadLesson, type LessonContent, type Line, type Word } from "@/lib/content";
import { fa } from "@/lib/dates";
import { useGermanSpeech } from "@/lib/speech";
import { useProgress } from "@/lib/store";
import { De, Plate } from "./ui";

export type ReaderTab = "guide" | "sentences" | "words" | "grammar" | "proverbs" | "dialog";

interface ReaderContextValue {
  open: (lesson: number, tab?: ReaderTab, scroll?: number) => void;
}

const ReaderContext = createContext<ReaderContextValue | null>(null);

interface Target {
  lesson: number;
  tab: ReaderTab;
  scroll: number;
}

export function ReaderProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<Target | null>(null);
  const value = useMemo<ReaderContextValue>(
    () => ({ open: (lesson, tab = "guide", scroll = 0) => setTarget({ lesson, tab, scroll }) }),
    [],
  );
  return (
    <ReaderContext.Provider value={value}>
      {children}
      {target && <Reader key={target.lesson} target={target} onClose={() => setTarget(null)} />}
    </ReaderContext.Provider>
  );
}

export function useReader() {
  const value = useContext(ReaderContext);
  if (!value) throw new Error("useReader must be used inside ReaderProvider");
  return value;
}

function SpeakButton({ text, speak }: { text: string; speak: (text: string) => void }) {
  return (
    <button type="button" className="speak" onClick={() => speak(text)} aria-label={`خواندن با صدا: ${text}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
      </svg>
    </button>
  );
}

function WordCard({ word, speak }: { word: Word; speak: (text: string) => void }) {
  const spoken = word.art ? `${word.art} ${word.de}` : word.de;
  return (
    <li className="word" data-art={word.art ?? "none"}>
      <div>
        <p className="word__de">
          <De>
            {word.art && <span className="word__art">{word.art} </span>}
            {word.de}
            {word.pl && <span className="word__pl">, {word.pl}</span>}
          </De>
        </p>
        <p className="word__fa">{word.fa}</p>
      </div>
      <SpeakButton text={spoken} speak={speak} />
    </li>
  );
}

function Pair({ line, speak, className = "" }: { line: Line; speak: (text: string) => void; className?: string }) {
  return (
    <div className={`pair ${className}`}>
      <div>
        <p className="pair__de">
          <De>{line.de}</De>
        </p>
        <p className="pair__fa">{line.fa}</p>
      </div>
      <SpeakButton text={line.de} speak={speak} />
    </div>
  );
}

function useBookAvailable() {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    fetch(BOOK_PDF, { method: "HEAD" })
      .then((res) => setAvailable(res.ok))
      .catch(() => setAvailable(false));
  }, []);
  return available;
}

function PageLink({ pages, hasBook }: { pages: [number, number]; hasBook: boolean }) {
  const label = pages[0] === pages[1] ? `صفحه ${fa(pages[0])}` : `صفحه ${fa(pages[0])} تا ${fa(pages[1])}`;
  if (!hasBook) return <span className="page-link">{label}</span>;
  return (
    <a className="page-link" href={`${BOOK_PDF}#page=${pdfPage(pages[0])}`} target="_blank" rel="noreferrer">
      باز کردن {label}
    </a>
  );
}

function Guide({ content, lesson, hasBook, speak }: { content: LessonContent; lesson: number; hasBook: boolean; speak: (text: string) => void }) {
  const info = getLesson(lesson);
  const { guide } = content;
  return (
    <div className="guide">
      <p className="guide__osd">
        <strong>برای آزمون ÖSD:</strong> {guide.osd}
      </p>
      <section className="guide__item">
        <header>
          <h3>صفحه‌ی آغاز درس</h3>
          <PageLink pages={[info.page, info.page]} hasBook={hasBook} />
        </header>
        <p>{guide.starten}</p>
      </section>
      {info.sections.map((section, i) => (
        <section key={section.key} className="guide__item" data-section={section.key}>
          <header>
            <h3>
              <span className="sentence__key">{section.key}</span>
              <De>{section.title}</De>
            </h3>
            <PageLink pages={sectionPages(info, i)} hasBook={hasBook} />
          </header>
          <p>{guide.sections[section.key]}</p>
        </section>
      ))}
      <section className="guide__item">
        <header>
          <h3>
            <De>Grammatik Xpress</De>
          </h3>
          <PageLink pages={grammarPages(info)} hasBook={hasBook} />
        </header>
        <p>
          <De>{info.grammar.join("; ")}</De>
        </p>
      </section>
      <section className="guide__item">
        <header>
          <h3>
            <De>Xtra Lesen: {XTRA_TITLES[lesson]}</De>
          </h3>
          <PageLink pages={[info.endPage, info.endPage]} hasBook={hasBook} />
        </header>
        <p>{guide.xtra}</p>
      </section>
      <section className="group">
        <h3 className="group__title">عبارت‌های کلیدی کتاب</h3>
        <ul className="stack">
          {guide.phrases.map((line) => (
            <li key={line.de} className="sentence" data-section="B">
              <Pair line={line} speak={speak} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export const TAB_NAMES: Record<ReaderTab, string> = {
  guide: "راهنمای کتاب",
  sentences: "جملات",
  words: "لغات",
  grammar: "گرامر",
  proverbs: "ضرب‌المثل‌ها",
  dialog: "مکالمه",
};

const TABS: { key: ReaderTab; label: string; count: (c: LessonContent) => number }[] = [
  { key: "guide", label: TAB_NAMES.guide, count: (c) => Object.keys(c.guide.sections).length },
  { key: "sentences", label: TAB_NAMES.sentences, count: (c) => c.sentences.length },
  { key: "words", label: TAB_NAMES.words, count: (c) => c.words.length },
  { key: "grammar", label: TAB_NAMES.grammar, count: (c) => c.grammar.length },
  { key: "proverbs", label: TAB_NAMES.proverbs, count: (c) => c.proverbs.length },
  { key: "dialog", label: TAB_NAMES.dialog, count: (c) => c.dialog.lines.length },
];

function Reader({ target, onClose }: { target: Target; onClose: () => void }) {
  const { lesson } = target;
  const info = getLesson(lesson);
  const [tab, setTab] = useState(target.tab);
  const [content, setContent] = useState<LessonContent | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const position = useRef(target.scroll);
  const currentTab = useRef(target.tab);
  const { speak, failed: speechFailed } = useGermanSpeech();
  const { saveSpot } = useProgress();
  const hasBook = useBookAvailable();

  useEffect(() => {
    let active = true;
    setFailed(false);
    loadLesson(lesson)
      .then((data) => active && setContent(data))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [lesson, attempt]);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    // در Safari آیفون overflow به‌تنهایی اسکرول صفحه‌ی زیرین را قفل نمی‌کند
    const { style } = document.body;
    const scrollY = window.scrollY;
    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.left = "0";
    style.right = "0";
    closeButton.current?.focus({ preventScroll: true });
    return () => {
      style.position = "";
      style.top = "";
      style.left = "";
      style.right = "";
      window.scrollTo(0, scrollY);
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    if (content && body.current && target.tab === currentTab.current) body.current.scrollTop = target.scroll;
  }, [content, target]);

  // جای مطالعه هنگام بستن درس یا رفتن از اپ ثبت می‌شود، نه با هر اسکرول
  useEffect(() => {
    const save = () => saveSpot({ lesson, tab: currentTab.current, scroll: Math.round(position.current), at: Date.now() });
    const onHide = () => {
      if (document.visibilityState === "hidden") save();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      save();
    };
  }, [lesson, saveSpot]);

  const chooseTab = (next: ReaderTab) => {
    currentTab.current = next;
    position.current = 0;
    setTab(next);
    if (body.current) body.current.scrollTop = 0;
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") onClose();
    if (event.key !== "Tab" || !panel.current) return;
    const focusable = panel.current.querySelectorAll<HTMLElement>("button, audio[controls], a[href]");
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className="reader"
      role="dialog"
      aria-modal="true"
      aria-label={`متن درس ${fa(lesson)}`}
      ref={panel}
      onKeyDown={onKeyDown}
    >
      <header className="reader__head">
        <div className="reader__title">
          <Plate n={lesson} folder={lessonFolder(lesson)} />
          <div>
            <h2>
              <De>{info.title}</De>
            </h2>
            <p className="reader__path">
              <bdi>{contentPath(lesson)}</bdi>
            </p>
          </div>
        </div>
        <div className="reader__tools">
          <button type="button" className="button" ref={closeButton} onClick={onClose}>
            بستن
          </button>
        </div>
      </header>

      {content && (
        <div className="reader__tabs" role="tablist" aria-label="بخش‌های متن درس">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={tab === item.key}
              onClick={() => chooseTab(item.key)}
            >
              {item.label}
              <span className="count">{fa(item.count(content))}</span>
            </button>
          ))}
        </div>
      )}

      <div className="reader__body" ref={body} onScroll={(e) => (position.current = e.currentTarget.scrollTop)}>
        {failed && (
          <div className="notice">
            <h2>متن این درس باز نشد</h2>
            <p>اتصال اینترنت را بررسی کن و دوباره امتحان کن.</p>
            <button type="button" className="button" onClick={() => setAttempt((n) => n + 1)}>
              تلاش دوباره
            </button>
          </div>
        )}
        {!failed && !content && (
          <p className="state" role="status">
            در حال بارگذاری متن درس
          </p>
        )}
        {content && (
          <>
            <p className="reader__source">
              {tab === "guide"
                ? "خلاصه‌ی فارسی از روی کتاب؛ متن کامل را در صفحه‌ی مشخص‌شده‌ی کتاب بخوان."
                : "جمله‌ها برای تمرین همین موضوع نوشته شده‌اند و لغات از موضوع‌های کتاب‌اند."}
            </p>
            {content.audio && (
              <audio className="reader__audio" controls src={`${BASE_PATH}/${content.audio}`} />
            )}
            {speechFailed && (
              <p className="error" role="alert">
                صدا پخش نشد. اینترنت را بررسی کن و دوباره بزن.
              </p>
            )}

            {tab === "guide" && <Guide content={content} lesson={lesson} hasBook={hasBook} speak={speak} />}
            {tab === "sentences" &&
              info.sections.map((section) => (
                <section key={section.key} className="group" data-section={section.key}>
                  <h3 className="group__title">
                    <span className="sentence__key">{section.key}</span>
                    <De>{section.title}</De>
                  </h3>
                  <ul className="stack">
                    {content.sentences
                      .filter((line) => line.section === section.key)
                      .map((line) => (
                        <li key={line.de} className="sentence">
                          <Pair line={line} speak={speak} />
                        </li>
                      ))}
                  </ul>
                </section>
              ))}
            {tab === "words" && (
              <>
                <ul className="legend" aria-label="راهنمای رنگ لغات">
                  <li data-art="der">
                    <De>der</De>
                  </li>
                  <li data-art="die">
                    <De>die</De>
                  </li>
                  <li data-art="das">
                    <De>das</De>
                  </li>
                  <li data-art="none">بدون حرف تعریف</li>
                </ul>
                {info.vocab.map((topic) => (
                  <section key={topic} className="group">
                    <h3 className="group__title">
                      <De>{topic}</De>
                    </h3>
                    <ul className="words">
                      {content.words
                        .filter((word) => word.topic === topic)
                        .map((word) => (
                          <WordCard key={word.de} word={word} speak={speak} />
                        ))}
                    </ul>
                  </section>
                ))}
              </>
            )}
            {tab === "grammar" && (
              <ul className="stack">
                {content.grammar.map((note) => (
                  <li key={note.title} className="grammar">
                    <h3>
                      <De>{note.title}</De>
                    </h3>
                    <p>{note.fa}</p>
                    {note.examples.map((example) => (
                      <Pair key={example.de} line={example} speak={speak} />
                    ))}
                  </li>
                ))}
              </ul>
            )}
            {tab === "proverbs" && (
              <ul className="stack">
                {content.proverbs.map((line) => (
                  <li key={line.de} className="proverb">
                    <Pair line={line} speak={speak} />
                  </li>
                ))}
              </ul>
            )}
            {tab === "dialog" && (
              <section>
                <h3 className="dialog__title">{content.dialog.title}</h3>
                <ul className="dialog">
                  {content.dialog.lines.map((line) => (
                    <li key={`${line.who}-${line.de}`} data-side={line.who === content.dialog.lines[0].who ? "a" : "b"}>
                      <De className="dialog__who">{line.who}</De>
                      <Pair line={line} speak={speak} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
