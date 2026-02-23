import { useState, useEffect } from "react";
import WeatherCard from "./components/Weathercard";
import WeatherMap from "./components/WeatherMap";
import WeatherSearch from "./components/WeatherSearch";
import { fetchWeather } from "./components/fetchWeather";

export default function WeatherContainer() {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState("");

  // Hae sijaintiperäinen sää oletuksena
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const data = await fetchWeather({ lat: latitude, lon: longitude });
            setWeatherData(data);
            setError("");
          } catch {
            setError("Sijaintiperäisen sään haku epäonnistui");
          }
        },
        () => setError("Sijaintia ei voitu hakea")
      );
    } else {
      setError("Selaimesi ei tue sijaintia");
    }
  }, []);

  return (
    <div className="relative z-10 min-h-screen flex flex-col md:flex-row items-center justify-center gap-6 p-6">
      

      {weatherData && (
        <>
          <div className="w-11/12 sm:w-80 md:w-96 p-4 ">
            <WeatherCard data={weatherData} />
          </div>

          <div className="w-11/12 sm:w-80 md:w-96 p-4 ">
            <WeatherMap data={weatherData} />
          </div>
        </>
      )}
    </div>
  );
}