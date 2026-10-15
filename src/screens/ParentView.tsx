import { useState } from "react";
import type { FormEvent } from "react";
import { DEFAULTS } from "../useSettings";
import type { Settings } from "../useSettings";
import "./ParentView.css";

type Props = {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  apps: { name: string; icon: string }[];
  onClose: () => void;
  onEditRoutines: () => void;
};

function Switch({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`switch ${on ? "is-on" : ""}`}
      onClick={() => onChange(!on)}
    >
      <span className="switch-knob" />
    </button>
  );
}

function Choice<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="choice">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          className={o.value === value ? "is-active" : ""}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function ParentView({ settings, update, apps, onClose, onEditRoutines }: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [answer, setAnswer] = useState("");
  const [wrong, setWrong] = useState(false);
  const [q] = useState(() => ({
    a: 4 + Math.floor(Math.random() * 6),
    b: 3 + Math.floor(Math.random() * 6),
  }));

  function check(e: FormEvent) {
    e.preventDefault();
    if (Number(answer) === q.a + q.b) {
      setUnlocked(true);
    } else {
      setWrong(true);
      setAnswer("");
    }
  }

  const toggleApp = (name: string, show: boolean) =>
    update({
      hiddenApps: show
        ? settings.hiddenApps.filter((n) => n !== name)
        : [...settings.hiddenApps, name],
    });

  if (!unlocked) {
    return (
      <section className="parent-view">
        <div className="parent-bunny">🔒</div>
        <span className="eyebrow">💜 VUXENHÖRNAN 💜</span>
        <h1>Bara för vuxna</h1>
        <form className="parent-gate" onSubmit={check}>
          <label htmlFor="gate">
            Vad är {q.a} + {q.b}?
          </label>
          <input
            id="gate"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setWrong(false);
            }}
          />
          {wrong && <p className="gate-wrong">Fel svar, försök igen.</p>}
          <button type="submit" className="back-button">
            Öppna
          </button>
        </form>
        <button className="back-button" onClick={onClose}>
          ← Tillbaka till KidsOS
        </button>
      </section>
    );
  }

  return (
    <section className="parent-view">
      <div className="parent-bunny">🐰</div>
      <span className="eyebrow">💜 VUXENHÖRNAN 💜</span>
      <h1>Hej, förälder!</h1>

      <div className="parent-panel">
        <h2>👧 Barnet</h2>
        <div className="setting-row">
          <label htmlFor="childName">Namn på startsidan</label>
          <input
            id="childName"
            className="text-input"
            value={settings.childName}
            maxLength={20}
            onChange={(e) => update({ childName: e.target.value })}
          />
        </div>
      </div>

      <div className="parent-panel">
        <h2>📱 Appar på startsidan</h2>
        {apps.map((app) => (
          <div className="setting-row" key={app.name}>
            <span>
              {app.icon} {app.name}
            </span>
            <Switch
              label={`Visa ${app.name}`}
              on={!settings.hiddenApps.includes(app.name)}
              onChange={(show) => toggleApp(app.name, show)}
            />
          </div>
        ))}
      </div>

      <div className="parent-panel">
        <h2>🎮 Spel och ljud</h2>
        <div className="setting-row">
          <span>🔊 Ljud</span>
          <Switch
            label="Ljud"
            on={settings.sound}
            onChange={(sound) => update({ sound })}
          />
        </div>
        <div className="setting-row">
          <span>🫧 Bubblornas fart</span>
          <Choice
            value={settings.bubbleSpeed}
            onChange={(bubbleSpeed) => update({ bubbleSpeed })}
            options={[
              { value: "lugn", label: "Lugn" },
              { value: "normal", label: "Normal" },
              { value: "snabb", label: "Snabb" },
            ]}
          />
        </div>
        <div className="setting-row">
          <span>🃏 Memory, antal par</span>
          <Choice
            value={settings.memoryPairs}
            onChange={(memoryPairs) => update({ memoryPairs })}
            options={[
              { value: 3, label: "3" },
              { value: 4, label: "4" },
              { value: 6, label: "6" },
            ]}
          />
        </div>
      </div>
      <div className="parent-panel">
  <h2>🌞 Min dag</h2>
  <p className="setting-help">
    Anpassa vilka rutiner som visas i {settings.childName} dagslista.
  </p>

  <button
    type="button"
    className="back-button"
    onClick={onEditRoutines}
  >
    ✏️ Hantera rutiner
  </button>
</div>

      <div className="parent-panel">
        <h2>🌤️ Väder</h2>
        <div className="setting-row">
          <span>Använd plattans plats</span>
          <Switch
            label="Använd plattans plats"
            on={settings.useLocation}
            onChange={(useLocation) => update({ useLocation })}
          />
        </div>
        <p className="setting-help">
          Av = vädret visas alltid för reservplatsen i koden.
        </p>
      </div>

      <p className="parent-warning">
        Obs! Frågan i början är bara en enkel spärr mot små fingrar, inte ett
        riktigt lås. Använd "Fästa skärmen" (Android) eller "Guidad åtkomst"
        (iPad) för att hålla henne kvar i KidsOS.
      </p>

      <div className="parent-actions">
        <button className="back-button" onClick={onClose}>
          ← Tillbaka till KidsOS
        </button>
        <button
          className="back-button reset-button"
          onClick={() => {
            if (window.confirm("Återställa alla inställningar?")) {
              update(DEFAULTS);
            }
          }}
        >
          Återställ allt
        </button>
      </div>
    </section>
  );
}