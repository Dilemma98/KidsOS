import { useEffect, useState } from "react";

// Reservplats om plattan inte ger sin position (Örebro). Byt vid behov.
const FALLBACK = { lat: 59.2753, lon: 15.2134 };
const REFRESH_MS = 30 * 60 * 1000;

export type Weather = { temp: number; icon: string; text: string };

function describe(code: number, isDay: boolean): { icon: string; text: string } {
  if (code === 0) return isDay ? { icon: "☀️", text: "Soligt" } : { icon: "🌙", text: "Klart" };
  if (code === 1) return isDay ? { icon: "🌤️", text: "Mest sol" } : { icon: "🌙", text: "Mest klart" };
  if (code === 2) return { icon: "⛅", text: "Molnigt" };
  if (code === 3) return { icon: "☁️", text: "Mulet" };
  if (code === 45 || code === 48) return { icon: "🌫️", text: "Dimma" };
  if (code >= 51 && code <= 57) return { icon: "🌦️", text: "Duggregn" };
  if (code >= 61 && code <= 67) return { icon: "🌧️", text: "Regn" };
  if (code >= 71 && code <= 77) return { icon: "❄️", text: "Snö" };
  if (code >= 80 && code <= 82) return { icon: "🌦️", text: "Regnskurar" };
  if (code === 85 || code === 86) return { icon: "🌨️", text: "Snöbyar" };
  if (code >= 95) return { icon: "⛈️", text: "Åska" };
  return { icon: "🌤️", text: "Okänt" };
}

function getPosition(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve(FALLBACK);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => resolve(FALLBACK),
      { timeout: 8000, maximumAge: 60 * 60 * 1000 }
    );
  });
}

export function useWeather(useLocation: boolean): Weather | null {
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { lat, lon } = useLocation ? await getPosition() : FALLBACK;
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
          `&current=temperature_2m,weather_code,is_day&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();
        const c = data.current;
        if (cancelled || !c) return;
        const d = describe(c.weather_code, c.is_day === 1);
        setWeather({ temp: Math.round(c.temperature_2m), ...d });
      } catch {
        /* behåll senaste värdet, eller visa ingenting */
      }
    }

    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [useLocation]);

  return weather;
}