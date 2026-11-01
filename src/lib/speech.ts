"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const synth = () => (typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null);

const germanVoice = () => {
  const voices = synth()?.getVoices() ?? [];
  return voices.find((v) => v.lang === "de-DE") ?? voices.find((v) => v.lang.startsWith("de")) ?? null;
};

// سرویس بدون کلید است و فقط وقتی به کار می‌رود که گوشی صدای آلمانی نداشته باشد.
// این سرویس به درخواست‌های دارای Referer پاسخ نمی‌دهد، پس layout آن را خاموش کرده است.
const onlineSpeechUrl = (text: string) =>
  `https://translate.googleapis.com/translate_tts?ie=UTF-8&tl=de&client=gtx&q=${encodeURIComponent(text)}`;

export function useGermanSpeech() {
  const [failed, setFailed] = useState(false);
  const player = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Safari فهرست صداها را با اولین فراخوانی آماده می‌کند
    synth()?.getVoices();
    return () => {
      synth()?.cancel();
      player.current?.pause();
    };
  }, []);

  const speak = useCallback((text: string) => {
    setFailed(false);
    synth()?.cancel();
    player.current?.pause();

    const voice = germanVoice();
    if (voice) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voice;
      utterance.lang = voice.lang;
      utterance.rate = 0.9;
      utterance.onerror = (event) => {
        if (event.error !== "canceled" && event.error !== "interrupted") setFailed(true);
      };
      synth()?.speak(utterance);
      return;
    }

    const audio = new Audio(onlineSpeechUrl(text));
    player.current = audio;
    audio.onerror = () => setFailed(true);
    audio.play().catch(() => setFailed(true));
  }, []);

  return { speak, failed };
}
