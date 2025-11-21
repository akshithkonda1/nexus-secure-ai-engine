import http from 'k6/http';
import { check, sleep, Trend } from 'k6';

export const options = {
  vus: 50,
  duration: '10m',
  thresholds: {
    http_req_duration: ['p(95)<1200'],
  },
};

const latency = new Trend('ask_latency');

export default function () {
  const url = `${__ENV.RYUZEN_HOST || 'https://api.ryuzen.example.com'}/api/v1/ask`;
  const payload = JSON.stringify({
    prompt: 'Baseline load test',
    model: 'gpt-4o',
    stream: false,
  });
  const res = http.post(url, payload, {
    headers: {
      'Content-Type': 'application/json',
      'X-Ryuzen-Key': __ENV.RYUZEN_API_KEY || 'dev-key',
    },
    tags: { endpoint: 'ask' },
  });
  latency.add(res.timings.duration);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'body has output': (r) => r.json('output') !== undefined,
  });
  sleep(1);
}
