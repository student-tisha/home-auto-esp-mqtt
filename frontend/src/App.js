import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';

function App() {
  const [temperature, setTemperature] = useState('Loading...');
  const [humidity, setHumidity] = useState('Loading...');
  const [connectionStatus, setConnectionStatus] = useState('Connecting to sensor...');

  useEffect(() => {
    let client;
    try {
    client = mqtt.connect('wss://broker.hivemq.com:8000/mqtt');     
      client.on('connect', () => {
        setConnectionStatus('Connected! Waiting for data...');
        client.subscribe('homeauto/tisha123/data');  // ← CHANGE TO YOUR UNIQUE ID
      });

      client.on('message', (topic, message) => {
        if (topic === 'homeauto/tisha123/data') {  // ← CHANGE TO YOUR UNIQUE ID
          try {
            const data = JSON.parse(message.toString());
            setTemperature(data.temperature !== undefined ? `${data.temperature} °C` : 'No data');
            setHumidity(data.humidity !== undefined ? `${data.humidity} %` : 'No data');
            setConnectionStatus('Live data received!');
          } catch (e) {
            console.error('Bad JSON:', e);
          }
        }
      });

      client.on('error', (err) => {
        setConnectionStatus('MQTT Error - Check console');
        console.error('MQTT Error:', err);
      });
    } catch (err) {
      setConnectionStatus('Failed to connect');
      console.error('MQTT Setup Error:', err);
    }

    return () => {
      if (client) client.end();
    };
  }, []);

  const sendControl = async (state) => {
    try {
      const response = await fetch('/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state }),
      });
      if (response.ok) {
        alert(`Turned ${state} successfully!`);
      } else {
        alert('Control failed - check if device is online');
      }
    } catch (error) {
      alert('Control API not available yet (normal on first load)');
      console.error('Control error:', error);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'Arial' }}>
      <h1>Home Automation Dashboard</h1>
      <p><strong>Temperature:</strong> {temperature}</p>
      <p><strong>Humidity:</strong> {humidity}</p>
      <p><em>{connectionStatus}</em></p>
      <div style={{ marginTop: '30px' }}>
        <button onClick={() => sendControl('ON')} style={{ padding: '10px 20px', fontSize: '18px', margin: '10px' }}>
          Turn ON (Fan/Heater)
        </button>
        <button onClick={() => sendControl('OFF')} style={{ padding: '10px 20px', fontSize: '18px', margin: '10px' }}>
          Turn OFF
        </button>
      </div>
    </div>
  );
}

export default App;