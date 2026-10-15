import { useEffect, useState, type FormEvent } from "react";
import "./MyDay.css";

interface MyDayProps {
  onBack: () => void;
  editable?: boolean;
  startEditing?: boolean;
}

type Period = "morning" | "day" | "evening";

interface Activity {
  id: string;
  title: string;
  description: string;
  emoji: string;
  period: Period;
}

interface SavedProgress {
  date: string;
  completed: string[];
}

const ROUTINES_KEY = "kidsos-my-day-routines-v1";
const PROGRESS_KEY = "kidsos-my-day-v1";

const defaultActivities: Activity[] = [
  {
    id: "get-dressed",
    title: "Klä på mig",
    description: "Ta på dagens kläder",
    emoji: "👗",
    period: "morning",
  },
  {
    id: "breakfast",
    title: "Äta frukost",
    description: "Fylla magen med energi",
    emoji: "🥣",
    period: "morning",
  },
  {
    id: "brush-teeth-morning",
    title: "Borsta tänderna",
    description: "Göra tänderna rena",
    emoji: "🪥",
    period: "morning",
  },
  {
    id: "play",
    title: "Dags att leka!",
    description: "Lek och ha roligt",
    emoji: "🧸",
    period: "day",
  },
  {
    id: "eat-lunch",
    title: "Äta lunch",
    description: "Dags för god mat",
    emoji: "🍝",
    period: "day",
  },
  {
    id: "tidy-up",
    title: "Plocka undan",
    description: "Hjälpa till lite",
    emoji: "🧺",
    period: "day",
  },
  {
    id: "put-on-pyjamas",
    title: "Ta på pyjamas",
    description: "Göra mig redo för kvällen",
    emoji: "🌙",
    period: "evening",
  },
  {
    id: "brush-teeth-evening",
    title: "Borsta tänderna",
    description: "Borsta en sista gång",
    emoji: "🦷",
    period: "evening",
  },
  {
    id: "bedtime-story",
    title: "Sagostund",
    description: "Varva ner och mysa",
    emoji: "📚",
    period: "evening",
  },
];

const periods: {
  id: Period;
  title: string;
  emoji: string;
  description: string;
}[] = [
  {
    id: "morning",
    title: "God morgon!",
    emoji: "🌞",
    description: "Vi börjar dagen tillsammans",
  },
  {
    id: "day",
    title: "Under dagen",
    emoji: "🌈",
    description: "Lek, ät och upptäck",
  },
  {
    id: "evening",
    title: "God kväll!",
    emoji: "🌙",
    description: "Dags att varva ner",
  },
];

function getToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadRoutines(): Activity[] {
  try {
    const saved = localStorage.getItem(ROUTINES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Activity[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    console.error("Kunde inte läsa rutiner:", error);
  }

  return defaultActivities;
}

function loadProgress(): SavedProgress {
  try {
    const saved = localStorage.getItem(PROGRESS_KEY);

    if (saved) {
      const parsed = JSON.parse(saved) as SavedProgress;
      if (parsed.date === getToday()) return parsed;
    }
  } catch (error) {
    console.error("Kunde inte läsa dagens framsteg:", error);
  }

  return { date: getToday(), completed: [] };
}

export default function MyDay({
  onBack,
  editable = false,
  startEditing = false,
}: MyDayProps) {
  const [routines, setRoutines] = useState<Activity[]>(loadRoutines);
  const [progress, setProgress] = useState<SavedProgress>(loadProgress);
  const [editing, setEditing] = useState(startEditing);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("⭐");
  const [period, setPeriod] = useState<Period>("morning");

  useEffect(() => {
    try {
      localStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
    } catch (error) {
      console.error("Kunde inte spara rutiner:", error);
    }
  }, [routines]);

  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error("Kunde inte spara dagens framsteg:", error);
    }
  }, [progress]);

  function toggleActivity(id: string) {
    setProgress((previous) => {
      const completed = previous.completed.includes(id)
        ? previous.completed.filter((item) => item !== id)
        : [...previous.completed, id];

      return { date: getToday(), completed };
    });
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setEmoji("⭐");
    setPeriod("morning");
  }

  function editRoutine(activity: Activity) {
    setEditingId(activity.id);
    setTitle(activity.title);
    setDescription(activity.description);
    setEmoji(activity.emoji);
    setPeriod(activity.period);
  }

  function saveRoutine(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    if (editingId) {
      setRoutines((previous) =>
        previous.map((activity) =>
          activity.id === editingId
            ? {
                ...activity,
                title: cleanTitle,
                description: description.trim(),
                emoji: emoji.trim() || "⭐",
                period,
              }
            : activity,
        ),
      );
    } else {
      const newRoutine: Activity = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title: cleanTitle,
        description: description.trim(),
        emoji: emoji.trim() || "⭐",
        period,
      };

      setRoutines((previous) => [...previous, newRoutine]);
    }

    resetForm();
  }

  function deleteRoutine(id: string) {
    const confirmed = window.confirm("Vill du ta bort den här rutinen?");
    if (!confirmed) return;

    setRoutines((previous) => previous.filter((item) => item.id !== id));
    setProgress((previous) => ({
      ...previous,
      completed: previous.completed.filter((item) => item !== id),
    }));

    if (editingId === id) resetForm();
  }

  const completedCount = routines.filter((activity) =>
    progress.completed.includes(activity.id),
  ).length;

  const percentage =
    routines.length === 0
      ? 0
      : Math.round((completedCount / routines.length) * 100);

  return (
    <main className="my-day">
      <header className="my-day-header">
        <button type="button" className="my-day-back" onClick={onBack}>
          ← Tillbaka
        </button>

        <div className="my-day-title">
          <span>🌞</span>
          <div>
            <h1>Min dag</h1>
            <p>En sak i taget, du klarar det!</p>
          </div>
        </div>

        {editable && (
          <button
            type="button"
            className="routine-settings-button"
            onClick={() => {
              setEditing((previous) => !previous);
              resetForm();
            }}
          >
            {editing ? "✓ Klar" : "⚙️ Ändra rutiner"}
          </button>
        )}
      </header>

      {editing ? (
        <section className="routine-editor">
          <h2>🌷 Anpassa din dag</h2>
          <p className="routine-editor-intro">
            Lägg till rutiner som passar just er vardag.
          </p>

          <form className="routine-form" onSubmit={saveRoutine}>
            <label>
              Vad ska rutinen heta?
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Till exempel: Packa väskan"
                required
                maxLength={50}
              />
            </label>

            <label>
              Beskrivning (valfritt)
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Till exempel: Lägg ner vattenflaskan"
                maxLength={100}
              />
            </label>

            <label>
              Välj en emoji
              <input
                value={emoji}
                onChange={(event) => setEmoji(event.target.value)}
                placeholder="⭐"
                maxLength={8}
              />
            </label>

            <label>
              När ska rutinen göras?
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value as Period)}
              >
                <option value="morning">🌞 Morgon</option>
                <option value="day">🌈 Under dagen</option>
                <option value="evening">🌙 Kväll</option>
              </select>
            </label>

            <div className="routine-form-actions">
              <button type="submit" className="routine-save-button">
                {editingId ? "Spara ändringar" : "＋ Lägg till rutin"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="routine-cancel-button"
                  onClick={resetForm}
                >
                  Avbryt redigering
                </button>
              )}
            </div>
          </form>

          <h3 className="routine-list-heading">Dina rutiner</h3>

          {routines.length === 0 && (
            <p>Du har inga rutiner ännu. Lägg till en ovan! 💗</p>
          )}

          <div className="routine-management-list">
            {routines.map((activity) => (
              <div className="routine-management-item" key={activity.id}>
                <span className="routine-management-emoji">
                  {activity.emoji}
                </span>

                <div className="routine-management-copy">
                  <strong>{activity.title}</strong>
                  <span>
                    {periods.find((item) => item.id === activity.period)?.title}
                  </span>
                </div>

                <button
                  type="button"
                  className="routine-edit-button"
                  onClick={() => editRoutine(activity)}
                  aria-label={`Redigera ${activity.title}`}
                >
                  ✏️
                </button>

                <button
                  type="button"
                  className="routine-delete-button"
                  onClick={() => deleteRoutine(activity.id)}
                  aria-label={`Ta bort ${activity.title}`}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <>
          <section className="my-day-progress">
            <div className="progress-message">
              <div>
                <h2>Heja dig! 💗</h2>
                <p>
                  Du har klarat {completedCount} av {routines.length} saker!
                </p>
              </div>
              <div className="progress-stars">⭐ {completedCount}</div>
            </div>

            <div
              className="progress-track"
              role="progressbar"
              aria-label="Dagens framsteg"
              aria-valuemin={0}
              aria-valuemax={routines.length}
              aria-valuenow={completedCount}
            >
              <div
                className="progress-fill"
                style={{ width: `${percentage}%` }}
              />
            </div>

            {routines.length > 0 && completedCount === routines.length ? (
              <p className="all-done">🎉 Hurra! Du har klarat allt idag!</p>
            ) : (
              <p className="progress-hint">
                Varje liten sak är ett stort steg! 🌷
              </p>
            )}
          </section>

          <div className="my-day-periods">
            {periods.map((item) => {
              const periodActivities = routines.filter(
                (activity) => activity.period === item.id,
              );

              const periodCompleted = periodActivities.filter((activity) =>
                progress.completed.includes(activity.id),
              ).length;

              return (
                <section className={`day-period ${item.id}`} key={item.id}>
                  <header className="period-header">
                    <span className="period-emoji">{item.emoji}</span>
                    <div>
                      <h2>{item.title}</h2>
                      <p>{item.description}</p>
                    </div>
                    <span className="period-count">
                      {periodCompleted}/{periodActivities.length}
                    </span>
                  </header>

                  <div className="day-activities">
                    {periodActivities.map((activity) => {
                      const isCompleted = progress.completed.includes(
                        activity.id,
                      );

                      return (
                        <button
                          type="button"
                          key={activity.id}
                          className={`day-activity ${
                            isCompleted ? "completed" : ""
                          }`}
                          onClick={() => toggleActivity(activity.id)}
                          aria-pressed={isCompleted}
                        >
                          <span className="activity-emoji">
                            {activity.emoji}
                          </span>

                          <span className="activity-copy">
                            <span className="activity-title">
                              {activity.title}
                            </span>
                            <span className="activity-description">
                              {activity.description}
                            </span>
                          </span>

                          <span className="activity-check">
                            {isCompleted ? "✓" : ""}
                          </span>
                        </button>
                      );
                    })}

                    {periodActivities.length === 0 && (
                      <p className="empty-routines">Inga rutiner här ännu 🌷</p>
                    )}
                  </div>
                </section>
              );
            })}
          </div>

          <footer className="my-day-footer">
            <span>💖</span>
            <p>Du är fantastisk precis som du är!</p>
            <span>💖</span>
          </footer>
        </>
      )}
    </main>
  );
}
