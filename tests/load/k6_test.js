import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  vus: 500,
  duration: '60s',
};

export default function () {
  let payload = JSON.stringify({
    prompt: "k6 load test",
    stream: false
  });

  let res = http.post("http://localhost:8080/api/v1/ask", payload, {
    headers: { "Content-Type": "application/json" }
  });

  check(res, { "status 200": (r) => r.status === 200 });

  sleep(1);
}
