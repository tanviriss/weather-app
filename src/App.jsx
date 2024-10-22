import { useState, useEffect } from 'react';
import './App.css';

const api_key = import.meta.env.REACT_APP_WEATHER_API_KEY

function App() {
  const [weather, setWeather] = useState([]);
  
  useEffect(() => {
    const fetchWeather = async () => {
    try {
      const response = await fetch(`http://api.weatherstack.com/current?access_key=${api_key}&query=New York`);
      const data = await response.json();
      setWeather(data);
      console.log(data);
    } catch (error) {
      
    }
  }
  fetchWeather();
  }, []);

  return (
    <>
      {/* Render matches or any other UI */}
    </>
  );
}

export default App;