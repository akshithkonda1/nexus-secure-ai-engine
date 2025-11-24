import { VisNode } from "./VisNode";

type ToronMode = "orbital" | "graph";

interface GraphPoint {
  x: number;
  baseY: number;
  drift: number;
}

export function createToronEngine(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("2D context not supported");
  }

  let mode: ToronMode = "orbital";
  let nodes: VisNode[] = [];
  let graphPoints: GraphPoint[] = [];
  let frameId: number | null = null;
  let pulseTime = 0;
  let lastTime = 0;
  const mouse = { x: 0, y: 0 };

  const css = getComputedStyle(document.documentElement);
  const coreColor1 = css.getPropertyValue("--toron-core-c1").trim() || "#7c3aed";
  const coreColor2 = css.getPropertyValue("--toron-core-c2").trim() || "#1d4ed8";
  const coreColor3 = css.getPropertyValue("--toron-core-c3").trim() || "#10b981";

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initNodes();
    initGraph();
  }

  function randomBetween(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  function initNodes() {
    const { width, height } = canvas;
    const center = Math.min(width, height) / (window.devicePixelRatio || 1);
    const innerCount = Math.round(randomBetween(6, 8));
    const outerCount = Math.round(randomBetween(10, 14));
    const innerRadius = center * 0.18;
    const outerRadius = center * 0.32;

    nodes = [];
    for (let i = 0; i < innerCount + outerCount; i += 1) {
      const isOuter = i >= innerCount;
      const orbitRadius = isOuter ? outerRadius : innerRadius;
      nodes.push({
        x: 0,
        y: 0,
        radius: randomBetween(3, 6),
        baseRadius: randomBetween(3, 6),
        driftOffsetX: Math.random() * Math.PI * 2,
        driftOffsetY: Math.random() * Math.PI * 2,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitSpeed: randomBetween(isOuter ? 0.003 : 0.005, isOuter ? 0.007 : 0.01),
        orbitRadius,
      });
    }
  }

  function initGraph() {
    const { width, height } = canvas.getBoundingClientRect();
    const count = 40;
    graphPoints = Array.from({ length: count }, (_, i) => {
      const t = i / (count - 1);
      return {
        x: t * width,
        baseY: height * 0.5 + Math.sin(t * Math.PI * 2) * height * 0.05,
        drift: randomBetween(14, 34),
      };
    });
  }

  function updatePulse(delta: number) {
    pulseTime += delta * 0.0015;
  }

  function drawPulse() {
    const { width, height } = canvas.getBoundingClientRect();
    const parallaxX = mouse.x * 0.015;
    const parallaxY = mouse.y * 0.015;
    const cx = width / 2 + parallaxX;
    const cy = height / 2 + parallaxY;
    const base = Math.min(width, height) * 0.09;
    const pulse = Math.sin(pulseTime * 2.5) * 10;
    const radius = base + pulse;

    const gradient = ctx.createRadialGradient(cx, cy, radius * 0.4, cx, cy, radius * 1.4);
    gradient.addColorStop(0, coreColor1);
    gradient.addColorStop(0.45, coreColor2 + "dd");
    gradient.addColorStop(1, coreColor3 + "00");

    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = coreColor2;
    ctx.shadowBlur = 25;
    ctx.strokeStyle = coreColor2;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  function drawOrbitalNodes() {
    const { width, height } = canvas.getBoundingClientRect();
    const parallaxX = mouse.x * 0.015;
    const parallaxY = mouse.y * 0.015;
    const cx = width / 2 + parallaxX;
    const cy = height / 2 + parallaxY;
    const pointerX = width / 2 + mouse.x;
    const pointerY = height / 2 + mouse.y;

    nodes.forEach((node, idx) => {
      const driftX = Math.sin(pulseTime + node.driftOffsetX) * 4;
      const driftY = Math.cos(pulseTime + node.driftOffsetY) * 4;
      node.orbitAngle += node.orbitSpeed;
      node.x = cx + Math.cos(node.orbitAngle) * node.orbitRadius + driftX;
      node.y = cy + Math.sin(node.orbitAngle) * node.orbitRadius + driftY;

      const sizePulse = Math.sin(pulseTime * 2 + idx) * 0.4;
      node.radius = node.baseRadius + sizePulse;

      const distance = Math.hypot(pointerX - node.x, pointerY - node.y);
      const hoverBoost = Math.max(0, 1 - distance / 28) * 2.5;
      const renderRadius = Math.max(1.5, node.radius + hoverBoost);

      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = coreColor3;
      ctx.shadowColor = coreColor1;
      ctx.shadowBlur = 10 + hoverBoost * 2;
      ctx.arc(node.x, node.y, renderRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawGraph() {
    const { width, height } = canvas.getBoundingClientRect();
    const parallaxX = mouse.x * 0.015;
    const parallaxY = mouse.y * 0.015;

    ctx.save();
    ctx.translate(parallaxX, parallaxY);

    ctx.beginPath();
    const amplitude = Math.sin(pulseTime * 2) * 12 + 28;
    graphPoints.forEach((point, idx) => {
      const phase = pulseTime * 0.5 + point.x * 0.015;
      const y = point.baseY + Math.sin(phase) * point.drift + Math.sin(point.x * 0.15) * 4;
      const adjustedY = y + Math.sin(pulseTime + idx * 0.2) * 3 + amplitude * 0.05;

      if (idx === 0) {
        ctx.moveTo(point.x, adjustedY);
      } else {
        const prev = graphPoints[idx - 1];
        const cp1x = prev.x + (point.x - prev.x) / 3;
        const cp1y = prev.baseY + Math.sin(phase - 0.3) * prev.drift;
        const cp2x = point.x - (point.x - prev.x) / 3;
        const cp2y = point.baseY + Math.sin(phase + 0.3) * point.drift;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, point.x, adjustedY);
      }
    });

    ctx.strokeStyle = coreColor2;
    ctx.lineWidth = 2;
    ctx.shadowColor = coreColor1 + "55";
    ctx.shadowBlur = 14;
    ctx.stroke();
    ctx.restore();
  }

  function draw(timestamp: number) {
    const delta = lastTime === 0 ? 16 : timestamp - lastTime;
    lastTime = timestamp;
    const { width, height } = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);

    updatePulse(delta);
    drawPulse();

    if (mode === "orbital") {
      drawOrbitalNodes();
    } else {
      drawGraph();
    }

    frameId = window.requestAnimationFrame(draw);
  }

  function start() {
    if (frameId !== null) return;
    resize();
    frameId = window.requestAnimationFrame(draw);
  }

  function stop() {
    if (frameId !== null) {
      window.cancelAnimationFrame(frameId);
      frameId = null;
    }
    window.removeEventListener("resize", resize);
    window.removeEventListener("mousemove", handleMouseMove);
  }

  function setMode(nextMode: ToronMode) {
    mode = nextMode;
  }

  function handleMouseMove(event: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left - rect.width / 2;
    mouse.y = event.clientY - rect.top - rect.height / 2;
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", handleMouseMove);
  resize();

  return {
    setMode,
    start,
    stop,
  };
}
