import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '60s', target: 10 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<3000'],
    http_req_failed: ['rate<0.01'],
  },
};

const API_KEY = __ENV.NEXUS_API_KEY;
const BASE_URL = __ENV.NEXUS_BASE_URL || 'https://localhost:8443';

export default function () {
  const payload = JSON.stringify({ prompt: 'Summarise the latest platform release notes.' });
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    timeout: '30s',
  };

  const res = http.post(`${BASE_URL}/debate`, payload, params);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'result payload': (r) => r.json('result') !== '',
  });

  sleep(1);
}
