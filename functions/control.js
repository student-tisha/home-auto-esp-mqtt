const mqtt = require('mqtt');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { state } = JSON.parse(event.body || '{}');
  if (!['ON', 'OFF'].includes(state)) return { statusCode: 400, body: 'Invalid state' };

  const client = mqtt.connect('tcp://broker.hivemq.com:1883');

  return new Promise((resolve) => {
    client.on('connect', () => {
      client.publish('homeauto/tisha123/control', state, { qos: 1 }, () => {
        client.end();
        resolve({ statusCode: 200, body: JSON.stringify({ success: true }) });
      });
    });
    client.on('error', () => resolve({ statusCode: 500, body: 'MQTT error' }));
  });
};