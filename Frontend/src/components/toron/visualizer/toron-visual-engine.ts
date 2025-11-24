export type ToronEngineMode = "orbital" | "graph";

export type ToronEvent = {
  type: "thinking" | "response" | "error" | "spark";
  strength?: number;
};

interface ToronEngine {
  setMode: (mode: ToronEngineMode) => void;
  start: () => void;
  stop: () => void;
  triggerEvent: (evt: ToronEvent) => void;
}

interface Node {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  drift: number;
}

interface Spark {
  x: number;
  y: number;
  angle: number;
  speed: number;
  life: number;
}

export function createToronEngine(canvas: HTMLCanvasElement): ToronEngine {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context unavailable");
  }

  let mode: ToronEngineMode = "orbital";
  let frameId: number | null = null;
  let lastTime = performance.now();
  const nodes: Node[] = Array.from({ length: 22 }).map(() => ({
    angle: Math.random() * Math.PI * 2,
    radius: 72 + Math.random() * 120,
    speed: 0.0025 + Math.random() * 0.003,
    size: 2.2 + Math.random() * 2.6,
    drift: 0.8 + Math.random() * 0.8,
  }));

  const interaction = {
    thinking: 0,
    response: 0,
    error: 0,
  };

  const sparks: Spark[] = [];

  let corePulse = 0;
  let responseRipple = 0;

  const resizeObserver = new ResizeObserver(() => resize());

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  resizeObserver.observe(canvas);

  function spawnSparks() {
    const count = 8 + Math.floor(Math.random() * 5);
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      sparks.push({
        x: canvas.width / (window.devicePixelRatio || 1) / 2,
        y: canvas.height / (window.devicePixelRatio || 1) / 2,
        angle,
        speed: 2.5 + Math.random() * 1.5,
        life: 1,
      });
    }
  }

  function triggerEvent(evt: ToronEvent) {
    if (!evt?.type) return;
    const strength = Math.min(1, Math.max(0, evt.strength ?? 0.6));
    if (evt.type === "thinking") {
      interaction.thinking = Math.max(interaction.thinking, strength);
    }
    if (evt.type === "response") {
      interaction.response = Math.max(interaction.response, strength);
      responseRipple = 0;
    }
    if (evt.type === "error") {
      interaction.error = Math.max(interaction.error, strength);
    }
    if (evt.type === "spark") {
      spawnSparks();
    }
  }

  function update(dt: number) {
    interaction.thinking = Math.max(0, interaction.thinking - 0.014 * dt);
    interaction.response = Math.max(0, interaction.response - 0.017 * dt);
    interaction.error = Math.max(0, interaction.error - 0.015 * dt);

    if (interaction.response > 0) {
      responseRipple += 0.02 * dt;
    } else {
      responseRipple = 0;
    }

    corePulse += 0.08 * dt * (1 + interaction.thinking * 0.6);

    nodes.forEach((node) => {
      const modeMultiplier = mode === "graph" ? 0.6 : 1;
      node.angle += node.speed * dt * modeMultiplier;
      node.angle %= Math.PI * 2;
      node.drift += (Math.sin(corePulse * 0.2 + node.angle) * 0.0025 * dt);
    });

    for (let i = sparks.length - 1; i >= 0; i -= 1) {
      const spark = sparks[i];
      spark.x += Math.cos(spark.angle) * spark.speed * dt;
      spark.y += Math.sin(spark.angle) * spark.speed * dt;
      spark.life -= 0.04 * dt;
      if (spark.life <= 0) {
        sparks.splice(i, 1);
      }
    }
  }

  function drawCore(centerX: number, centerY: number) {
    const baseRadius = 28;
    const pulse = (Math.sin(corePulse) + 1) / 2;
    const thinkingBoost = 6 * interaction.thinking;
    const responseBoost = 4 * interaction.response;
    const radius = baseRadius + pulse * 6 + thinkingBoost + responseBoost;

    const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius * 1.2);
    gradient.addColorStop(0, "rgba(120, 200, 255, 0.95)");
    gradient.addColorStop(0.4, "rgba(64, 180, 255, 0.85)");
    gradient.addColorStop(1, "rgba(18, 61, 116, 0.65)");

    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.shadowColor = `rgba(90, 180, 255, ${0.35 + interaction.thinking * 0.3})`;
    ctx.shadowBlur = 24 + interaction.response * 24;
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    if (interaction.response > 0.1) {
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = `rgba(255, 255, 255, ${0.25 * interaction.response})`;
      ctx.arc(centerX, centerY, radius * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }

    if (interaction.error > 0.1) {
      ctx.globalCompositeOperation = "color";
      ctx.fillStyle = `rgba(255, 64, 64, ${interaction.error * 0.8})`;
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }

    if (interaction.thinking > 0.02) {
      const shimmerScale = 1.4 + interaction.thinking * 0.4;
      const shimmerGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.1,
        centerX,
        centerY,
        radius * shimmerScale
      );
      shimmerGradient.addColorStop(0, `rgba(255, 255, 255, ${0.25 * interaction.thinking})`);
      shimmerGradient.addColorStop(0.6, `rgba(180, 220, 255, ${0.12 * interaction.thinking})`);
      shimmerGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = shimmerGradient;
      ctx.fillRect(centerX - radius * shimmerScale, centerY - radius * shimmerScale, radius * shimmerScale * 2, radius * shimmerScale * 2);
    }

    ctx.restore();
  }

  function drawNodes(centerX: number, centerY: number) {
    nodes.forEach((node) => {
      const orbitRadius = node.radius * (1 + interaction.response * 0.08);
      const x = centerX + Math.cos(node.angle) * orbitRadius;
      const y = centerY + Math.sin(node.angle) * orbitRadius * 0.9;
      const pulse = (Math.sin(corePulse * node.drift + node.angle) + 1) / 2;
      const size = node.size * (1 + interaction.thinking * 0.2) + pulse * 0.4;

      ctx.beginPath();
      const redShift = interaction.error * 120;
      const green = 160 + pulse * 60;
      const blue = 255 - redShift * 0.2;
      const alpha = 0.55 + interaction.thinking * 0.2;
      ctx.fillStyle = `rgba(${80 + redShift}, ${green}, ${blue}, ${alpha})`;
      ctx.shadowColor = `rgba(90, 180, 255, ${0.4 + interaction.response * 0.3})`;
      ctx.shadowBlur = 14 + interaction.response * 10;
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      if (interaction.response > 0.1) {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.18 * interaction.response})`;
        ctx.scale(1 + interaction.response * 0.08, 1 + interaction.response * 0.08);
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
  }

  function drawRipples(centerX: number, centerY: number) {
    if (interaction.response <= 0.1) return;
    const radius = 40 + Math.min(responseRipple, 1.2) * 160;
    const opacity = Math.max(0, interaction.response * (1 - responseRipple / 1.2));
    if (opacity <= 0) return;

    ctx.beginPath();
    ctx.strokeStyle = `rgba(180, 230, 255, ${0.35 * opacity})`;
    ctx.lineWidth = 2 + interaction.response * 2;
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawSparks() {
    sparks.forEach((spark) => {
      const hue = 190 + Math.random() * 50;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, spark.life));
      ctx.shadowColor = `hsla(${hue}, 100%, 70%, ${spark.life})`;
      ctx.shadowBlur = 16 * spark.life;
      ctx.fillStyle = `hsla(${hue}, 90%, 70%, ${spark.life})`;

      ctx.beginPath();
      ctx.arc(spark.x, spark.y, 2 + (1 - spark.life) * 2, 0, Math.PI * 2);
      ctx.fill();

      const trailX = spark.x - Math.cos(spark.angle) * spark.speed * 3;
      const trailY = spark.y - Math.sin(spark.angle) * spark.speed * 3;
      ctx.strokeStyle = `hsla(${hue}, 100%, 80%, ${spark.life * 0.9})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(trailX, trailY);
      ctx.lineTo(spark.x, spark.y);
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawGlow(centerX: number, centerY: number, width: number, height: number) {
    if (interaction.error <= 0.05) return;
    ctx.save();
    const gradient = ctx.createRadialGradient(centerX, centerY, width * 0.2, centerX, centerY, Math.max(width, height));
    gradient.addColorStop(0, `rgba(255, 80, 80, ${0.12 * interaction.error})`);
    gradient.addColorStop(1, "rgba(255, 80, 80, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  function render() {
    frameId = requestAnimationFrame(render);
    const now = performance.now();
    const dt = Math.min(2.5, Math.max(0.5, (now - lastTime) / 16.67));
    lastTime = now;

    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    const centerX = width / 2;
    const centerY = height / 2;

    update(dt);

    ctx.clearRect(0, 0, width, height);

    drawGlow(centerX, centerY, width, height);
    drawRipples(centerX, centerY);
    drawCore(centerX, centerY);
    drawNodes(centerX, centerY);
    drawSparks();
  }

  function start() {
    if (frameId === null) {
      lastTime = performance.now();
      render();
    }
  }

  function stop() {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
    resizeObserver.disconnect();
  }

  function setMode(nextMode: ToronEngineMode) {
    mode = nextMode;
  }

  return {
    setMode,
    start,
    stop,
    triggerEvent,
  };
}
