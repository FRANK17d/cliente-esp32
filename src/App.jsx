import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const serverUrl = 'https://e59d3bedfe58.ngrok-free.app';

function App() {
  const [ledState, setLedState] = useState('off');
  const [potValue, setPotValue] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);

  const toggleLed = async () => {
    const newState = ledState === 'on' ? 'off' : 'on';
    try {
      await axios.get(`${serverUrl}/led/${newState}`);
      setLedState(newState);
    } catch (error) {
      console.error('Error cambiando el estado del LED:', error);
    }
  };

  const sendPotValue = async (value) => {
    try {
      const formData = new URLSearchParams();
      formData.append('value', value);
      
      await axios.post(`${serverUrl}/potenciometro`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      console.log('Valor enviado:', value);
    } catch (error) {
      console.error('Error enviando valor del potenciómetro:', error);
    }
  };

  const handleSliderChange = (e) => {
    const value = e.target.value;
    setSliderValue(value);
    sendPotValue(value);
  };

  const fetchPotValue = async () => {
    try {
      const response = await axios.get(`${serverUrl}/potenciometro`);
      setPotValue(response.data.split(': ')[1]);
    } catch (error) {
      console.error('Error obteniendo el valor del potenciómetro:', error);
    }
  };

  useEffect(() => {
    fetchPotValue();
    const interval = setInterval(() => {
      fetchPotValue();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <h1>Control de LED y Potenciómetro con ESP32</h1>

      <button onClick={toggleLed}>
        {ledState === 'on' ? '💡 Apagar LED' : '🔆 Encender LED'}
      </button>

      <div className="pot-section">
        <h3>Simular Potenciómetro</h3>
        <input 
          type="range" 
          min="0" 
          max="4095" 
          value={sliderValue}
          onChange={handleSliderChange}
          className="slider"
        />
        <p>Valor enviado: {sliderValue}</p>
      </div>

      <div className="pot-value">
        <h3>Valor actual del Potenciómetro: {potValue}</h3>
      </div>
    </div>
  );
}

export default App;
