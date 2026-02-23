import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { WiDaySunny, WiCloudy, WiRain, WiNightClear, WiSnow, WiThunderstorm } from "react-icons/wi";


import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});



import cities from "./finnishCities.json";


const fetchWeather = async ({ queryKey }) => {
  const [, lat, lon] = queryKey;
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
  );
  const data = await res.json();
  return {
    temperature: data.current_weather.temperature,
    windspeed: data.current_weather.windspeed,
    weathercode: data.current_weather.weathercode,
  };
};

function MapFlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 9, { duration: 1.2 });
    }
  }, [position, map]);
  return null;
}

const getWeatherInfo = (code, timeOfDay, size = 36) => {
  const props = { size };
  if (code === 0)
    return {
      icon: timeOfDay === "day" ? <WiDaySunny {...props} /> : <WiNightClear {...props} />,
      label: "Selkeää",
    };
  if ([1, 2, 3].includes(code)) return { icon: <WiCloudy {...props} />, label: "Pilvistä" };
  if ([61, 63, 65, 80, 81, 82].includes(code)) return { icon: <WiRain {...props} />, label: "Sadetta" };
  if ([71, 73, 75, 85, 86].includes(code)) return { icon: <WiSnow {...props} />, label: "Lumisadetta" };
  if ([95, 96, 99].includes(code)) return { icon: <WiThunderstorm {...props} />, label: "Ukkosmyrsky" };
  return { icon: <WiCloudy {...props} />, label: "Pilvistä" };
};

function createTempMarker(temp) {
  const fill =
    temp <= 0 ? "#67e8f9" :
    temp <= 10 ? "#6ee7b7" :
    temp <= 20 ? "#fde68a" :
    "#fca5a5";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="56">
      <circle cx="24" cy="22" r="18" fill="${fill}" opacity="0.8"/>
      <circle cx="24" cy="22" r="12" fill="white" opacity="0.3"/>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [48, 56],
    iconAnchor: [24, 52],
  });
}

const queryClient = new QueryClient();

export default function WeatherMap() {
  const [timeOfDay, setTimeOfDay] = useState("day");
  const [clock, setClock] = useState("");
  const [selectedCity, setSelectedCity] = useState(null);
  const markerRefs = useRef({});
  const [searchError, setSearchError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCities, setFilteredCities] = useState([]);

  useEffect(() => {
  if (!searchTerm) {
    setFilteredCities([]);
    return;
  }

  const matches = cities.filter((city) =>
  city.name.toLowerCase().startsWith(searchTerm.toLowerCase())
);

  setFilteredCities(matches);
}, [searchTerm]);

const handleSelectCity = (city) => {
  setSearchTerm("");
  setFilteredCities([]);
  setSearchError("");

  setSelectedCity([city.lat, city.lon]);

  setTimeout(() => {
    markerRefs.current[city.name]?.openPopup();
  }, 600);
};

  const handleSearch = (value) => {
  if (!value.trim()) return;

  const city = cities.find(
    (c) => c.name.toLowerCase() === value.toLowerCase()
  );

  if (!city) {
  setSearchError("Kaupunkia ei löytynyt listasta");
  setTimeout(() => setSearchError(""), 3000);
  return;
}

  // jos löytyi → tyhjennä error
  setSearchError("");

  setSelectedCity([city.lat, city.lon]);

  setTimeout(() => {
    markerRefs.current[city.name]?.openPopup();
  }, 600);
};

  function CityMarker({ city }) {
    const { data: weather } = useQuery({
      queryKey: ["weather", city.lat, city.lon],
      queryFn: fetchWeather,
      refetchInterval: 15000,
    });

    const weatherInfo = weather
      ? getWeatherInfo(weather.weathercode, timeOfDay)
      : null;

    const icon = weather
      ? createTempMarker(weather.temperature)
      : new L.Icon.Default();

    return (
      <Marker
        position={[city.lat, city.lon]}
        icon={icon}
        ref={(ref) => {
          if (ref) markerRefs.current[city.name] = ref;
        }}
      >
        <Popup>
          {!weather ? (
            <p>Ladataan...</p>
          ) : (
            <>
              <p className="font-bold">{city.name}</p>
              <div className="flex items-center gap-2">
                {weatherInfo.icon}
                <span className="text-xl">{weather.temperature}°</span>
              </div>
              <p>{weatherInfo.label}</p>
              <p className="text-xs">Tuuli {weather.windspeed} km/h</p>
              <p className="text-xs">{clock}</p>
            </>
          )}
        </Popup>
      </Marker>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="px-4 pb-12 max-w-5xl mx-auto w-full"
    >
      {/* SEARCH BAR */}
<div className="mb-4 relative">
  <input
    type="text"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    placeholder="Hae kaupunki..."
    className="w-full p-3 rounded-xl bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-700"
  />

  {filteredCities.length > 0 && (
    <div className="absolute w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-lg z-[9999]">
      {filteredCities.map((city) => (
        <div
          key={city.name}
          onClick={() => handleSelectCity(city)}
          className="p-3 hover:bg-slate-700 cursor-pointer text-white"
        >
          {city.name}
        </div>
      ))}
    </div>
  )}
</div>

      <div className="rounded-2xl overflow-hidden" style={{ height: "520px" }}>
        <QueryClientProvider client={queryClient}>
          <MapContainer
            center={[64.5, 26]}
            zoom={5}
            style={{ width: "100%", height: "100%" }}
          >
            {selectedCity && <MapFlyTo position={selectedCity} />}
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {cities.map((city) => (
              <CityMarker key={city.name} city={city} />
            ))}
          </MapContainer>
        </QueryClientProvider>
      </div>
    </motion.div>
  );
}