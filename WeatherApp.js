import React, { useState, useEffect } from "react";
import axios from "axios";
import "./WeatherApp.css";

export default function WeatherApp() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [unit, setUnit] = useState("C");
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState("");

  const API_KEY = "e9d409386fmshad297a425571d81p1326efjsnbbd888e508ff";
  const API_HOST = "weatherapi-com.p.rapidapi.com";

  // Auto-detect location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      fetchWeather(`${pos.coords.latitude},${pos.coords.longitude}`);
    });
  }, []);

  // Fetch weather + forecast
  const fetchWeather = async (query) => {
    try {
      const options = {
        method: "GET",
        url: `https://${API_HOST}/forecast.json`,
        params: { q: query, days: "5" },
        headers: {
          "X-RapidAPI-Key": API_KEY,
          "X-RapidAPI-Host": API_HOST,
        },
      };

      const response = await axios.request(options);
      setWeather(response.data);
      setForecast(response.data.forecast.forecastday);
      setError("");
    } catch (err) {
      setError("City not found or API error.");
      setWeather(null);
      setForecast([]);
    }
  };

  // °C to °F conversion
  const convertTemp = (tempC) => {
    return unit === "C" ? tempC : (tempC * 9) / 5 + 32;
  };

  // Handle search
  const handleSearch = () => {
    if (city.trim()) {
      fetchWeather(city);
    }
  };

  // Background class based on weather
  const getBackgroundClass = () => {
    if (!weather) return "app clear";
    const condition = weather.current.condition.text.toLowerCase();
    if (condition.includes("rain")) return "app rain";
    if (condition.includes("cloud")) return "app cloudy";
    if (condition.includes("snow")) return "app snow";
    if (condition.includes("thunder")) return "app thunder";
    return "app clear";
  };

  return (
    <div className={`${getBackgroundClass()} ${darkMode ? "dark" : ""}`}>
      <div className="weather-container">
        <h1>🌤 Weather App</h1>
        <div className="controls">
          <input
            type="text"
            placeholder="Enter city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button onClick={handleSearch}>Get Weather</button>
          <button onClick={() => setUnit(unit === "C" ? "F" : "C")}>
            {unit === "C" ? "°F" : "°C"}
          </button>
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        {weather && (
          <>
            <div className="current-weather">
              <h2>
                {weather.location.name}, {weather.location.country}
              </h2>
              <p>🕒 Local Time: {weather.location.localtime}</p>
              <img src={weather.current.condition.icon} alt="weather icon" />
              <p className="temp">
                {convertTemp(weather.current.temp_c).toFixed(1)}°{unit}
              </p>
              <p>{weather.current.condition.text}</p>
            </div>

            <h3>📅 5-Day Forecast</h3>
            <div className="forecast">
              {forecast.map((day) => (
                <div key={day.date} className="forecast-day">
                  <p>{day.date}</p>
                  <img src={day.day.condition.icon} alt="forecast icon" />
                  <p>
                    {convertTemp(day.day.avgtemp_c).toFixed(1)}°{unit}
                  </p>
                  <p>{day.day.condition.text}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
