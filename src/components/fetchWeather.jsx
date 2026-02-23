// fetchWeather.js
export const fetchWeather = async ({ lat, lon }) => {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7&hourly=apparent_temperature,relativehumidity_2m&forecast_hours=1`
  );
  const data = await res.json();

  return {
    lat,
    lon,
    temperature: data.current_weather?.temperature ?? null,
    windspeed: data.current_weather?.windspeed ?? null,
    weathercode: data.current_weather?.weathercode ?? null,
    apparentTemp: data.hourly?.apparent_temperature?.[0] ?? null,
    humidity: data.hourly?.relativehumidity_2m?.[0] ?? null,
    daily: data.daily ?? null,
  };
};