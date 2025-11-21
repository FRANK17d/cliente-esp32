import { useState, useEffect, useRef } from 'react';
import './App.css';

const WS_URL = 'wss://server-esp32-pda4.onrender.com'; // Tu servidor Render

function App() {
  const [ledState, setLedState] = useState('off');
  const [potValue, setPotValue] = useState(0);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    const connectWebSocket = () => {
      console.log('🔌 Conectando a WebSocket...');
      const ws = new WebSocket(WS_URL);
      
      ws.onopen = () => {
        console.log('✅ Conectado al servidor');
        setConnected(true);
        ws.send('WEB_CLIENT'); // Identificarse como cliente web
      };

      ws.onmessage = (event) => {
        console.log('📩 Mensaje recibido:', event.data);
        
        // Recibir valores del potenciómetro desde ESP32
        if (event.data.startsWith('POT:')) {
          const value = event.data.split(':')[1];
          setPotValue(value);
        }
      };

      ws.onclose = () => {
        console.log('❌ Desconectado del servidor');
        setConnected(false);
        // Reconectar después de 3 segundos
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error('❌ Error WebSocket:', error);
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const toggleLed = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const command = ledState === 'off' ? 'ON' : 'OFF';
      wsRef.current.send(command);
      setLedState(ledState === 'off' ? 'on' : 'off');
      console.log('💡 Comando enviado:', command);
    } else {
      console.error('❌ WebSocket no está conectado');
    }
  };

  const requestPotValue = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send('GET_POT');
      console.log('📊 Solicitando valor del potenciómetro');
    }
  };

  return (
    <div className="App">
      <h1>Control ESP32 - WebSocket</h1>
      
      <div className={`status ${connected ? 'connected' : 'disconnected'}`}>
        {connected ? '🟢 Conectado' : '🔴 Desconectado'}
      </div>

      <div className="led-section">
        <h2>💡 Control LED (Pin 12)</h2>
        <button 
          onClick={toggleLed}
          className={ledState === 'on' ? 'led-on' : 'led-off'}
          disabled={!connected}
        >
          {ledState === 'on' ? '💡 Apagar LED' : '🔆 Encender LED'}
        </button>
      </div>

      <div className="pot-section">
        <h2>📊 Potenciómetro (Pin 35)</h2>
        <div className="pot-value">
          <span>Valor actual: {potValue}</span>
        </div>
        <button onClick={requestPotValue} disabled={!connected}>
          🔄 Actualizar Valor
        </button>
      </div>
    </div>
  );
}

export default App;