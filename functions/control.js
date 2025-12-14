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
    return { statusCode: 400, body: 'Invalid state' };
  }

  // Fire-and-forget: Connect, publish immediately, don't wait for confirm
  const client = mqtt.connect('tcp://broker.emqx.io:1883');

  client.publish('homeauto/tisha123/control', state, { qos: 1 });

  client.end();  // Close immediately

  // Always return success fast (command is sent)
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, message: `Command ${state} sent` }),
  };
};