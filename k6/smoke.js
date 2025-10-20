import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = { vus: 1, iterations: 1 };

export default function () {
  const base = __ENV.BASE_URL || 'http://localhost:8080';
  // Gate on readiness
  let ready = false;
  for (let i = 0; i < 30; i++) {
    const r = http.get(`${base}/readyz`, { timeout: '5s' });
    if (r.status === 200) { ready = true; break; }
    sleep(1);
  }
  if (!ready) { throw new Error('Service never became ready'); }

  const res = http.post(`${base}/debate`, JSON.stringify({
    prompt: "Hello from k6 smoke",
    deadline_ms: 4000,
    want_photos: false
  }), { headers: { 'Content-Type': 'application/json' } });

  check(res, { 'status 200': (r) => r.status === 200 });
}
