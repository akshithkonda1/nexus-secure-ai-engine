import http from 'k6/http';
import { check, sleep, Trend } from 'k6';

export const options = {
  scenarios: {
    stress_debate: {
      executor: 'ramping-arrival-rate',
      startRate: 5,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 200,
      stages: [
        { duration: '5m', target: 50 },
        { duration: '5m', target: 100 },
        { duration: '5m', target: 200 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.02'],
  },
};

const debateLatency = new Trend('debate_latency');

export default function () {
  const models = ['gpt-4o', 'claude-3', 'vertex-gemini-pro', 'mistral-large', 'llama-3-70b', 'azure-gpt-4o', 'command-r', 'haiku', 'sonnet', 'nova'];
  const url = `${__ENV.RYUZEN_HOST || 'https://api.ryuzen.example.com'}/api/v1/ask`;
  const payload = JSON.stringify({
    prompt: 'Run a 10-model debate about resilience patterns',
    models,
    stream: false,
  });
  const res = http.post(url, payload, {
    headers: {
      'Content-Type': 'application/json',
      'X-Ryuzen-Key': __ENV.RYUZEN_API_KEY || 'dev-key',
    },
    tags: { endpoint: 'ask-stress' },
  });
  debateLatency.add(res.timings.duration);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'latency below 3s': (r) => r.timings.duration < 3000,
  });
  sleep(0.5);
}
