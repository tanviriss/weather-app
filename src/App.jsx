import React, { useState, useEffect } from 'react';
import { Search, Cloud, Wind, Thermometer, Droplets, Loader } from 'lucide-react';

const API_KEY = import.meta.env.VITE_APP_WEATHER_API_KEY;
const BASE_URL = 'http://api.weatherstack.com/current';

const defaultCities = ['London', 'New York', 'Tokyo', 'Paris', 'Sydney', 'Dubai'];

const WeatherDashboard = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    temperature: 'all',
    cloudCover: 'all'
  });

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('API_KEY:', API_KEY);
        const promises = defaultCities.map(async (city) => {
          const response = await fetch(
            `${BASE_URL}?access_key=${API_KEY}&query=${encodeURIComponent(city)}`
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.error) {
            throw new Error(data.error.info || 'API Error');
          }

          return data;
        });

        const results = await Promise.all(promises);
        setWeatherData(results);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching weather data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  const summaryStats = weatherData.length > 0 ? {
    avgTemp: weatherData.reduce((acc, city) => acc + city.current.temperature, 0) / weatherData.length,
    avgHumidity: weatherData.reduce((acc, city) => acc + city.current.humidity, 0) / weatherData.length,
    avgWindSpeed: weatherData.reduce((acc, city) => acc + city.current.wind_speed, 0) / weatherData.length
  } : { avgTemp: 0, avgHumidity: 0, avgWindSpeed: 0 };

  const filteredData = weatherData.filter(city => {
    const matchesSearch = city.location.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTemp = filters.temperature === 'all' || 
      (filters.temperature === 'hot' && city.current.temperature > 20) ||
      (filters.temperature === 'cold' && city.current.temperature <= 20);
    const matchesCloud = filters.cloudCover === 'all' ||
      (filters.cloudCover === 'cloudy' && city.current.cloudcover > 50) ||
      (filters.cloudCover === 'clear' && city.current.cloudcover <= 50);

    return matchesSearch && matchesTemp && matchesCloud;
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="p-6 bg-white border border-red-200 shadow-md rounded-lg">
          <h2 className="text-red-600 text-lg font-semibold">Error Loading Weather Data</h2>
          <p className="text-gray-700">{error}</p>
          <p className="mt-4 text-sm text-gray-500">Please check your API key and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-900">Weather Dashboard</h1>
          {loading && (
            <div className="flex items-center text-blue-600 gap-2">
              <Loader className="h-5 w-5 animate-spin" />
              <span>Loading data...</span>
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors">
            <div className="flex justify-between pb-2">
              <span className="text-sm font-medium">Average Temperature</span>
              <Thermometer className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">{summaryStats.avgTemp.toFixed(1)}°C</div>
          </div>
          <div className="bg-blue-400 text-white p-4 rounded-lg hover:bg-blue-500 transition-colors">
            <div className="flex justify-between pb-2">
              <span className="text-sm font-medium">Average Humidity</span>
              <Droplets className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">{summaryStats.avgHumidity.toFixed(1)}%</div>
          </div>
          <div className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors">
            <div className="flex justify-between pb-2">
              <span className="text-sm font-medium">Average Wind Speed</span>
              <Wind className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">{summaryStats.avgWindSpeed.toFixed(1)} km/h</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-lg border border-blue-100">
            <Search className="h-5 w-5 text-blue-500" />
            <input
              type="text"
              placeholder="Search cities..."
              className="flex-1 outline-none text-blue-900 placeholder-blue-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex space-x-4">
            <select
              className="p-2 rounded-lg border border-blue-200 bg-white text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={filters.temperature}
              onChange={(e) => setFilters({ ...filters, temperature: e.target.value })}
            >
              <option value="all">All Temperatures</option>
              <option value="hot">Hot (&gt;20°C)</option>
              <option value="cold">Cold (≤20°C)</option>
            </select>

            <select
              className="p-2 rounded-lg border border-blue-200 bg-white text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={filters.cloudCover}
              onChange={(e) => setFilters({ ...filters, cloudCover: e.target.value })}
            >
              <option value="all">All Cloud Cover</option>
              <option value="cloudy">Cloudy (&gt;50%)</option>
              <option value="clear">Clear (≤50%)</option>
            </select>
          </div>
        </div>

        {/* Weather Data List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((city, index) => (
            <div key={index} className="bg-white hover:shadow-lg transition-shadow border border-blue-100 rounded-lg">
              <div className="border-b border-blue-50 p-4">
                <h3 className="text-blue-900 font-bold">{city.location.name}</h3>
                <p className="text-sm text-blue-500">{city.location.country}</p>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between text-blue-800">
                  <span className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Temperature:
                  </span>
                  <span className="font-semibold">{city.current.temperature}°C</span>
                </div>
                <div className="flex items-center justify-between text-blue-800">
                  <span className="flex items-center gap-2">
                    <Droplets className="h-4 w-4" />
                    Humidity:
                  </span>
                  <span className="font-semibold">{city.current.humidity}%</span>
                </div>
                <div className="flex items-center justify-between text-blue-800">
                  <span className="flex items-center gap-2">
                    <Wind className="h-4 w-4" />
                    Wind Speed:
                  </span>
                  <span className="font-semibold">{city.current.wind_speed} km/h</span>
                </div>
                <div className="flex items-center justify-between text-blue-800">
                  <span className="flex items-center gap-2">
                    <Cloud className="h-4 w-4" />
                    Cloud Cover:
                  </span>
                  <span className="font-semibold">{city.current.cloudcover}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;
