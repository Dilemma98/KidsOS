import { useEffect, useRef, useState } from "react";
import "./Bubbles.css";

type Bubble = {
  id: number;
  x: number;
  size: number;
  duration: number;
  hue: number;
  letter: string;
  popping: boolean;
};

const LETTERS: { letter: string; word: string }[] = [
  { letter: "A", word: "apa" },
  { letter: "B", word: "bil" },
  { letter: "C", word: "citron" },
  { letter: "D", word: "dörr" },
  { letter: "E", word: "ekorre" },
  { letter: "F", word: "fisk" },
  { letter: "G", word: "gris" },
  { letter: "H", word: "hund" },
  { letter: "I", word: "igelkott" },
  { letter: "J", word: "jordgubbe" },
  { letter: "K", word: "katt" },
  { letter: "L", word: "lejon" },
  { letter: "M", word: "mus" },
  { letter: "N", word: "näsa" },
  { letter: "O", word: "orm" },
  { letter: "P", word: "pappa" },
  { letter: "R", word: "räv" },
  { letter: "S", word: "sol" },
  { letter: "T", word: "tåg" },
  { letter: "U", word: "uggla" },
  { letter: "V", word: "val" },
  { letter: "W", word: "Wera" },
  { letter: "X", word: "xylofon" },
  { letter: "Y", word: "yxa" },
  { letter: "Z", word: "zebra" },
  { letter: "Å", word: "ål" },
  { letter: "Ä", word: "äpple" },
  { letter: "Ö", word: "öga" },
];

// Multiplikator på flygtiden: högre = långsammare
const SPEED = { lugn: 1.4, normal: 1, snabb: 0.7 };

function speak(text: string) {
  try {
    const synth = window.speechSynthesis;
    synth.cancel();

    const u = new SpeechSynthesisUtterance(text);
    const voice = synth
      .getVoices()
      .find((v) => v.lang.toLowerCase().startsWith("sv"));
    if (voice) u.voice = voice;
    u.lang = "sv-SE";
    u.rate = 0.8;

    // Liten paus efter cancel(), annars hoppar vissa webbläsare över ljudet
    setTimeout(() => synth.speak(u), 60);
  } catch {
    /* ljud är en bonus */
  }
}

export default function Bubbles({
  onBack,
  sound,
  speed,
}: {
  onBack: () => void;
  sound: boolean;
  speed: "lugn" | "normal" | "snabb";
}) {
  const factor = SPEED[speed];
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [count, setCount] = useState(0);
  const nextId = useRef(0);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    try {
      synth.getVoices();
      synth.onvoiceschanged = () => synth.getVoices();
    } catch {
      /* ignorera */
    }
    return () => {
      try {
        synth.onvoiceschanged = null;
        synth.cancel();
      } catch {
        /* ignorera */
      }
    };
  }, []);

  function playPop() {
    try {
      if (!audioRef.current) {
        audioRef.current = new AudioContext();
      }
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = 500 + Math.random() * 500;
      osc.type = "sine";
      osc.frequency.setValueAtTime(start, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        start * 2.2,
        ctx.currentTime + 0.08,
      );
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {
      /* tyst om det inte går */
    }
  }

  // Skapa en ny bubbla med jämna mellanrum
  useEffect(() => {
    const spawn = () => {
      setBubbles((list) => {
        if (list.length >= 10) return list;
        const size = 90 + Math.random() * 70;
        const bubble: Bubble = {
          id: nextId.current++,
          x: Math.random() * (100 - 18),
          size,
          duration: (14 + Math.random() * 8) * factor,
          hue: Math.floor(Math.random() * 360),
          letter: LETTERS[Math.floor(Math.random() * LETTERS.length)].letter,
          popping: false,
        };
        return [...list, bubble];
      });
    };

    // några direkt, så skärmen inte är tom
    spawn();
    const first = setTimeout(spawn, 400);
    const timer = setInterval(spawn, 1100);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [factor]);

  function pop(id: number, letter: string) {
    if (sound) playPop();
    setBubbles((list) =>
      list.map((b) => (b.id === id ? { ...b, popping: true } : b)),
    );
    setCount((c) => c + 1);

    const entry = LETTERS.find((l) => l.letter === letter);
    if (entry && sound) {
      speak(`${entry.letter}. ${entry.letter} som i ${entry.word}`);
    }

    setTimeout(() => {
      setBubbles((list) => list.filter((b) => b.id !== id));
    }, 350);
  }

  function remove(id: number) {
    setBubbles((list) => list.filter((b) => b.id !== id));
  }

  return (
    <div className="bubbles-app">
      <header className="bubbles-header">
        <button className="bubbles-btn bubbles-back" onClick={onBack}>
          ← Tillbaka
        </button>
        <h1>🫧 Bubblor</h1>
        <div className="bubbles-count" aria-label={`${count} poppade`}>
          ⭐ {count}
        </div>
      </header>

      <div className="bubbles-field">
        {bubbles.map((b) => (
          <div
            key={b.id}
            className="bubble-wrap"
            style={{
              left: `${b.x}%`,
              width: b.size,
              height: b.size,
              animationDuration: `${b.duration}s`,
            }}
            onAnimationEnd={(e) => {
              if (e.animationName === "bubble-float") remove(b.id);
            }}
          >
            <button
              className={`bubble ${b.popping ? "is-popping" : ""}`}
              style={{ ["--hue" as string]: b.hue }}
              onPointerDown={() => !b.popping && pop(b.id, b.letter)}
              aria-label={`Bokstaven ${b.letter}`}
            >
              <span className="bubble-letter">{b.letter}</span>
              <span className="bubble-burst">✦</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}