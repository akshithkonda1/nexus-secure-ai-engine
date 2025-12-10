import http from 'k6/http';
import { sleep } from 'k6';

const target = __ENV.TORON_TARGET_URL || 'http://localhost:8080/api/v1/ask';
const payload = JSON.stringify({
  prompt: 'Load test prompt for Toron v2.5H+ simulation.'
});
const params = { headers: { 'Content-Type': 'application/json' } };

export let options = {
  scenarios: {
    stress_test: {
      executor: 'constant-arrival-rate',
      rate: 30, // 30 requests per second
      timeUnit: '1s',
      duration: '2m', // 2 minutes
      preAllocatedVUs: 1500,
      maxVUs: 2000,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<800'], // p95 under 800ms
    http_req_failed: ['rate<0.01'], // <1% failures
  },
};

export default function () {
  http.post(target, payload, params);
  sleep(0.01);
}
