
import { useEffect, useState } from "react";
import "./Write.css";

interface WritingPage {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}
interface WritingProps{
    onBack: () => void;
}

const STORAGE_KEY = "kidsos-writing-book-v1";

function createPage(): WritingPage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title: "",
    content: "",
    updatedAt: Date.now(),
  };
}

function loadPages(): WritingPage[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed.filter(
          (page): page is WritingPage =>
            page !== null &&
            typeof page === "object" &&
            typeof page.id === "string" &&
            typeof page.title === "string" &&
            typeof page.content === "string" &&
            typeof page.updatedAt === "number"
        );
      }
    }
  } catch (error) {
    console.error("Kunde inte läsa skrivboken:", error);
  }

  return [];
}

export default function Writing({ onBack }: WritingProps) {
  const [pages, setPages] = useState<WritingPage[]>(loadPages);
  const [activeId, setActiveId] = useState<string | null>(
    () => loadPages()[0]?.id ?? null
  );
  const [savedMessage, setSavedMessage] = useState("");

  const activePage = pages.find((page) => page.id === activeId) ?? null;

  // Spara skrivboken lokalt när innehållet ändras.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
      setSavedMessage("Sparat 💖");
    } catch (error) {
      console.error("Kunde inte spara skrivboken:", error);
      setSavedMessage("Kunde inte spara 😢");
    }
  }, [pages]);

  function updatePage(
    field: "title" | "content",
    value: string
  ) {
    if (!activeId) return;

    setPages((currentPages) =>
      currentPages.map((page) =>
        page.id === activeId
          ? {
              ...page,
              [field]: value,
              updatedAt: Date.now(),
            }
          : page
      )
    );
  }

  function addPage() {
    const page = createPage();

    setPages((currentPages) => [...currentPages, page]);
    setActiveId(page.id);
  }

  function deletePage() {
    if (!activePage) return;

    const confirmed = window.confirm(
      "Vill du ta bort den här sidan? 💗"
    );

    if (!confirmed) return;

    const remaining = pages.filter(
      (page) => page.id !== activePage.id
    );

    setPages(remaining);
    setActiveId(remaining[remaining.length - 1]?.id ?? null);
  }

  function selectPage(id: string) {
    setActiveId(id);
  }

  return (
    <main className="writing-book">
      <header className="writing-header">
         <button
          type="button"
          className="writing-back-button"
          onClick={onBack}
        >
          ← Tillbaka
        </button>
        <div className="writing-heading">
          <span className="writing-icon" aria-hidden="true">
            ✏️
          </span>
          <div>
            <h1>Min skrivbok</h1>
            <p>Här får alla dina ord plats! 🌈</p>
          </div>
        </div>

        <button
          className="writing-button writing-new-button"
          onClick={addPage}
          type="button"
        >
          <span aria-hidden="true">＋</span> Ny sida
        </button>
      </header>

      <section className="writing-layout">
        <aside className="writing-sidebar">
          <h2>Mina sidor 📚</h2>

          {pages.length === 0 ? (
            <p className="writing-empty-list">
              Här kommer dina sidor att samlas!
            </p>
          ) : (
            <div className="writing-page-list">
              {pages.map((page, index) => (
                <button
                  key={page.id}
                  type="button"
                  className={`writing-page-tab ${
                    page.id === activeId ? "active" : ""
                  }`}
                  onClick={() => selectPage(page.id)}
                >
                  <span className="writing-page-number">
                    {index + 1}
                  </span>
                  <span className="writing-page-label">
                    {page.title.trim() || `Min sida ${index + 1}`}
                  </span>
                  <span aria-hidden="true">💗</span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <section className="writing-paper">
          {activePage ? (
            <>
              <div className="writing-paper-top">
                <span aria-hidden="true">🌸</span>
                <span className="writing-save-status" role="status">
                  {savedMessage}
                </span>
              </div>

              <label
                className="writing-visually-hidden"
                htmlFor="writing-title"
              >
                Sidans rubrik
              </label>
              <input
                id="writing-title"
                className="writing-title-input"
                type="text"
                placeholder="Vad ska sidan heta?"
                value={activePage.title}
                onChange={(event) =>
                  updatePage("title", event.target.value)
                }
                maxLength={100}
              />

              <label
                className="writing-visually-hidden"
                htmlFor="writing-content"
              >
                Skriv din text
              </label>
              <textarea
                id="writing-content"
                className="writing-textarea"
                placeholder={"Skriv vad du vill här...\n\nDet kan vara en saga, ett brev eller bara roliga ord! ✨"}
                value={activePage.content}
                onChange={(event) =>
                  updatePage("content", event.target.value)
                }
                spellCheck
              />

              <footer className="writing-paper-footer">
                <span>Du får skriva precis vad du vill 💕</span>
                <button
                  className="writing-button writing-delete-button"
                  type="button"
                  onClick={deletePage}
                >
                  🗑️ Ta bort sidan
                </button>
              </footer>
            </>
          ) : (
            <div className="writing-welcome">
              <span className="writing-welcome-icon" aria-hidden="true">
                📖
              </span>
              <h2>Din skrivbok är redo!</h2>
              <p>Skapa din första sida och börja skriva.</p>
              <button
                className="writing-button writing-new-button"
                type="button"
                onClick={addPage}
              >
                ✨ Skapa min första sida
              </button>
            </div>
          )}
        </section>
      </section>

      <p className="writing-bottom-note">
        🌷 Dina sidor sparas automatiskt på plattan 🌷
      </p>
    </main>
  );
}
