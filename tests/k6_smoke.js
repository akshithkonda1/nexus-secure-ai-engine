import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '2m',
  thresholds: {
    http_req_duration: ['p(95)<800'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const headers = { 'x-alpha-token': `${__ENV.ALPHA_ACCESS_TOKEN || ''}` };
  let res = http.get(`${__ENV.BASE_URL}/healthz`, { headers });
  check(res, { 'health 200': (r) => r.status === 200 });

  res = http.get(`${__ENV.BASE_URL}/readyz`, { headers });
  check(res, { 'ready 200': (r) => r.status === 200 });

  // Uncomment when your ask endpoint is ready:
  // res = http.post(`${__ENV.BASE_URL}/api/v1/ask`, JSON.stringify({ q: "ping" }), {
  //   headers: { ...headers, 'Content-Type': 'application/json' }
  // });
  // check(res, { 'ask 200': (r) => r.status === 200 });

  sleep(1);
}
