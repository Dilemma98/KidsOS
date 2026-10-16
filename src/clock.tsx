
import { useEffect, useState } from "react";
import "./clock.css";

export default function AnalogClock() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const updateTime = () => setTime(new Date());

    updateTime();
    const interval = window.setInterval(updateTime, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  const secondAngle = seconds * 6;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const hourAngle = hours * 30 + minutes * 0.5;

  const weekday = new Intl.DateTimeFormat("sv-SE", {
    weekday: "long",
  }).format(time);

  return (
    <div
      className="analog-clock-widget"
      role="img"
      aria-label={`Klockan är ${time.toLocaleTimeString("sv-SE", {
        hour: "2-digit",
        minute: "2-digit",
      })}`}
    >
      <div className="analog-clock">
        {Array.from({ length: 12 }, (_, i) => {
          const angle = i * 30;

          return (
            <span
              key={i}
              className="clock-number"
              style={{
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-42px) rotate(-${angle}deg)`,
              }}
            >
              {i === 0 ? 12 : i}
            </span>
          );
        })}

        <div
          className="clock-hand clock-hour"
          style={{ transform: `translateX(-50%) rotate(${hourAngle}deg)` }}
        />

        <div
          className="clock-hand clock-minute"
          style={{ transform: `translateX(-50%) rotate(${minuteAngle}deg)` }}
        />

        <div
          className="clock-hand clock-second"
          style={{ transform: `translateX(-50%) rotate(${secondAngle}deg)` }}
        />

        <span className="clock-center" />
      </div>

      <span className="clock-day">{weekday}</span>
    </div>
  );
}
