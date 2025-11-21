import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const serverUrl = 'http://61bd0b515bfb.ngrok-free.app'; // ⚠️ HTTP

function App() {
  const [led1State, setLed1State] = useState('off');
  const [led2State, setLed2State] = useState('off');
  const [potValue, setPotValue] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);

  const toggleLed1 = async () => {
    const newState = led1State === 'on' ? 'off' : 'on';
    try {
      await axios.get(`${serverUrl}/led1/${newState}`);
      setLed1State(newState);
    } catch (error) {
      console.error('Error cambiando el estado del LED 1:', error);
    }
  };

  const toggleLed2 = async () => {
    const newState = led2State === 'on' ? 'off' : 'on';
    try {
      await axios.get(`${serverUrl}/led2/${newState}`);
      setLed2State(newState);
    } catch (error) {
      console.error('Error cambiando el estado del LED 2:', error);
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
      <h1>Control de 2 LEDs y Potenciómetro con ESP32</h1>

      <div className="led-controls">
        <div className="led-section">
          <h2>💡 LED 1 (Pin 12)</h2>
          <button 
            onClick={toggleLed1}
            className={led1State === 'on' ? 'led-on' : 'led-off'}
          >
            {led1State === 'on' ? '💡 Apagar LED 1' : '🔆 Encender LED 1'}
          </button>
        </div>

        <div className="led-section">
          <h2>💡 LED 2 (Pin 26)</h2>
          <button 
            onClick={toggleLed2}
            className={led2State === 'on' ? 'led-on' : 'led-off'}
          >
            {led2State === 'on' ? '💡 Apagar LED 2' : '🔆 Encender LED 2'}
          </button>
        </div>
      </div>

      <div className="pot-section">
        <h3>🎚️ Simular Potenciómetro</h3>
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