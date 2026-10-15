import { useEffect, useRef, useState } from "react";
import "./DrawingApp.css";

type SavedDrawing = {
  id: string;
  name: string;
  image: string;
};

const COLORS = [
  // Rosa och rött
  "#FF6B9D",
  "#FF8FAB",
  "#FF4D6D",
  "#E63946",
  "#C9184A",
  "#FFB3C6",

  // Orange och gult
  "#FF8A65",
  "#FFB347",
  "#FFC857",
  "#FFE66D",
  "#FFF3B0",

  // Grönt
  "#7BC96F",
  "#4CAF50",
  "#2D9C75",
  "#9BE7A5",
  "#B7E4C7",

  // Blått och turkost
  "#42C6B7",
  "#4DD0E1",
  "#65A9FF",
  "#4285F4",
  "#BDE0FE",

  // Lila
  "#9B83F5",
  "#B388FF",
  "#C77DFF",
  "#754C9B",
  "#E0AAFF",

  // Brunt, grått, svart och vitt
  "#9C6644",
  "#795548",
  "#A0A0A0",
  "#5B465F",
  "#292929",
  "#FFFFFF",
];

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 700;
const STORAGE_KEY = "kidsos-drawings";

export default function DrawingApp({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const previousPoint = useRef<{ x: number; y: number } | null>(null);

  const [color, setColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(12);
  const [isEraser, setIsEraser] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [savedDrawings, setSavedDrawings] = useState<SavedDrawing[]>([]);
  const [message, setMessage] = useState("");
  const [viewing, setViewing] = useState<SavedDrawing | null>(null);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 2200);
    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    if (!viewing) return;
    const onKey = (e: any) => e.key === "Escape" && setViewing(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) return;

    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.lineCap = "round";
    context.lineJoin = "round";

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedDrawings(JSON.parse(stored) as SavedDrawing[]);
      }
    } catch {
      setMessage("Kunde inte läsa sparade bilder 💗");
    }
  }, []);

  function getPoint(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();

    return {
      x: ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
    };
  }

  function startDrawing(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) return;

    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    drawingRef.current = true;

    const point = getPoint(event);
    previousPoint.current = point;

    context.beginPath();
    context.arc(point.x, point.y, brushSize / 2, 0, Math.PI * 2);
    context.fillStyle = isEraser ? "#FFFFFF" : color;
    context.fill();
  }

  function draw(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;

    event.preventDefault();

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const previous = previousPoint.current;

    if (!canvas || !context || !previous) return;

    const point = getPoint(event);

    context.beginPath();
    context.moveTo(previous.x, previous.y);
    context.lineTo(point.x, point.y);
    context.strokeStyle = isEraser ? "#FFFFFF" : color;
    context.lineWidth = brushSize;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();

    previousPoint.current = point;
  }

  function stopDrawing() {
    drawingRef.current = false;
    previousPoint.current = null;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) return;

    if (!window.confirm("Vill du börja om med en tom bild? 🎨")) return;

    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    setMessage("En ny, tom teckning! ✨");
  }

  function saveDrawing() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) return;

    try {
      const image = canvas.toDataURL("image/png");
      const stored = localStorage.getItem(STORAGE_KEY);
      const drawings = stored ? (JSON.parse(stored) as SavedDrawing[]) : [];

      if (drawings.length >= 10) {
        setMessage("💗 Galleriet är fullt! Be en vuxen om hjälp.");
        return;
      }

      const drawing: SavedDrawing = {
        id: String(Date.now()),
        name: `Min teckning ${drawings.length + 1}`,
        image,
      };

      const updated = [...drawings, drawing];

      // Spara först
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // Uppdatera galleriet
      setSavedDrawings(updated);

      // Rensa ritduken efter lyckad sparning
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Tydlig bekräftelse
      setMessage("🎉 JIPPIE! DIN TECKNING ÄR SPARAD! 💖");
    } catch {
      setMessage("Oj! Det gick inte att spara. Försök igen! 💗");
    }
  }

  function deleteDrawing(id: string) {
    if (!window.confirm("Vill du ta bort den här teckningen?")) return;

    const updated = savedDrawings.filter((drawing) => drawing.id !== id);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSavedDrawings(updated);
      setMessage("Teckningen är borttagen.");
    } catch {
      setMessage("Kunde inte uppdatera galleriet.");
    }
  }

  return (
    <main className="drawing-app">
      <header className="drawing-header">
        <button className="drawing-back" onClick={onBack}>
          ← Hem
        </button>

        <div className="drawing-title">
          <span>🎨</span>
          <div>
            <h1>Rita & lek!</h1>
            <p>Skapa något alldeles eget 💗</p>
          </div>
        </div>

        <button
          className="gallery-button"
          onClick={() => setShowGallery((current) => !current)}
        >
          {showGallery ? "🖍️ Rita" : "🖼️ Mina bilder"}
        </button>
      </header>
      {!showGallery && (

      <section className="drawing-tools">
        <div className="tool-label">🌈 Färger</div>

        <div className="color-palette">
          {COLORS.map((item) => (
            <button
              key={item}
              className={`color-swatch ${color === item && !isEraser ? "selected" : ""}`}
              style={{ backgroundColor: item }}
              onClick={() => {
                setColor(item);
                setIsEraser(false);
              }}
              aria-label={`Välj färgen ${item}`}
              title={item}
            />
          ))}
        </div>

        <div className="brush-controls">
          <label htmlFor="brush-size">🖌️ Pensel</label>
          <input
            id="brush-size"
            type="range"
            min="4"
            max="48"
            step="4"
            value={brushSize}
            onChange={(event) => setBrushSize(Number(event.target.value))}
          />
          <span className="brush-preview">
            <span
              style={{
                width: Math.max(6, brushSize / 2),
                height: Math.max(6, brushSize / 2),
              }}
            />
          </span>

          <button
            className={`tool-button ${isEraser ? "tool-active" : ""}`}
            onClick={() => setIsEraser((current) => !current)}
          >
            🧽 {isEraser ? "Sudd aktivt" : "Sudd"}
          </button>
        </div>
          <footer className="drawing-actions">
            <button className="clear-button" onClick={clearCanvas}>
              🧹 Börja om
            </button>
            <button className="save-button" onClick={saveDrawing}>
              💖 Spara teckning
            </button>
          </footer>
       
      </section>
       )}

      {showGallery ? (
        <section className="drawing-gallery">
          <h2>🖼️ Mina fina teckningar</h2>

          {savedDrawings.length === 0 ? (
            <div className="empty-gallery">
              <span>🐰</span>
              <p>Här kommer dina teckningar att synas!</p>
              <button onClick={() => setShowGallery(false)}>
                Nu går vi och ritar! 🎨
              </button>
            </div>
          ) : (
            <div className="saved-grid">
              {savedDrawings.map((drawing) => (
                <article className="saved-card" key={drawing.id}>
                  <img
                    src={drawing.image}
                    alt={drawing.name}
                    onClick={() => setViewing(drawing)}
                    className="saved-thumb"
                  />
                  <h3>{drawing.name}</h3>
                  <div className="saved-actions">
                    {/* <button onClick={() => loadDrawing(drawing)}>
                      Öppna ✨
                    </button> */}
                    {/* <button onClick={() => downloadDrawing(drawing)}>
                      Spara PNG ⬇️
                    </button> */}
                    <button
                      className="delete-button"
                      onClick={() => deleteDrawing(drawing.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </article>
              ))}
              {viewing && (
  <div className="viewer-backdrop" onClick={() => setViewing(null)}>
    <div className="viewer-box" onClick={(e) => e.stopPropagation()}>
      <button
        className="viewer-close"
        onClick={() => setViewing(null)}
        aria-label="Stäng"
      >
        ✕
      </button>
      <img src={viewing.image} alt={viewing.name} />
      <h3>{viewing.name}</h3>
    </div>
  </div>
)}
            </div>
          )}
        </section>
      ) : (
        <section className="canvas-frame">
          <div className="canvas-decoration">✦</div>
          <canvas
            ref={canvasRef}
            className="drawing-canvas"
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerCancel={stopDrawing}
            onLostPointerCapture={stopDrawing}
            aria-label="Rityta. Rita genom att dra fingret över ytan."
          />
          {message && (
            <p className="drawing-message" role="status">
              {message}
            </p>
          )}
          <div className="canvas-hint">✨ Rita med fingret här! ✨</div>
        </section>
      )}
    </main>
  );
}
