const mqtt = require('mqtt');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let state;
  try {
    const body = JSON.parse(event.body || '{}');
    state = body.state;
  } catch (e) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  if (!['ON', 'OFF'].includes(state)) {
    return { statusCode: 400, body: 'Invalid state: use ON or OFF' };
  }

  const client = mqtt.connect('tcp://broker.emqx.io:1883');  // Standard TCP for serverless

  return new Promise((resolve) => {
    client.on('connect', () => {
      client.publish('homeauto/tisha123/control', state, { qos: 1 }, (err) => {
        if (err) {
          console.error('Publish error:', err);
          resolve({ statusCode: 500, body: 'MQTT publish failed' });
        } else {
          resolve({ statusCode: 200, body: JSON.stringify({ success: true, state }) });
        }
        client.end();
      });
    });

    client.on('error', (err) => {
      console.error('MQTT connection error:', err);
      resolve({ statusCode: 500, body: 'MQTT connection failed' });
      client.end();
    });

    // Timeout if no connect in 5 seconds
    setTimeout(() => {
      if (client.connected) return;
      resolve({ statusCode: 504, body: 'MQTT timeout' });
      client.end();
    }, 5000);
  });
};