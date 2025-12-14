import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';

function App() {
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);

  useEffect(() => {
    const client = mqtt.connect('ws://broker.hivemq.com:8000/mqtt');  // WebSocket for browser
    client.on('connect', () => {
      console.log('Connected to MQTT');
      client.subscribe('homeauto/your-unique-id/data');
    });
    client.on('message', (topic, message) => {
      if (topic === 'homeauto/your-unique-id/data') {
        const data = JSON.parse(message.toString());
        setTemperature(data.temperature);
        setHumidity(data.humidity);
      }
    });
    return () => client.end();
  }, []);

    const sendControl = async (state) => {
    try {
      const response = await fetch('/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state }),
      });
      if (!response.ok) {
        console.error('Control API error:', response.status);
      } else {
        console.log(`Sent ${state} successfully`);
      }
    } catch (error) {
      console.error('Error sending control (normal during load):', error);
      // Don't crash the app!
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Home Automation Dashboard</h1>
      <p>Temperature: {temperature ? `${temperature} °C` : 'Loading...'}</p>
      <p>Humidity: {humidity ? `${humidity} %` : 'Loading...'}</p>
      <button onClick={() => sendControl('ON')}>Turn ON</button>
      <button onClick={() => sendControl('OFF')}>Turn OFF</button>
    </div>
  );
}

export default App;