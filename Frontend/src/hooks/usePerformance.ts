import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  updateCount: number;
}

export function usePerformance(componentName: string): PerformanceMetrics {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());
  const metrics = useRef<PerformanceMetrics>({
    renderTime: 0,
    updateCount: 0,
  });

  useEffect(() => {
    renderCount.current += 1;
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;

    metrics.current = {
      renderTime,
      updateCount: renderCount.current,
    };

    if (import.meta.env.DEV) {
      console.log(`⚡ ${componentName}:`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        renderCount: renderCount.current,
      });
    }

    // Mark for Performance Observer
    performance.mark(`${componentName}-render-end`);
    performance.measure(
      `${componentName}-render`,
      `${componentName}-render-start`,
      `${componentName}-render-end`
    );
  });

  // Mark start of render
  performance.mark(`${componentName}-render-start`);

  return metrics.current;
}
