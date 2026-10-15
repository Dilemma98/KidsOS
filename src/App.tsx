import { useState } from "react";
import "./App.css";
import DrawingApp from "./screens/DrawingApp";
import Memory from "./screens/Memory";
import Bubbles from "./screens/Bubbles";
import Animals from "./screens/Animals";
import { useWeather } from "./useWeather";
import ParentView from "./screens/ParentView";
import { useSettings } from "./useSettings";

type AppItem = {
  name: string;
  description: string;
  icon: string;
  color: string;
  androidPackage?: string;
};

const apps: AppItem[] = [
  {
    name: "Rita",
    description: "Kreativitet utan gränser!",
    icon: "🎨",
    color: "pink",
  },
  {
    name: "Memory",
    description: "Hitta alla djurpar!",
    icon: "🃏",
    color: "green",
  },
  {
    name: "Bubblor",
    description: "Poppa så många du vill!",
    icon: "🫧",
    color: "yellow",
  },
  {
  name: "Djur",
  description: "Lär dig roliga saker om djur!",
  icon: "🐾",
  color: "purple",
},
  {
    name: "Favoriter",
    description: "Dina bästa appar samlade här!",
    icon: "⭐",
    color: "green",
  },
];

export default function App() {
  const [parentMode, setParentMode] = useState(false);
const [screen, setScreen] = useState<
  "home" | "drawing" | "memory" | "bubbles" | "animals"
>("home");
  const [settings, update] = useSettings();
const weather = useWeather(settings.useLocation);
const visibleApps = apps.filter((a) => !settings.hiddenApps.includes(a.name));

  function openApp(name: string) {
    if (name === "Rita") {
      setScreen("drawing");
      return;
    }
    if (name === "Memory") {
      setScreen("memory");
      return;
    }
    if (name === "Bubblor") {
      setScreen("bubbles");
      return;
    }
    if (name === "Djur") {
  setScreen("animals");
  return;
}

    alert(`${name} kommer snart! 💗`);
  }
  if (screen === "drawing") {
    return <DrawingApp onBack={() => setScreen("home")} />;
  }
  if (screen === "memory") {
  return (
    <Memory
      onBack={() => setScreen("home")}
      startPairs={settings.memoryPairs}
      sound={settings.sound}
    />
  );
}

if (screen === "bubbles") {
  return (
    <Bubbles
      onBack={() => setScreen("home")}
      sound={settings.sound}
      speed={settings.bubbleSpeed}
    />
  );
}
if (screen === "animals") {
  return <Animals onBack={() => setScreen("home")} sound={settings.sound} />;
}

  return (
    <main className="kids-os">
      <span className="decoration decoration-star">✦</span>
      <span className="decoration decoration-heart">♥</span>
      <span className="decoration decoration-sparkle">✧</span>

      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">⭐</div>
          <span>KidsOS</span>
        </div>

        <div className="topbar-actions">
          <div
            className="weather-pill"
            aria-label={
              weather
                ? `${weather.temp} grader, ${weather.text}`
                : "Väder laddas"
            }
          >
            <span className="weather-icon">
              {weather ? weather.icon : "🌤️"}
            </span>
            <div className="weather-text">
              <strong>{weather ? `${weather.temp}°C` : "–"}</strong>
              <span>{weather ? weather.text : "Hämtar..."}</span>
            </div>
          </div>

          <button
            className="parent-button"
            onClick={() => setParentMode((current) => !current)}
            aria-label={
              parentMode ? "Stäng föräldraläget" : "Öppna föräldraläget"
            }
          >
            <span className="parent-icon">👨‍👩‍👧</span>
            <span>Föräldraläge</span>
          </button>
        </div>
      </header>

{parentMode ? (
  <ParentView
    settings={settings}
    update={update}
    apps={apps}
    onClose={() => setParentMode(false)}
  />
) : (
        <>
          <section className="welcome">
            <div className="welcome-bunny">
              <p>🐇</p>
              <span className="bunny-heart">♥</span>
            </div>

            <div className="welcome-copy">
              <span className="eyebrow">♥ VÄLKOMMEN ♥</span>
              <h1>
                Hej <span>{settings.childName}!</span>
              </h1>
              <p>
                Här finns massor av roliga saker att göra!
                <br />
                Välj en app och börja utforska. <span>♥</span>
              </p>
            </div>

            <div className="welcome-sun" aria-hidden="true">
              ☀️
            </div>
            <div className="rainbow" aria-hidden="true">
              🌈
            </div>
          </section>

          <section className="app-grid" aria-label="Mina appar">
            {visibleApps.map((app) => (
              <button
                key={app.name}
                className={`app-card ${app.color}`}
                onClick={() => openApp(app.name)}
              >
                {/* <span className="card-heart" aria-hidden="true">
                  ♥
                </span> */}
                <span className="app-icon" aria-hidden="true">
                  {app.icon}
                </span>

                <span className="app-copy">
                  <span className="app-name">{app.name}</span>
                  <span className="app-description">{app.description}</span>
                </span>

                <span className="app-arrow" aria-hidden="true">
                  ›
                </span>
              </button>
            ))}
          </section>

          <footer className="bottom-note">
            <span className="footer-line" />
            <span className="footer-heart">♥</span>
            <span>Du är fantastisk!</span>
            <span className="footer-heart">♥</span>
            <span className="footer-line" />
          </footer>
        </>
      )}
    </main>
  );
}
