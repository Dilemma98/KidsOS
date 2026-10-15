
import { useEffect, useRef, useState } from "react";
import "./Stickers.css";

interface StickerItem {
  id: string;
  emoji: string;
  x: number;
  y: number;
}

interface StickerPage {
  id: string;
  stickers: StickerItem[];
}

interface StickerBook {
  pages: StickerPage[];
  currentSpread: number;
}

interface StickersProps {
  onBack: () => void;
}

interface DragInfo {
  id: string;
  pageIndex: number;
  offsetX: number;
  offsetY: number;
}

const STORAGE_KEY = "kidsos-sticker-book-v1";
const OLD_STORAGE_KEY = "kidsos-stickers-v1";
const INITIAL_PAGES = 8;

const stickerOptions = [
  "🐱", "🐶", "🐰", "🦊", "🐻", "🐼",
  "🦁", "🐸", "🐥", "🦋", "🐞", "🐢",
  "🌸", "🌻", "🌈", "⭐", "💖", "🌙",
  "🍓", "🍎", "🍄", "🌷", "🦄", "🐝",
  "🚗", "🚀", "🎈", "🧁", "🍦", "🎀",
];

function createPage(): StickerPage {
  return {
    id: `${Date.now()}-${Math.random()}`,
    stickers: [],
  };
}

function createBook(): StickerBook {
  return {
    pages: Array.from({ length: INITIAL_PAGES }, createPage),
    currentSpread: 0,
  };
}

function loadBook(): StickerBook {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved) as StickerBook;

      if (Array.isArray(parsed.pages) && parsed.pages.length > 0) {
        const pages = [...parsed.pages];

        while (pages.length < 2) {
          pages.push(createPage());
        }

        return {
          pages,
          currentSpread: Math.max(
            0,
            Math.min(
              parsed.currentSpread ?? 0,
              Math.floor((pages.length - 1) / 2) * 2
            )
          ),
        };
      }
    }

    // Försök behålla klistermärken från den gamla versionen.
    const oldSaved = localStorage.getItem(OLD_STORAGE_KEY);

    if (oldSaved) {
      const oldProject = JSON.parse(oldSaved) as {
        stickers?: StickerItem[];
      };

      const book = createBook();

      if (Array.isArray(oldProject.stickers)) {
        book.pages[0].stickers = oldProject.stickers;
      }

      return book;
    }
  } catch (error) {
    console.error("Kunde inte läsa klistermärkesboken:", error);
  }

  return createBook();
}

export default function Stickers({ onBack }: StickersProps) {
  const [book, setBook] = useState<StickerBook>(loadBook);
  const [activePage, setActivePage] = useState(0);
  const [selectedSticker, setSelectedSticker] = useState<{
    pageIndex: number;
    id: string;
  } | null>(null);

  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragInfo = useRef<DragInfo | null>(null);

  const leftIndex = book.currentSpread;
  const rightIndex = leftIndex + 1;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(book));
    } catch (error) {
      console.error("Kunde inte spara klistermärkesboken:", error);
    }
  }, [book]);

  function updatePageStickers(
    pageIndex: number,
    update: (stickers: StickerItem[]) => StickerItem[]
  ) {
    setBook((previous) => ({
      ...previous,
      pages: previous.pages.map((page, index) =>
        index === pageIndex
          ? { ...page, stickers: update(page.stickers) }
          : page
      ),
    }));
  }

  function addSticker(emoji: string) {
    const sticker: StickerItem = {
      id: `${Date.now()}-${Math.random()}`,
      emoji,
      x: 50,
      y: 50,
    };

    updatePageStickers(activePage, (stickers) => [
      ...stickers,
      sticker,
    ]);

    setSelectedSticker({
      pageIndex: activePage,
      id: sticker.id,
    });
  }

  function startDrag(
    event: React.PointerEvent<HTMLButtonElement>,
    pageIndex: number,
    sticker: StickerItem
  ) {
    event.preventDefault();
    event.stopPropagation();

    const page = pageRefs.current[pageIndex];

    if (!page) return;

    const rect = page.getBoundingClientRect();

    dragInfo.current = {
      id: sticker.id,
      pageIndex,
      offsetX:
        event.clientX -
        (rect.left + (sticker.x / 100) * rect.width),
      offsetY:
        event.clientY -
        (rect.top + (sticker.y / 100) * rect.height),
    };

    setActivePage(pageIndex);
    setSelectedSticker({ pageIndex, id: sticker.id });

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveSticker(
    event: React.PointerEvent<HTMLDivElement>,
    pageIndex: number
  ) {
    const drag = dragInfo.current;

    if (!drag || drag.pageIndex !== pageIndex) return;

    const page = pageRefs.current[pageIndex];

    if (!page) return;

    const rect = page.getBoundingClientRect();

    const x = Math.max(
      5,
      Math.min(
        95,
        ((event.clientX - rect.left - drag.offsetX) / rect.width) * 100
      )
    );

    const y = Math.max(
      7,
      Math.min(
        93,
        ((event.clientY - rect.top - drag.offsetY) / rect.height) * 100
      )
    );

    updatePageStickers(pageIndex, (stickers) =>
      stickers.map((sticker) =>
        sticker.id === drag.id
          ? { ...sticker, x, y }
          : sticker
      )
    );
  }

  function stopDrag() {
    dragInfo.current = null;
  }

  function changeSpread(direction: -1 | 1) {
    setBook((previous) => {
      const next = previous.currentSpread + direction * 2;

      if (next < 0 || next >= previous.pages.length) {
        return previous;
      }

      return {
        ...previous,
        currentSpread: next,
      };
    });

    setSelectedSticker(null);
    dragInfo.current = null;
  }

  function addPages() {
    setBook((previous) => ({
      ...previous,
      pages: [
        ...previous.pages,
        createPage(),
        createPage(),
      ],
    }));
  }

  function deleteSelectedSticker() {
    if (!selectedSticker) return;

    updatePageStickers(selectedSticker.pageIndex, (stickers) =>
      stickers.filter(
        (sticker) => sticker.id !== selectedSticker.id
      )
    );

    setSelectedSticker(null);
  }

  function clearCurrentPage() {
    updatePageStickers(activePage, () => []);
    setSelectedSticker(null);
  }

  function renderPage(pageIndex: number) {
    const page = book.pages[pageIndex];

    if (!page) return null;

    return (
      <div
        key={page.id}
        className={`sticker-book-page ${
          activePage === pageIndex ? "active-page" : ""
        }`}
        ref={(element) => {
          pageRefs.current[pageIndex] = element;
        }}
        onPointerMove={(event) => moveSticker(event, pageIndex)}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        onClick={() => setActivePage(pageIndex)}
      >
        <span className="book-page-number">
          {pageIndex + 1}
        </span>

        {page.stickers.map((sticker) => {
          const isSelected =
            selectedSticker?.pageIndex === pageIndex &&
            selectedSticker.id === sticker.id;

          return (
            <button
              key={sticker.id}
              type="button"
              className={`book-sticker ${
                isSelected ? "selected" : ""
              }`}
              style={{
                left: `${sticker.x}%`,
                top: `${sticker.y}%`,
              }}
              aria-label={`Klistermärke ${sticker.emoji}`}
              onPointerDown={(event) =>
                startDrag(event, pageIndex, sticker)
              }
              onClick={(event) => {
                event.stopPropagation();
                setActivePage(pageIndex);
                setSelectedSticker({
                  pageIndex,
                  id: sticker.id,
                });
              }}
            >
              {sticker.emoji}
            </button>
          );
        })}

        {page.stickers.length === 0 && (
          <div className="empty-book-page">
            <span>✿</span>
            <p>Din sida</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <main className="stickers-app">
      <header className="stickers-header">
        <button
          type="button"
          className="sticker-back-button"
          onClick={onBack}
        >
          ← Tillbaka
        </button>

        <div className="sticker-book-heading">
          <span className="book-heading-icon">📖</span>
          <div>
            <h1>Min klistermärkesbok</h1>
            <p>Skapa din alldeles egna bok!</p>
          </div>
        </div>

        <button
          type="button"
          className="sticker-delete-button"
          onClick={deleteSelectedSticker}
          disabled={!selectedSticker}
        >
          Ta bort
        </button>
      </header>

      <section className="book-section">
        <div className="book-navigation">
          <button
            type="button"
            onClick={() => changeSpread(-1)}
            disabled={leftIndex === 0}
            aria-label="Bläddra bakåt"
          >
            ‹
          </button>

          <span>
            Sida {leftIndex + 1}–{rightIndex + 1} av {book.pages.length}
          </span>

          <button
            type="button"
            onClick={() => changeSpread(1)}
            disabled={rightIndex + 1 >= book.pages.length}
            aria-label="Bläddra framåt"
          >
            ›
          </button>
        </div>

        <div className="sticker-book">
          <div className="book-spine" aria-hidden="true" />

          <div className="book-pages">
            {renderPage(leftIndex)}
            {renderPage(rightIndex)}
          </div>
        </div>

        <p className="active-page-hint">
          Tryck på en sida för att välja var klistermärkena ska hamna.
        </p>

        <div className="book-actions">
          <button type="button" onClick={addPages}>
            ＋ Lägg till två sidor
          </button>

          <button type="button" onClick={clearCurrentPage}>
            Rensa sida {activePage + 1}
          </button>
        </div>
      </section>

      <section className="sticker-tray">
        <h2>Välj ett klistermärke</h2>

        <div className="sticker-options">
          {stickerOptions.map((emoji, index) => (
            <button
              type="button"
              key={`${emoji}-${index}`}
              className="sticker-option"
              onClick={() => addSticker(emoji)}
              aria-label={`Lägg till ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        <p className="sticker-save-note">
          💗 Boken sparas automatiskt!
        </p>
      </section>
    </main>
  );
}
