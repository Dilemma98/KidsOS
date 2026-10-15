
import { useEffect, useRef, useState } from "react";
import "./MusicStudio.css";

interface MusicStudioProps {
  onBack: () => void;
}

type Instrument = {
  name: string;
  emoji: string;
  description: string;
  wave: OscillatorType;
};

const instruments: Instrument[] = [
  {
    name: "Piano",
    emoji: "🎹",
    description: "Mjuka pianotoner",
    wave: "triangle",
  },
  {
    name: "Klockspel",
    emoji: "🎐",
    description: "Glittriga toner",
    wave: "sine",
  },
  {
    name: "Synth",
    emoji: "🎛️",
    description: "Elektroniska ljud",
    wave: "square",
  },
];

const notes = [
  { name: "C", label: "Do", frequency: 261.63, color: "pink" },
  { name: "D", label: "Re", frequency: 293.66, color: "peach" },
  { name: "E", label: "Mi", frequency: 329.63, color: "yellow" },
  { name: "F", label: "Fa", frequency: 349.23, color: "green" },
  { name: "G", label: "Sol", frequency: 392.0, color: "blue" },
  { name: "A", label: "La", frequency: 440.0, color: "purple" },
  { name: "B", label: "Ti", frequency: 493.88, color: "pink" },
  { name: "C²", label: "Do", frequency: 523.25, color: "peach" },
];

export default function MusicStudio({ onBack }: MusicStudioProps) {
  const audioRef = useRef<AudioContext | null>(null);
  const [selectedInstrument, setSelectedInstrument] =
    useState<Instrument>(instruments[0]);
  const [lastNote, setLastNote] = useState("Tryck på en tangent!");
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    return () => {
      void audioRef.current?.close();
      audioRef.current = null;
    };
  }, []);

  function playNote(frequency: number, noteName: string) {
    const AudioContextClass = window.AudioContext;

    if (!AudioContextClass) {
      setLastNote("Ljud stöds inte i den här webbläsaren.");
      return;
    }

    const context =
      audioRef.current ?? new AudioContextClass();

    audioRef.current = context;

    if (context.state === "suspended") {
      void context.resume();
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = selectedInstrument.wave;
    oscillator.frequency.setValueAtTime(
      frequency,
      context.currentTime,
    );

    gain.gain.setValueAtTime(
      Math.max(0.001, volume * 0.2),
      context.currentTime,
    );
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + 0.8,
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.8);

    setLastNote(`${noteName} 🎵`);
  }

  return (
    <main className="music-studio">
      <header className="music-header">
        <button
          type="button"
          className="music-back"
          onClick={onBack}
        >
          ← Tillbaka
        </button>

        <div className="music-title">
          <span className="music-title-icon">🎵</span>
          <div>
            <h1>Min musikstudio</h1>
            <p>Tryck, spela och skapa musik!</p>
          </div>
        </div>

        <div className="music-note-display" aria-live="polite">
          {lastNote}
        </div>
      </header>

      <section className="instrument-section">
        <h2>🎨 Välj instrument</h2>
        <div className="instrument-list">
          {instruments.map((instrument) => (
            <button
              key={instrument.name}
              type="button"
              className={`instrument-card ${
                selectedInstrument.name === instrument.name
                  ? "selected"
                  : ""
              }`}
              onClick={() => setSelectedInstrument(instrument)}
              aria-pressed={selectedInstrument.name === instrument.name}
            >
              <span className="instrument-emoji">
                {instrument.emoji}
              </span>
              <strong>{instrument.name}</strong>
              <span>{instrument.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="piano-section">
        <div className="piano-heading">
          <div>
            <h2>🎹 Mitt piano</h2>
            <p>Tryck på tangenterna för att spela!</p>
          </div>
          <span className="piano-sparkle">✨</span>
        </div>

        <div className="piano-keys">
          {notes.map((note, index) => (
            <button
              key={`${note.name}-${index}`}
              type="button"
              className={`piano-key ${note.color}`}
              onPointerDown={() =>
                playNote(note.frequency, note.label)
              }
              aria-label={`Spela ${note.label}`}
            >
              <span className="key-note">{note.name}</span>
              <span className="key-label">{note.label}</span>
            </button>
          ))}
        </div>

        <div className="volume-control">
          <label htmlFor="music-volume">
            🔊 Ljudstyrka
          </label>
          <input
            id="music-volume"
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={volume}
            onChange={(event) =>
              setVolume(Number(event.target.value))
            }
          />
        </div>
      </section>

      <footer className="music-footer">
        <span>🌈</span>
        <p>Alla kan skapa musik – även du!</p>
        <span>💗</span>
      </footer>
    </main>
  );
}
