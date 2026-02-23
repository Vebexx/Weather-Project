import { useState } from "react";
import cities from "./finnishCities.json";
import { fetchWeather } from "./fetchWeather";

export default function WeatherSearch({ setWeatherData, setError }) {
  const [query, setQuery] = useState("");

  const handleSearch = async () => {
    if (!query) return;

    const key = query.toLowerCase().replace(/\s/g, "");
    const city = cities[key];

    if (!city) {
      setError("Kaupunkia ei löydy Suomessa");
      return;
    }

    try {
      const data = await fetchWeather({ lat: city.lat, lon: city.lon });
      setWeatherData(data);
      setError("");
    } catch {
      setError("Sään haku epäonnistui");
    }
  };

  return (
    <div className="w-11/12 sm:w-80 md:w-96 mb-4">
      <input
        type="text"
        placeholder="Hae kaupunkia..."
        className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch();
        }}
      />
    </div>
  );
}