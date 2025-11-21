import http from 'k6/http';
import { check, sleep, Trend } from 'k6';

export const options = {
  vus: 30,
  duration: '6h',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(99)<4000'],
  },
};

const soakLatency = new Trend('soak_latency');

export default function () {
  const host = __ENV.RYUZEN_HOST || 'https://api.ryuzen.example.com';
  const res = http.get(`${host}/api/v1/telemetry/summary`, {
    headers: { 'X-Ryuzen-Key': __ENV.RYUZEN_API_KEY || 'dev-key' },
    tags: { endpoint: 'telemetry-summary' },
  });
  soakLatency.add(res.timings.duration);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has health score': (r) => r.json('engine_health_score') !== undefined,
  });
  sleep(5);
}
