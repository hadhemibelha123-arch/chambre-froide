// netlify/functions/proxy.js
exports.handler = async (event) => {
  const TB_BASE = 'http://finek.com.tn:9087';
  const USERNAME = 'tenant@thingsboard.org';
  const PASSWORD = 'tenant';

  try {
    const loginRes = await fetch(`${TB_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: USERNAME, password: PASSWORD })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;

    if (!token) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Login failed', detail: loginData }) };
    }

    const deviceId = 'c9f889c0-2e86-11f1-ba36-f7839916e796';
    const keys = [
      'ds18b20_temp', 'bc10_temp', 'bc10_hum', 'bc10_batt', 'alarm',
      'temp1_predite', 'temp2_predite', 'hum_predite',
      'ds18b20_failure_prob', 'ds18b20_risk', 'ds18b20_anomalie',
      'bc10_temp_failure_prob', 'bc10_temp_risk', 'bc10_temp_anomalie',
      'hum_failure_prob', 'hum_risk', 'hum_anomalie',
      'failure_probability', 'risk_level',
      'future_t5_temp1', 'future_t5_temp2', 'future_t5_hum',
      'future_t10_temp1', 'future_t10_temp2', 'future_t10_hum',
      'future_t20_temp1', 'future_t20_temp2', 'future_t20_hum',
    ].join(',');

    const dataRes = await fetch(
      `${TB_BASE}/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries?keys=${keys}`,
      { headers: { 'X-Authorization': `Bearer ${token}` } }
    );
    const data = await dataRes.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
