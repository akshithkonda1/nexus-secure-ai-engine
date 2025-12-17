import { useEffect, useMemo, useState } from "react";

export type DeviceClass = "mobile" | "tablet" | "laptop" | "desktop" | "ultrawide";

export interface WorkspaceEnvelope {
  device: DeviceClass;
  viewportWidth: number;
  operatingSpan: number;
  canvasWidth: number;
  leftWidgetWidth: number;
  rightWidgetWidth: number;
  mode: "full" | "compressed" | "stacked";
}

const deviceBreakpoints: { device: DeviceClass; max: number }[] = [
  { device: "mobile", max: 640 },
  { device: "tablet", max: 980 },
  { device: "laptop", max: 1366 },
  { device: "desktop", max: 1920 },
];

const deviceMin: Record<DeviceClass, number> = {
  mobile: 320,
  tablet: 720,
  laptop: 1024,
  desktop: 1280,
  ultrawide: 1600,
};

const deviceMax: Record<DeviceClass, number> = {
  mobile: 640,
  tablet: 1180,
  laptop: 1680,
  desktop: 2048,
  ultrawide: 2560,
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getDeviceClass = (viewportWidth: number): DeviceClass => {
  const found = deviceBreakpoints.find((entry) => viewportWidth <= entry.max);
  return found ? found.device : "ultrawide";
};

export const computeWorkspaceEnvelope = (viewportWidth: number): WorkspaceEnvelope => {
  const device = getDeviceClass(viewportWidth);
  const operatingSpan = clamp(viewportWidth, deviceMin[device], deviceMax[device]);

  const canvasMin = device === "mobile" ? 360 : device === "tablet" ? 720 : 960;
  const canvasIdeal = device === "ultrawide" ? 1320 : device === "desktop" ? 1180 : device === "laptop" ? 1080 : canvasMin;

  const preferredLeft = device === "mobile" ? 0 : device === "tablet" ? 240 : device === "laptop" ? 260 : device === "desktop" ? 280 : 320;
  const preferredRight = device === "mobile" ? 0 : device === "tablet" ? 200 : device === "laptop" ? 220 : device === "desktop" ? 240 : 260;
  const minLeft = device === "mobile" ? 0 : 200;
  const minRight = device === "mobile" ? 0 : 180;

  let mode: WorkspaceEnvelope["mode"] = device === "mobile" ? "stacked" : "full";
  let canvasWidth = clamp(canvasIdeal, canvasMin, operatingSpan);
  let leftWidgetWidth = preferredLeft;
  let rightWidgetWidth = preferredRight;

  if (canvasWidth + preferredLeft + preferredRight > operatingSpan) {
    mode = mode === "stacked" ? "stacked" : "compressed";
    const availableForWidgets = Math.max(operatingSpan - canvasWidth, 0);
    const totalPreferred = preferredLeft + preferredRight || 1;
    let compressedRight = Math.max(minRight, Math.floor((preferredRight / totalPreferred) * availableForWidgets));
    let compressedLeft = Math.max(minLeft, availableForWidgets - compressedRight);

    if (compressedLeft + compressedRight > availableForWidgets) {
      const overflow = compressedLeft + compressedRight - availableForWidgets;
      const reducibleRight = Math.max(compressedRight - minRight, 0);
      const reduceRightBy = Math.min(overflow, reducibleRight);
      compressedRight -= reduceRightBy;
      const remainingOverflow = overflow - reduceRightBy;
      if (remainingOverflow > 0 && compressedLeft > minLeft) {
        compressedLeft = Math.max(minLeft, compressedLeft - remainingOverflow);
      }
    }

    leftWidgetWidth = compressedLeft;
    rightWidgetWidth = compressedRight;

    if (canvasWidth + leftWidgetWidth + rightWidgetWidth > operatingSpan && mode !== "stacked") {
      mode = "stacked";
      leftWidgetWidth = 0;
      rightWidgetWidth = 0;
      canvasWidth = operatingSpan;
    }
  }

  if (mode === "stacked") {
    leftWidgetWidth = 0;
    rightWidgetWidth = 0;
    canvasWidth = clamp(operatingSpan, canvasMin, deviceMax[device]);
  }

  if (canvasWidth < canvasMin && mode !== "stacked") {
    canvasWidth = canvasMin;
    const widgetBudget = Math.max(operatingSpan - canvasWidth, 0);
    const widgetMinTotal = minLeft + minRight;
    if (widgetBudget < widgetMinTotal) {
      mode = "stacked";
      leftWidgetWidth = 0;
      rightWidgetWidth = 0;
      canvasWidth = clamp(operatingSpan, canvasMin, deviceMax[device]);
    } else {
      const ratio = widgetBudget / widgetMinTotal;
      leftWidgetWidth = Math.round(minLeft * ratio);
      rightWidgetWidth = Math.round(minRight * ratio);
    }
  }

  return {
    device,
    viewportWidth,
    operatingSpan,
    canvasWidth,
    leftWidgetWidth,
    rightWidgetWidth,
    mode,
  };
};

export const useWorkspaceEnvelope = (): WorkspaceEnvelope => {
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window !== "undefined" ? window.innerWidth : deviceMax.desktop));

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return useMemo(() => computeWorkspaceEnvelope(viewportWidth), [viewportWidth]);
};
