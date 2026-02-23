import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { WiDaySunny, WiCloudy, WiRain, WiNightClear, WiSnow, WiThunderstorm } from "react-icons/wi";
import WeatherBackground, { getWeatherType } from "./Weatherbackground";

const fetchWeather = async ({ queryKey }) => {
  const [, lat, lon] = queryKey;
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7&hourly=apparent_temperature,relativehumidity_2m&forecast_hours=1`
  );
  const data = await res.json();
  return {
    temperature: data.current_weather.temperature,
    windspeed: data.current_weather.windspeed,
    weathercode: data.current_weather.weathercode,
    apparentTemp: data.hourly?.apparent_temperature?.[0] ?? null,
    humidity: data.hourly?.relativehumidity_2m?.[0] ?? null,
    daily: data.daily,
  };
};

const getWeatherInfo = (code, timeOfDay, size = 72) => {
  const props = { size };
  if (code === 0) return { icon: timeOfDay === "day" ? <WiDaySunny {...props} /> : <WiNightClear {...props} />, label: timeOfDay === "day" ? "Selkeää" : "Kirkas yö" };
  if ([1, 2, 3].includes(code)) return { icon: <WiCloudy {...props} />, label: "Pilvistä" };
  if ([61, 63, 65, 80, 81, 82].includes(code)) return { icon: <WiRain {...props} />, label: "Sadetta" };
  if ([71, 73, 75, 85, 86].includes(code)) return { icon: <WiSnow {...props} />, label: "Lumisadetta" };
  if ([95, 96, 99].includes(code)) return { icon: <WiThunderstorm {...props} />, label: "Ukkosmyrsky" };
  return { icon: <WiCloudy {...props} />, label: "Pilvistä" };
};

const DAY_NAMES = ["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"];

export default function WeatherCard() {
  const [coords, setCoords] = useState({ lat: null, lon: null });
  const [timeOfDay, setTimeOfDay] = useState("day");
  const [clock, setClock] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setCoords({ lat: 65.0121, lon: 25.4651 })
      );
    } else {
      setCoords({ lat: 65.0121, lon: 25.4651 });
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setClock(`${hours.toString().padStart(2, "0")}:${minutes}`);
      setTimeOfDay(hours >= 6 && hours < 18 ? "day" : "night");
      setDate(now.toLocaleDateString("fi-FI", { weekday: "long", day: "numeric", month: "long" }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: weather, refetch, isFetching } = useQuery({
    queryKey: ["weather", coords.lat, coords.lon],
    queryFn: fetchWeather,
    enabled: !!coords.lat && !!coords.lon,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const weatherInfo = weather ? getWeatherInfo(weather.weathercode, timeOfDay, 72) : null;
  const weatherType = weather ? getWeatherType(weather.weathercode, timeOfDay) : "night";

  return (
    <>
      <WeatherBackground weatherType={weatherType} />

      <div className="flex justify-center px-4 pt-10 pb-4 mt-[-3rem]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative w-full max-w-sm rounded-3xl border border-white/10 p-8 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(23,37,84,0.8) 100%)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <div className="absolute -top-14 -right-14 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)" }} />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)" }} />

          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-slate-400/80 text-sm uppercase tracking-widest font-light">Sijaintisi</p>
              <p className="text-slate-500/70 text-xs tracking-wide mt-0.5">{date}</p>
            </div>
            <div className="text-right">
              <span className="text-slate-200/90 text-2xl font-medium tracking-tight block">{clock}</span>
              {isFetching && <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-400/60 animate-pulse mt-1" />}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!weather ? (
              <motion.p
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-slate-500 text-sm uppercase tracking-widest text-center py-8"
              >
                Ladataan säädata...
              </motion.p>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-4 my-6">
                  <motion.div
                    className="text-sky-300/85 shrink-0"
                    style={{ filter: "drop-shadow(0 0 16px rgba(56,189,248,0.4))" }}
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {weatherInfo.icon}
                  </motion.div>
                  <div>
                    <div className="text-slate-100 font-light leading-none" style={{ fontSize: "4.5rem", fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}>
                      {weather.temperature}<sup className="text-3xl text-slate-400/70 align-super">°C</sup>
                    </div>
                    <p className="text-sky-400/60 text-xs uppercase tracking-widest mt-1">{weatherInfo.label}</p>
                  </div>
                </div>

                <div className="h-px my-5" style={{ background: "linear-gradient(90deg, transparent, rgba(148,163,184,0.12), transparent)" }} />

                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    { label: "Tuuli", value: `${weather.windspeed} km/h` },
                    { label: "Tuntuu kuin", value: weather.apparentTemp != null ? `${weather.apparentTemp}°C` : "—" },
                    { label: "Kosteus", value: weather.humidity != null ? `${weather.humidity}%` : "—" },
                  ].map((stat) => (
                    <div key={stat.label} className="flex flex-col gap-1 bg-white/5 rounded-xl px-3 py-2">
                      <span className="text-slate-500/80 text-xs uppercase tracking-widest">{stat.label}</span>
                      <span className="text-slate-300/90 text-sm font-medium">{stat.value}</span>
                    </div>
                  ))}
                </div>

                <div className="h-px mb-5" style={{ background: "linear-gradient(90deg, transparent, rgba(148,163,184,0.12), transparent)" }} />

                {weather.daily && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {weather.daily.time.map((dateStr, i) => {
                      const d = new Date(dateStr);
                      const dayName = i === 0 ? "Tänään" : DAY_NAMES[d.getDay()];
                      const info = getWeatherInfo(weather.daily.weathercode[i], "day", 28);
                      const max = weather.daily.temperature_2m_max[i];
                      const min = weather.daily.temperature_2m_min[i];
                      return (
                        <motion.div
                          key={dateStr}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex flex-col items-center gap-1 shrink-0 bg-white/5 hover:bg-white/10 transition-colors rounded-xl px-3 py-2 min-w-12"
                        >
                          <span className="text-slate-500 text-xs">{dayName}</span>
                          <span className="text-sky-300/80">{info.icon}</span>
                          <span className="text-slate-200 text-xs font-medium">{Math.round(max)}°</span>
                          <span className="text-slate-600 text-xs">{Math.round(min)}°</span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => refetch()}
            className="mt-5 w-full py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-400/70 text-xs uppercase tracking-widest hover:border-sky-400/20 hover:text-sky-400/80 hover:bg-white/10 transition-all duration-200"
          >
            ↻ Päivitä manuaalisesti
          </button>
        </motion.div>
      </div>
    </>
  );
}