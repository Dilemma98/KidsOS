import { useEffect, useState } from "react";
import "./Memory.css";

type Animal = { emoji: string; name: string };
type Card = Animal & { id: number; pair: number };

const ANIMALS: Animal[] = [
  { emoji: "🐶", name: "hund" },
  { emoji: "🐱", name: "katt" },
  { emoji: "🐰", name: "kanin" },
  { emoji: "🐻", name: "björn" },
  { emoji: "🐸", name: "groda" },
  { emoji: "🐷", name: "gris" },
  { emoji: "🦊", name: "räv" },
  { emoji: "🐮", name: "ko" },
];

function speak(text: string) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "sv-SE";
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* ljud är en bonus, ignorera fel */
  }
}

function buildDeck(pairs: number): Card[] {
  const chosen = [...ANIMALS].sort(() => Math.random() - 0.5).slice(0, pairs);
  const cards = chosen.flatMap((a, pair) => [
    { ...a, pair, id: pair * 2 },
    { ...a, pair, id: pair * 2 + 1 },
  ]);
  return cards.sort(() => Math.random() - 0.5);
}

export default function Memory({
  onBack,
  startPairs,
  sound,
}: {
  onBack: () => void;
  startPairs: number;
  sound: boolean;
}) {
  const [pairs, setPairs] = useState(startPairs);
  const [cards, setCards] = useState<Card[]>(() => buildDeck(startPairs));
  const [flipped, setFlipped] = useState<number[]>([]); // index i cards
  const [matched, setMatched] = useState<number[]>([]); // index i cards

  const won = matched.length === cards.length;

  function newGame(p = pairs) {
    setPairs(p);
    setCards(buildDeck(p));
    setFlipped([]);
    setMatched([]);
  }

  function flip(i: number) {
    if (flipped.length === 2 || flipped.includes(i) || matched.includes(i)) return;

    const next = [...flipped, i];
    setFlipped(next);

    if (next.length === 2) {
      const [a, b] = next;
      if (cards[a].pair === cards[b].pair) {
        setTimeout(() => {
          setMatched((m) => [...m, a, b]);
          setFlipped([]);
          if (sound) speak(cards[a].name);
        }, 500);
      } else {
        setTimeout(() => setFlipped([]), 1100);
      }
    }
  }

  // Läs upp djuret även när man vänder första kortet
  useEffect(() => {
    if (sound && flipped.length === 1) speak(cards[flipped[0]].name);
  }, [flipped, cards, sound]);

  const columns = pairs === 3 ? 3 : 4;

  return (
    <div className="memory-app">
      <header className="memory-header">
        <button className="memory-btn memory-back" onClick={onBack}>
          ← Tillbaka
        </button>
        <h1>🃏 Memory</h1>
        <div className="memory-levels">
          {[3, 4, 6].map((p) => (
            <button
              key={p}
              className={`memory-btn ${p === pairs ? "level-active" : ""}`}
              onClick={() => newGame(p)}
              aria-label={`${p} par`}
            >
              {"🐾".repeat(p === 3 ? 1 : p === 4 ? 2 : 3)}
            </button>
          ))}
        </div>
      </header>

      <div
        className="memory-board"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {cards.map((card, i) => {
          const isUp = flipped.includes(i) || matched.includes(i);
          return (
            <button
              key={card.id}
              className={`memory-card ${isUp ? "is-up" : ""} ${
                matched.includes(i) ? "is-matched" : ""
              }`}
              onClick={() => flip(i)}
              aria-label={isUp ? card.name : "Dolt kort"}
            >
              <span className="card-inner">
                <span className="card-face card-back">♥</span>
                <span className="card-face card-front">{card.emoji}</span>
              </span>
            </button>
          );
        })}
      </div>

      {won && (
        <div className="memory-win" onClick={() => newGame()}>
          <div className="memory-win-box">
            <div className="win-emoji">🎉🐰🎉</div>
            <h2>Bra jobbat, Wera!</h2>
            <button className="memory-btn memory-again">Spela igen</button>
          </div>
        </div>
      )}
    </div>
  );
}